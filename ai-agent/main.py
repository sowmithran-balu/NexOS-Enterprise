import sys
import io

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from agent import agent, ALL_TOOLS
from erp_client import ErpApiClient
from config import settings
import uvicorn

app = FastAPI(
    title="NexOS ERP LangChain Financial Agent",
    description="Autonomous Agentic AI service for financial analysis, trial balance audits, and ledger operations",
    version="1.0.0"
)

# Enable CORS for React frontend & Spring Boot backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str = Field(..., description="User query or command for the agent")
    companyId: Optional[int] = Field(default=1, description="Company tenant ID")
    token: Optional[str] = Field(default=None, description="Optional Bearer JWT authentication token")

class ChatResponse(BaseModel):
    response: str
    tools_called: List[Dict[str, Any]]
    provider: str

@app.get("/")
def get_service_info():
    return {
        "service": "NexOS ERP LangChain Financial Agent",
        "status": "ONLINE",
        "erp_backend": settings.erp_backend_url,
        "tools_registered": len(ALL_TOOLS),
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    client = ErpApiClient(base_url=settings.erp_backend_url)
    erp_status = await client.check_connection()
    return {
        "status": "healthy",
        "agent": "ready",
        "erp_connectivity": erp_status
    }

@app.get("/tools")
def list_tools():
    """Return schema and documentation for all available agent tools."""
    tool_metadata = []
    for t in ALL_TOOLS:
        tool_metadata.append({
            "name": t.name,
            "description": t.description,
            "args": t.args
        })
    return {"tools": tool_metadata}

@app.post("/chat", response_model=ChatResponse)
async def chat_with_agent(req: ChatRequest, request: Request):
    """
    Execute an autonomous LangChain agent loop with tool execution.
    """
    token = req.token
    if not token:
        # Check Authorization header if provided in request
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

    try:
        result = agent.run(
            message=req.message,
            token=token,
            company_id=req.companyId or settings.default_company_id
        )
        return ChatResponse(
            response=result["response"],
            tools_called=result.get("tools_called", []),
            provider=result.get("provider", "LangChain")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
