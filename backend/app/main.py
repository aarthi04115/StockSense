from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
load_dotenv()

from .routers import products, warehouses, receipts, deliveries, ai, transfers, adjustments, auth
from .database import engine
from . import models
import json

# Create tables if they don't exist (useful for dev before migrations)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StockSense API",
    description="AI-Augmented Modular Inventory Management System API",
    version="0.1.0",
)

# Mock idempotency store (in prod, use Redis)
idempotency_store = {}

@app.middleware("http")
async def idempotency_middleware(request: Request, call_next):
    if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
        idemp_key = request.headers.get("Idempotency-Key")
        if idemp_key:
            if idemp_key in idempotency_store:
                cached = idempotency_store[idemp_key]
                return JSONResponse(status_code=cached["status"], content=cached["body"])
            
            response = await call_next(request)
            
            # Simple cache logic for demonstration
            if response.status_code < 400:
                # We can't easily read the body of a StreamingResponse in middleware without consuming it,
                # so for a real app we'd use a custom Route class. This serves as our mock implementation.
                idempotency_store[idemp_key] = {"status": response.status_code, "body": {"message": "Idempotent response cached"}}
            return response
    
    return await call_next(request)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/v1")
app.include_router(products.router, prefix="/v1")
app.include_router(warehouses.router, prefix="/v1")
app.include_router(receipts.router, prefix="/v1")
app.include_router(deliveries.router, prefix="/v1")
app.include_router(transfers.router, prefix="/v1")
app.include_router(adjustments.router, prefix="/v1")
app.include_router(ai.router, prefix="/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to StockSense API. Visit /docs for the interactive API documentation."}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
