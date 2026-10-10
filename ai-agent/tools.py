from typing import Optional, List, Dict, Any
from langchain_core.tools import tool
from erp_client import ErpApiClient
import json

# Global reference that gets bound with the active request context (token, companyId)
active_erp_client: ErpApiClient = ErpApiClient()

def set_active_client(client: ErpApiClient):
    global active_erp_client
    active_erp_client = client

@tool
def query_chart_of_accounts(company_id: int = 1) -> str:
    """
    Query all active accounts and ledgers in the ERP Chart of Accounts.
    Returns ledger IDs, names, codes, classifications (CUSTOMER, SUPPLIER, BANK, CASH, EXPENSE, INCOME, EQUITY),
    and their current balances.
    Use this to look up account IDs before drafting journal vouchers or checking account health.
    """
    import asyncio
    try:
        ledgers = asyncio.run(active_erp_client.get_ledgers(company_id))
        if not ledgers:
            return "No ledgers found for this company."
        summary = []
        for l in ledgers:
            summary.append({
                "id": l.get("id"),
                "name": l.get("name"),
                "code": l.get("code"),
                "type": l.get("type"),
                "currentBalance": l.get("currentBalance", 0)
            })
        return json.dumps(summary, indent=2)
    except Exception as e:
        return f"Error fetching Chart of Accounts: {str(e)}"

@tool
def get_trial_balance(company_id: int = 1) -> str:
    """
    Fetch the live Trial Balance report from the ERP.
    Contains debit and credit columns for all ledger accounts.
    Use this to diagnose ledger health, verify debit/credit balance equality, or audit books.
    """
    import asyncio
    try:
        tb = asyncio.run(active_erp_client.get_trial_balance(company_id))
        if not tb:
            return "No trial balance data available for company ID " + str(company_id)
        return json.dumps(tb, indent=2)
    except Exception as e:
        return f"Error fetching Trial Balance: {str(e)}"

@tool
def get_financial_statements(statement_type: str, company_id: int = 1) -> str:
    """
    Retrieve financial statements from the ERP.
    statement_type MUST be either 'profit_loss' or 'balance_sheet'.
    Returns revenue, expense, EBITDA, net profit, or asset and liability breakdown.
    """
    import asyncio
    try:
        st = statement_type.lower().strip()
        if "profit" in st or "loss" in st or "pnl" in st:
            pnl = asyncio.run(active_erp_client.get_profit_loss(company_id))
            return json.dumps(pnl, indent=2)
        elif "balance" in st or "sheet" in st:
            bs = asyncio.run(active_erp_client.get_balance_sheet(company_id))
            return json.dumps(bs, indent=2)
        else:
            return f"Invalid statement_type: '{statement_type}'. Must be 'profit_loss' or 'balance_sheet'."
    except Exception as e:
        return f"Error fetching statement: {str(e)}"

@tool
def query_vouchers(voucher_type: Optional[str] = None, company_id: int = 1) -> str:
    """
    Retrieve existing vouchers from the ERP.
    voucher_type can be 'JOURNAL', 'SALES', 'PURCHASE', 'PAYMENT', 'RECEIPT', 'CONTRA', or None for all.
    Use this to inspect recent financial postings and audit transactions.
    """
    import asyncio
    try:
        vouchers = asyncio.run(active_erp_client.get_vouchers(company_id, voucher_type))
        if not vouchers:
            return f"No vouchers found matching type '{voucher_type}' for company {company_id}."
        
        # Trim payload to relevant fields
        cleaned = []
        for v in vouchers[:15]:
            cleaned.append({
                "id": v.get("id"),
                "voucherNumber": v.get("voucherNumber"),
                "type": v.get("type"),
                "date": v.get("date"),
                "grandTotal": v.get("grandTotal"),
                "status": v.get("status"),
                "notes": v.get("notes")
            })
        return json.dumps(cleaned, indent=2)
    except Exception as e:
        return f"Error querying vouchers: {str(e)}"

@tool
def draft_journal_voucher(
    debit_account_id: int,
    credit_account_id: int,
    amount: float,
    narration: str,
    company_id: int = 1,
    branch_id: int = 1
) -> str:
    """
    Draft and post a balanced double-entry Journal Voucher (JNL) into NexOS ERP.
    Required parameters:
    - debit_account_id: The ID of the ledger account being Debited.
    - credit_account_id: The ID of the ledger account being Credited.
    - amount: Financial transaction amount (must be positive).
    - narration: Audit description explaining the reason for the journal entry.
    - company_id: Company tenant ID (defaults to 1).
    - branch_id: Branch ID (defaults to 1).
    """
    import asyncio
    if amount <= 0:
        return "Error: Voucher amount must be greater than zero."
    if debit_account_id == credit_account_id:
        return "Error: Debit and Credit accounts cannot be the same ledger ID."

    payload = {
        "companyId": company_id,
        "branchId": branch_id,
        "type": "JOURNAL",
        "ledgerId": debit_account_id,
        "subTotal": amount,
        "grandTotal": amount,
        "notes": f"{narration} (Cr Ledger #{credit_account_id})",
        "status": "POSTED",
        "items": []
    }

    try:
        result = asyncio.run(active_erp_client.create_voucher(payload))
        return (
            f"✅ Successfully created Journal Voucher!\n"
            f"- Voucher Number: {result.get('voucherNumber', 'N/A')}\n"
            f"- Status: {result.get('status')}\n"
            f"- Amount: ${amount:,.2f}\n"
            f"- Debit Ledger ID: {debit_account_id}\n"
            f"- Credit Ledger ID: {credit_account_id}\n"
            f"- Narration: {narration}"
        )
    except Exception as e:
        return f"Failed to draft journal voucher: {str(e)}"

