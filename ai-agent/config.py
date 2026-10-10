import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
        self.erp_backend_url: str = os.getenv("ERP_BACKEND_URL", "http://localhost:8080").rstrip("/")
        self.openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
        self.openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.gemini_api_key: Optional[str] = os.getenv("GEMINI_API_KEY")
        self.gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.openrouter_api_key: Optional[str] = os.getenv("OPENROUTER_API_KEY")
        self.openrouter_model: str = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
        self.default_company_id: int = int(os.getenv("DEFAULT_COMPANY_ID", "1"))
        self.host: str = os.getenv("HOST", "0.0.0.0")
        self.port: int = int(os.getenv("PORT", "8000"))

settings = Settings()
