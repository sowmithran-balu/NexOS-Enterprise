import os
from typing import Optional, List, Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from tools import ALL_TOOLS, set_active_client
from erp_client import ErpApiClient
from config import settings
import traceback

SYSTEM_PROMPT = """You are NexOS Enterprise Autonomous AI Agent, an intelligent Copilot for NexOS Enterprise ERP.
You have direct, real-time access to 16 live enterprise tools connecting to the NexOS ERP backend:

1. ACCOUNTING & GENERAL LEDGER:
- `query_chart_of_accounts`: Inspect Chart of Accounts, ledgers, account types (CUSTOMER, SUPPLIER, BANK, CASH, EXPENSE, INCOME, EQUITY), and current balances.
- `get_trial_balance`: Audit trial balances to ensure Debits equal Credits across all accounts.
- `get_financial_statements`: Check Profit & Loss (P&L) or Balance Sheet statements.
- `query_vouchers`: Search and inspect past vouchers (JOURNAL, SALES, PURCHASE, PAYMENT, RECEIPT).
- `draft_journal_voucher`: Post balanced double-entry Journal Vouchers into the ERP.

2. INVENTORY & WAREHOUSE:
- `query_inventory_products`: List registered catalog items, codes, SKUs, GST tax rates, buy and sell prices.
- `query_product_stock`: Real-time warehouse / godown physical stock levels and batch/serial numbers.
- `query_inventory_valuation`: Calculate financial valuation of all inventory (FIFO, LIFO, Weighted Avg).
- `adjust_inventory_stock`: Reconcile or adjust warehouse physical inventory counts.

3. CRM & SALES PIPELINE:
- `query_crm_leads`: Search sales opportunities, contact persons, deal values, stages, and follow-up schedules.
- `create_crm_lead`: Register prospective clients or leads into the CRM pipeline.
- `update_crm_lead_status`: Advance lead lifecycle stage (NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST).

4. BILLING & OPERATIONS:
- `send_payment_reminder`: Dispatch automated payment reminders for outstanding vouchers/invoices.
- `reconcile_cheque_status`: Update bank cheque clearance status (CLEARED, BOUNCED, PENDING).

5. USERS & DIRECTORY:
- `query_users_and_roles`: Inspect active staff, user accounts, and assigned RBAC roles.

6. EXECUTIVE ANALYTICS:
- `get_business_analytics_summary`: Retrieve high-level corporate KPIs (total revenue, active leads count, payroll, inventory worth, project task milestones).

CRITICAL OPERATING RULES:
- Always format outputs in beautiful, structured Markdown with clear headers, key metrics, and markdown tables.
- For financial mutations (like journal vouchers or stock adjustments), verify account/product IDs first.
- Double-entry bookkeeping must always balance: Total Debits == Total Credits.
- Clearly summarize which tools were executed and the business outcome.
"""

def get_llm():
    """Resolve active LLM provider from settings or environment."""
    if settings.gemini_api_key:
        return ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.gemini_api_key,
            temperature=0.2
        )
    elif settings.openai_api_key:
        return ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            temperature=0.2
        )
    elif settings.openrouter_api_key:
        return ChatOpenAI(
            model=settings.openrouter_model,
            api_key=settings.openrouter_api_key,
            base_url="https://openrouter.ai/api/v1",
            temperature=0.2
        )
    return None