# ==================== INVENTORY & WAREHOUSE TOOLS ====================

@tool
def query_inventory_products(company_id: int = 1) -> str:
    """
    Query all inventory items, catalog products, and pricing in the ERP.
    Returns product IDs, names, item codes/SKUs, purchase prices, retail selling prices, GST tax rates, and active status.
    Use this when user asks about products, catalog prices, SKUs, or inventory master data.
    """
    import asyncio
    try:
        products = asyncio.run(active_erp_client.get_products(company_id))
        if not products:
            return f"No products found in inventory for company ID {company_id}."
        summary = []
        for p in products:
            summary.append({
                "id": p.get("id"),
                "name": p.get("name"),
                "code": p.get("code"),
                "gstRate": p.get("gstRate"),
                "purchasePrice": p.get("purchasePrice"),
                "sellingPriceRetail": p.get("sellingPriceRetail"),
                "unit": p.get("unit", "PCS"),
                "active": p.get("active", True)
            })
        return json.dumps(summary, indent=2)
    except Exception as e:
        return f"Error fetching inventory products: {str(e)}"

@tool
def query_product_stock(company_id: int = 1) -> str:
    """
    Query real-time stock levels across all warehouses and godowns.
    Returns product IDs, godown IDs, batch numbers, serial numbers, and physical quantities on hand.
    Use this to audit stock availability, check low stock, or find where items are stored.
    """
    import asyncio
    try:
        stocks = asyncio.run(active_erp_client.get_product_stock(company_id))
        if not stocks:
            return f"No stock records found for company ID {company_id}."
        summary = []
        for s in stocks:
            summary.append({
                "id": s.get("id"),
                "productId": s.get("productId") or (s.get("product", {}).get("id") if isinstance(s.get("product"), dict) else None),
                "godownId": s.get("godownId") or (s.get("godown", {}).get("id") if isinstance(s.get("godown"), dict) else None),
                "batchNumber": s.get("batchNumber"),
                "quantity": s.get("quantity", 0)
            })
        return json.dumps(summary, indent=2)
    except Exception as e:
        return f"Error fetching warehouse stock: {str(e)}"

@tool
def query_inventory_valuation(company_id: int = 1, method: str = "FIFO") -> str:
    """
    Calculate the total financial valuation of all inventory in stock.
    Methods available: 'FIFO', 'LIFO', 'WEIGHTED_AVG', 'CUSTOM'.
    Use this for balance sheet inventory audit and cost analysis.
    """
    import asyncio
    try:
        res = asyncio.run(active_erp_client.get_stock_valuation(company_id, method=method))
        return json.dumps(res, indent=2)
    except Exception as e:
        return f"Error fetching inventory valuation: {str(e)}"

@tool
def adjust_inventory_stock(
    product_id: int,
    godown_id: int,
    quantity: float,
    company_id: int = 1,
    batch_number: Optional[str] = None
) -> str:
    """
    Perform a warehouse stock adjustment to reconcile physical vs system stock counts.
    - product_id: The ID of the product
    - godown_id: The ID of the godown/warehouse
    - quantity: Adjustment amount (positive to increase, negative to decrease)
    """
    import asyncio
    try:
        res = asyncio.run(active_erp_client.adjust_stock(
            company_id=company_id,
            product_id=product_id,
            godown_id=godown_id,
            quantity=quantity,
            batch=batch_number
        ))
        return f"✅ Stock adjustment recorded successfully: {json.dumps(res)}"
    except Exception as e:
        return f"Failed to adjust stock: {str(e)}"

# ==================== CRM & SALES PIPELINE TOOLS ====================

@tool
def query_crm_leads(company_id: int = 1) -> str:
    """
    Query prospective deals and clients in the CRM sales pipeline.
    Returns lead IDs, client names, contact persons, emails, estimated deal values, stages (NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST), and follow-up dates.
    Use this to review pipeline health, calculate expected revenue, or review open deals.
    """
    import asyncio
    try:
        leads = asyncio.run(active_erp_client.get_crm_leads(company_id))
        if not leads:
            return f"No CRM leads found for company ID {company_id}."
        summary = []
        for l in leads:
            summary.append({
                "id": l.get("id"),
                "name": l.get("name"),
                "contactPerson": l.get("contactPerson"),
                "email": l.get("email"),
                "value": l.get("value", 0),
                "status": l.get("status"),
                "nextFollowUpDate": l.get("nextFollowUpDate")
            })
        return json.dumps(summary, indent=2)
    except Exception as e:
        return f"Error fetching CRM leads: {str(e)}"

