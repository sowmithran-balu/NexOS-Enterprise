import httpx
from typing import Optional, List, Dict, Any
from config import settings

class ErpApiClient:
    def __init__(self, base_url: Optional[str] = None, token: Optional[str] = None):
        self.base_url = (base_url or settings.erp_backend_url).rstrip("/")
        self.token = token

    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token.strip()}"
        return headers

    async def check_connection(self) -> Dict[str, Any]:
        """Check if ERP backend is online and reachable."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/api/auth/health", headers=self._get_headers())
                if res.status_code in [200, 401, 403]:
                    return {"connected": True, "status_code": res.status_code, "base_url": self.base_url}
                return {"connected": False, "status_code": res.status_code, "base_url": self.base_url}
        except Exception as e:
            return {"connected": False, "error": str(e), "base_url": self.base_url}

    async def get_ledgers(self, company_id: int) -> List[Dict[str, Any]]:
        """Fetch all chart of accounts ledgers and current balances."""
        url = f"{self.base_url}/api/accounting/ledgers?companyId={company_id}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Error ({res.status_code}): {res.text}")
            return res.json()

    async def get_trial_balance(self, company_id: int) -> List[Dict[str, Any]]:
        """Fetch trial balance rows including debit and credit aggregates."""
        url = f"{self.base_url}/api/accounting/trial-balance?companyId={company_id}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Error ({res.status_code}): {res.text}")
            return res.json()

    async def get_profit_loss(self, company_id: int) -> Dict[str, Any]:
        """Fetch P&L Statement with revenues, expenses, gross and net profit."""
        url = f"{self.base_url}/api/accounting/profit-loss?companyId={company_id}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Error ({res.status_code}): {res.text}")
            return res.json()

    async def get_balance_sheet(self, company_id: int) -> Dict[str, Any]:
        """Fetch Balance Sheet summary containing Assets, Liabilities, and Equity."""
        url = f"{self.base_url}/api/accounting/balance-sheet?companyId={company_id}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Error ({res.status_code}): {res.text}")
            return res.json()

    async def get_vouchers(self, company_id: int, voucher_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch vouchers filtered optionally by voucher type (JOURNAL, SALES, etc)."""
        url = f"{self.base_url}/api/billing/vouchers?companyId={company_id}"
        if voucher_type:
            url += f"&type={voucher_type.upper().strip()}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Error ({res.status_code}): {res.text}")
            return res.json()

    async def create_voucher(self, voucher_data: Dict[str, Any]) -> Dict[str, Any]:
        """Post a new voucher transaction to the ERP system."""
        url = f"{self.base_url}/api/billing/vouchers"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(url, json=voucher_data, headers=self._get_headers())
            if res.status_code not in [200, 201]:
                raise RuntimeError(f"ERP Voucher Creation Failed ({res.status_code}): {res.text}")
            return res.json()

    # --- INVENTORY & STOCK ---
    async def get_products(self, company_id: int) -> List[Dict[str, Any]]:
        """Fetch all inventory products for the company."""
        url = f"{self.base_url}/api/inventory/products?companyId={company_id}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Error ({res.status_code}): {res.text}")
            return res.json()

    async def get_product_stock(self, company_id: int) -> List[Dict[str, Any]]:
        """Fetch warehouse stock records for all products."""
        url = f"{self.base_url}/api/inventory/stock?companyId={company_id}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Error ({res.status_code}): {res.text}")
            return res.json()

    async def get_stock_valuation(self, company_id: int, method: str = "FIFO") -> Dict[str, Any]:
        """Fetch total stock valuation with specified calculation method."""
        url = f"{self.base_url}/api/inventory/valuation?companyId={company_id}&method={method.upper()}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Error ({res.status_code}): {res.text}")
            return res.json()

    async def adjust_stock(self, company_id: int, product_id: int, godown_id: int, quantity: float, batch: Optional[str] = None, serial: Optional[str] = None) -> Dict[str, Any]:
        """Adjust inventory stock levels in warehouse."""
        url = f"{self.base_url}/api/inventory/stock/adjust"
        payload = {
            "companyId": company_id,
            "productId": product_id,
            "godownId": godown_id,
            "batchNumber": batch,
            "serialNumber": serial,
            "quantity": quantity
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(url, json=payload, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Stock Adjustment Failed ({res.status_code}): {res.text}")
            return res.json()

    # --- CRM LEADS & PIPELINE ---
    async def get_crm_leads(self, company_id: int) -> List[Dict[str, Any]]:
        """Fetch CRM sales pipeline leads."""
        url = f"{self.base_url}/api/crm/leads?companyId={company_id}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Error ({res.status_code}): {res.text}")
            return res.json()

    async def create_crm_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new lead into the CRM pipeline."""
        url = f"{self.base_url}/api/crm/leads"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(url, json=lead_data, headers=self._get_headers())
            if res.status_code not in [200, 201]:
                raise RuntimeError(f"ERP Lead Creation Failed ({res.status_code}): {res.text}")
            return res.json()

    async def update_lead_status(self, lead_id: int, status: str) -> Dict[str, Any]:
        """Advance CRM lead status."""
        url = f"{self.base_url}/api/crm/leads/{lead_id}/status?status={status.upper().strip()}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.put(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Lead Status Update Failed ({res.status_code}): {res.text}")
            return res.json()

    # --- BILLING & OPERATIONS ---
    async def send_voucher_reminder(self, voucher_id: int) -> Dict[str, Any]:
        """Dispatch payment reminder notification for an invoice/voucher."""
        url = f"{self.base_url}/api/billing/vouchers/{voucher_id}/remind"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Reminder Failed ({res.status_code}): {res.text}")
            return res.json()

    async def reconcile_cheque(self, voucher_id: int, status: str) -> Dict[str, Any]:
        """Update cheque clearance status (CLEARED, BOUNCED, PENDING)."""
        url = f"{self.base_url}/api/billing/vouchers/{voucher_id}/cheque-status?status={status.upper().strip()}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Cheque Reconciliation Failed ({res.status_code}): {res.text}")
            return res.json()

    # --- USERS & ACCESS ---
    async def get_users(self) -> List[Dict[str, Any]]:
        """Fetch all system user accounts and roles."""
        url = f"{self.base_url}/api/users"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Error ({res.status_code}): {res.text}")
            return res.json()

    # --- EXECUTIVE ANALYTICS ---
    async def get_analytics_summary(self, company_id: int) -> Dict[str, Any]:
        """Fetch high-level business analytics summary."""
        url = f"{self.base_url}/api/analytics/summary?companyId={company_id}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=self._get_headers())
            if res.status_code != 200:
                raise RuntimeError(f"ERP Error ({res.status_code}): {res.text}")
            return res.json()