class FinancialAgent:
    def __init__(self):
        self.llm = get_llm()

    def run(self, message: str, token: Optional[str] = None, company_id: int = 1) -> Dict[str, Any]:
        """
        Execute an agent turn with ERP tool execution.
        """
        # Set active client with context token
        client = ErpApiClient(base_url=settings.erp_backend_url, token=token)
        set_active_client(client)

        llm = get_llm()

        if llm:
            try:
                # Modern LangChain / LangGraph tool binding
                llm_with_tools = llm.bind_tools(ALL_TOOLS)
                messages = [
                    SystemMessage(content=SYSTEM_PROMPT),
                    HumanMessage(content=f"[Context: Company ID = {company_id}]\n{message}")
                ]
                
                # First model response
                ai_msg = llm_with_tools.invoke(messages)
                tool_calls_executed = []

                if hasattr(ai_msg, "tool_calls") and ai_msg.tool_calls:
                    messages.append(ai_msg)
                    # Execute all tools called by the model
                    for tool_call in ai_msg.tool_calls:
                        tool_name = tool_call["name"]
                        tool_args = tool_call["args"]
                        tool_calls_executed.append({"tool": tool_name, "args": tool_args})

                        # Find matching tool
                        tool_fn = next((t for t in ALL_TOOLS if t.name == tool_name), None)
                        if tool_fn:
                            try:
                                result = tool_fn.invoke(tool_args)
                            except Exception as e:
                                result = f"Tool execution failed: {str(e)}"
                        else:
                            result = f"Tool '{tool_name}' not found."

                        from langchain_core.messages import ToolMessage
                        messages.append(ToolMessage(content=str(result), tool_call_id=tool_call["id"]))

                    # Second model call to synthesize response after tool results
                    final_msg = llm_with_tools.invoke(messages)
                    return {
                        "response": final_msg.content,
                        "tools_called": tool_calls_executed,
                        "provider": llm.__class__.__name__
                    }
                else:
                    return {
                        "response": ai_msg.content,
                        "tools_called": [],
                        "provider": llm.__class__.__name__
                    }
            except Exception as e:
                # If LLM API fails (e.g. invalid key or network issue), fallback gracefully
                print(f"[Agent Warning] LLM call failed ({str(e)}), falling back to offline tool execution.")

        # Offline / Zero-Key Fallback Rule-Based Agent Loop
        return self._offline_agent_execution(message, company_id)

    def _offline_agent_execution(self, message: str, company_id: int) -> Dict[str, Any]:
        """
        Deterministic agent loop when no LLM API key is configured or offline.
        Executes real tools against the ERP database and formats rich markdown outputs.
        """
        import json
        from tools import (
            query_chart_of_accounts, get_trial_balance, get_financial_statements,
            query_vouchers, query_inventory_products, query_product_stock,
            query_inventory_valuation, query_crm_leads, query_users_and_roles,
            get_business_analytics_summary
        )

        q = message.lower()
        tools_called = []
        response_parts = []

        # 1. Executive Business Analytics
        if "analytic" in q or "kpi" in q or "summary" in q or "overview" in q or "executive" in q or "metric" in q:
            tools_called.append({"tool": "get_business_analytics_summary", "args": {"company_id": company_id}})
            raw = get_business_analytics_summary.invoke({"company_id": company_id})
            try:
                data = json.loads(raw)
                sb = [
                    "### 📊 NexOS Enterprise Executive KPI Summary\n",
                    f"- **Total Sales Revenue:** `${data.get('totalSalesRevenue', 0):,.2f}`",
                    f"- **Active Pipeline Leads:** `{data.get('activeLeadsCount', 0)} open deals`",
                    f"- **Monthly Payroll Expenses:** `${data.get('totalMonthlyPayrollExpenses', 0):,.2f}`",
                    f"- **Current Inventory Valuation:** `${data.get('inventoryValuation', 0):,.2f}`",
                    f"- **Project Milestones Completed:** `{data.get('projectMilestonesProgress', 0):.1f}%`\n"
                ]
                response_parts.append("\n".join(sb))
            except Exception:
                response_parts.append(f"### 📊 Executive Analytics\n\n```json\n{raw}\n```")

        # 2. Inventory & Stock
        if "product" in q or "item" in q or "catalog" in q or "sku" in q:
            tools_called.append({"tool": "query_inventory_products", "args": {"company_id": company_id}})
            raw = query_inventory_products.invoke({"company_id": company_id})
            try:
                items = json.loads(raw)
                sb = [
                    f"### 📦 Inventory Catalog ({len(items)} Items)\n",
                    "| ID | Product Name | Item Code | GST Rate | Purchase Price | Retail Price | Unit | Status |",
                    "|:--:|:-------------|:---------:|:--------:|:--------------:|:------------:|:----:|:------:|"
                ]
                for p in items[:15]:
                    status = "🟢 Active" if p.get("active", True) else "🔴 Inactive"
                    sb.append(f"| {p.get('id')} | **{p.get('name')}** | `{p.get('code')}` | {p.get('gstRate', 0)}% | ${p.get('purchasePrice', 0):,.2f} | ${p.get('sellingPriceRetail', 0):,.2f} | {p.get('unit')} | {status} |")
                if len(items) > 15:
                    sb.append(f"\n*(Showing 15 of {len(items)} products)*")
                response_parts.append("\n".join(sb))
            except Exception:
                response_parts.append(f"### 📦 Inventory Products\n\n```json\n{raw}\n```")

        if "stock" in q or "godown" in q or "warehouse" in q:
            tools_called.append({"tool": "query_product_stock", "args": {"company_id": company_id}})
            raw = query_product_stock.invoke({"company_id": company_id})
            try:
                stocks = json.loads(raw)
                sb = [
                    f"### 🏭 Warehouse Stock Levels ({len(stocks)} Records)\n",
                    "| Stock ID | Product ID | Godown ID | Batch | On Hand Quantity |",
                    "|:--------:|:----------:|:---------:|:-----:|:----------------:|"
                ]
                for s in stocks[:15]:
                    batch = s.get("batchNumber") or "-"
                    sb.append(f"| #{s.get('id')} | Prod #{s.get('productId')} | Godown #{s.get('godownId')} | `{batch}` | **{s.get('quantity', 0)}** |")
                response_parts.append("\n".join(sb))
            except Exception:
                response_parts.append(f"### 🏭 Warehouse Stock\n\n```json\n{raw}\n```")

        if "valuation" in q:
            tools_called.append({"tool": "query_inventory_valuation", "args": {"company_id": company_id, "method": "FIFO"}})
            raw = query_inventory_valuation.invoke({"company_id": company_id, "method": "FIFO"})
            response_parts.append(f"### 💰 Inventory Valuation Report (FIFO)\n\n```json\n{raw}\n```")

        # 3. CRM Leads & Sales Pipeline
        if "lead" in q or "crm" in q or "pipeline" in q or "prospect" in q or "deal" in q:
            tools_called.append({"tool": "query_crm_leads", "args": {"company_id": company_id}})
            raw = query_crm_leads.invoke({"company_id": company_id})
            try:
                leads = json.loads(raw)
                sb = [
                    f"### 📈 CRM Sales Pipeline ({len(leads)} Leads)\n",
                    "| ID | Prospect / Company | Contact Person | Email | Deal Value | Stage | Follow-Up |",
                    "|:--:|:-------------------|:--------------:|:-----:|:----------:|:-----:|:---------:|"
                ]
                total_val = 0.0
                for l in leads:
                    val = float(l.get("value") or 0)
                    total_val += val
                    sb.append(f"| {l.get('id')} | **{l.get('name')}** | {l.get('contactPerson') or '-'} | `{l.get('email') or '-'}` | **${val:,.2f}** | `{l.get('status')}` | {l.get('nextFollowUpDate') or '-'} |")
                sb.append(f"\n**Total Pipeline Opportunity Value:** `${total_val:,.2f}` across {len(leads)} leads.\n")
                response_parts.append("\n".join(sb))
            except Exception:
                response_parts.append(f"### 📈 CRM Leads\n\n```json\n{raw}\n```")

        # 4. Accounting & Ledgers
        if ("chart" in q or "ledger" in q or "account" in q or "balance" in q) and "trial" not in q and "sheet" not in q:
            tools_called.append({"tool": "query_chart_of_accounts", "args": {"company_id": company_id}})
            raw = query_chart_of_accounts.invoke({"company_id": company_id})
            try:
                ledgers = json.loads(raw)
                sb = [
                    f"### 📋 Chart of Accounts ({len(ledgers)} Ledgers)\n",
                    "| ID | Code | Account Name | Classification | Current Balance |",
                    "|:--:|:----:|:-------------|:--------------:|:---------------:|"
                ]
                for l in ledgers[:15]:
                    sb.append(f"| {l.get('id')} | `{l.get('code')}` | **{l.get('name')}** | `{l.get('type')}` | **${float(l.get('currentBalance') or 0):,.2f}** |")
                response_parts.append("\n".join(sb))
            except Exception:
                response_parts.append(f"### 📋 Chart of Accounts\n\n```json\n{raw}\n```")

        if "trial" in q or "audit" in q:
            tools_called.append({"tool": "get_trial_balance", "args": {"company_id": company_id}})
            raw = get_trial_balance.invoke({"company_id": company_id})
            response_parts.append(f"### ⚖️ Trial Balance Audit Report\n\n```json\n{raw}\n```")

        if "profit" in q or "loss" in q or "pnl" in q:
            tools_called.append({"tool": "get_financial_statements", "args": {"statement_type": "profit_loss", "company_id": company_id}})
            raw = get_financial_statements.invoke({"statement_type": "profit_loss", "company_id": company_id})
            response_parts.append(f"### 📈 Profit & Loss Statement\n\n```json\n{raw}\n```")

        if "sheet" in q:
            tools_called.append({"tool": "get_financial_statements", "args": {"statement_type": "balance_sheet", "company_id": company_id}})
            raw = get_financial_statements.invoke({"statement_type": "balance_sheet", "company_id": company_id})
            response_parts.append(f"### 📊 Balance Sheet\n\n```json\n{raw}\n```")

        if "voucher" in q or "invoice" in q or "journal" in q or "billing" in q or "sale" in q:
            v_type = "JOURNAL" if "journal" in q else ("SALES" if "sale" in q else None)
            tools_called.append({"tool": "query_vouchers", "args": {"voucher_type": v_type, "company_id": company_id}})
            raw = query_vouchers.invoke({"voucher_type": v_type, "company_id": company_id})
            try:
                vouchers = json.loads(raw)
                sb = [
                    f"### 🧾 ERP Vouchers & Invoices ({len(vouchers)} Records)\n",
                    "| Voucher # | Type | Date | Grand Total | Status | Notes |",
                    "|:---------:|:----:|:----:|:-----------:|:------:|:------|"
                ]
                for v in vouchers[:15]:
                    sb.append(f"| `{v.get('voucherNumber')}` | **{v.get('type')}** | {v.get('date')} | **${float(v.get('grandTotal') or 0):,.2f}** | `{v.get('status')}` | {v.get('notes') or ''} |")
                response_parts.append("\n".join(sb))
            except Exception:
                response_parts.append(f"### 📝 ERP Vouchers\n\n```json\n{raw}\n```")

        # 5. Users & Staff
        if "user" in q or "employee" in q or "staff" in q or "role" in q or "permission" in q:
            tools_called.append({"tool": "query_users_and_roles", "args": {}})
            raw = query_users_and_roles.invoke({})
            try:
                users = json.loads(raw)
                sb = [
                    f"### 👥 System Users & RBAC Directory ({len(users)} Accounts)\n",
                    "| ID | Username | Name | Email | Status | Roles |",
                    "|:--:|:---------|:-----|:------|:------:|:------|"
                ]
                for u in users:
                    name = f"{u.get('firstName') or ''} {u.get('lastName') or ''}".strip() or "-"
                    status = "🟢 Active" if u.get("active", True) else "🔴 Suspended"
                    roles = ", ".join(u.get("roles", []))
                    sb.append(f"| {u.get('id')} | **{u.get('username')}** | {name} | `{u.get('email')}` | {status} | `{roles}` |")
                response_parts.append("\n".join(sb))
            except Exception:
                response_parts.append(f"### 👥 User Directory\n\n```json\n{raw}\n```")

        if not response_parts:
            response_text = (
                "### 🤖 NexOS Agentic AI Autonomous Copilot Ready\n\n"
                "I am your enterprise AI agent with 16 autonomous tools connected directly to the live NexOS ERP.\n\n"
                "**What I can do for you:**\n"
                "- 📦 **Inventory:** *\"Show all products in stock\"*, *\"What is our inventory valuation?\"*\n"
                "- 📊 **Accounting:** *\"List ledger accounts & balances\"*, *\"Audit trial balance\"*, *\"Show P&L statement\"*\n"
                "- 🧾 **Billing:** *\"Show recent sales vouchers\"*, *\"List journal entries\"*\n"
                "- 📈 **CRM:** *\"List all sales pipeline leads\"*, *\"Show total pipeline deal value\"*\n"
                "- 👥 **Security:** *\"Show staff members and assigned roles\"*\n"
                "- 📈 **Executive:** *\"Give me an executive business KPI summary\"*\n\n"
                "> 💡 *Tip*: When an API key (Gemini, OpenAI, or OpenRouter) is provided in Settings, I unlock multi-turn generative reasoning and autonomous multi-step tool calls!"
            )
        else:
            response_text = "\n\n".join(response_parts)

        return {
            "response": response_text,
            "tools_called": tools_called,
            "provider": "NexOS-Agentic-Core"
        }

agent = FinancialAgent()