@tool
def create_crm_lead(
    name: str,
    deal_value: float,
    contact_person: Optional[str] = None,
    email: Optional[str] = None,
    company_id: int = 1
) -> str:
    """
    Create and register a new sales opportunity or lead in the CRM pipeline.
    - name: Business or prospect name (e.g. 'Stark Enterprises')
    - deal_value: Projected contract value
    - contact_person: Key contact name
    - email: Lead contact email
    """
    import asyncio
    try:
        payload = {
            "name": name,
            "contactPerson": contact_person,
            "email": email,
            "value": deal_value,
            "status": "NEW",
            "companyId": company_id
        }
        res = asyncio.run(active_erp_client.create_crm_lead(payload))
        return (
            f"✅ Successfully created CRM Lead!\n"
            f"- Lead ID: {res.get('id')}\n"
            f"- Name: {res.get('name')}\n"
            f"- Deal Value: ${deal_value:,.2f}\n"
            f"- Status: NEW"
        )
    except Exception as e:
        return f"Failed to create CRM lead: {str(e)}"

@tool
def update_crm_lead_status(lead_id: int, status: str) -> str:
    """
    Update the lifecycle stage of a CRM lead.
    Valid statuses: 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'.
    """
    import asyncio
    try:
        res = asyncio.run(active_erp_client.update_lead_status(lead_id, status))
        return f"✅ Lead #{lead_id} updated to status '{status.upper()}'. {json.dumps(res)}"
    except Exception as e:
        return f"Failed to update lead status: {str(e)}"

# ==================== BILLING & OPERATIONS TOOLS ====================

@tool
def send_payment_reminder(voucher_id: int) -> str:
    """
    Trigger an automated payment reminder to the customer for an outstanding invoice or voucher.
    - voucher_id: The ID of the sales invoice/voucher.
    """
    import asyncio
    try:
        res = asyncio.run(active_erp_client.send_voucher_reminder(voucher_id))
        return f"✅ Payment reminder dispatched for voucher #{voucher_id}: {json.dumps(res)}"
    except Exception as e:
        return f"Failed to send payment reminder: {str(e)}"

@tool
def reconcile_cheque_status(voucher_id: int, status: str) -> str:
    """
    Reconcile bank cheque status for a payment voucher.
    - voucher_id: Voucher ID
    - status: 'CLEARED', 'BOUNCED', or 'PENDING'
    """
    import asyncio
    try:
        res = asyncio.run(active_erp_client.reconcile_cheque(voucher_id, status))
        return f"✅ Voucher #{voucher_id} cheque reconciled to status: {status.upper()}"
    except Exception as e:
        return f"Failed to reconcile cheque: {str(e)}"

# ==================== USERS & DIRECTORY TOOLS ====================

@tool
def query_users_and_roles() -> str:
    """
    Query enterprise staff accounts, roles, and administrative privileges.
    Use this to audit who has access to the ERP system and active roles.
    """
    import asyncio
    try:
        users = asyncio.run(active_erp_client.get_users())
        if not users:
            return "No users found in system directory."
        summary = []
        for u in users:
            roles = [r.get("name") for r in u.get("roles", []) if isinstance(r, dict)]
            summary.append({
                "id": u.get("id"),
                "username": u.get("username"),
                "email": u.get("email"),
                "firstName": u.get("firstName"),
                "lastName": u.get("lastName"),
                "active": u.get("active", True),
                "roles": roles
            })
        return json.dumps(summary, indent=2)
    except Exception as e:
        return f"Error fetching users: {str(e)}"

# ==================== EXECUTIVE ANALYTICS TOOL ====================

@tool
def get_business_analytics_summary(company_id: int = 1) -> str:
    """
    Retrieve high-level executive KPI metrics for the enterprise.
    Returns:
    - totalSalesRevenue: Aggregated revenue from all sales vouchers
    - activeLeadsCount: Number of active deals in the sales pipeline
    - totalMonthlyPayrollExpenses: Current payroll costs
    - inventoryValuation: Total value of inventory on hand
    - projectMilestonesProgress: Percent of enterprise project tasks completed
    """
    import asyncio
    try:
        res = asyncio.run(active_erp_client.get_analytics_summary(company_id))
        return json.dumps(res, indent=2)
    except Exception as e:
        return f"Error fetching analytics summary: {str(e)}"

ALL_TOOLS = [
    # Accounting
    query_chart_of_accounts,
    get_trial_balance,
    get_financial_statements,
    query_vouchers,
    draft_journal_voucher,
    # Inventory
    query_inventory_products,
    query_product_stock,
    query_inventory_valuation,
    adjust_inventory_stock,
    # CRM
    query_crm_leads,
    create_crm_lead,
    update_crm_lead_status,
    # Billing & Ops
    send_payment_reminder,
    reconcile_cheque_status,
    # Users
    query_users_and_roles,
    # Analytics
    get_business_analytics_summary
]
