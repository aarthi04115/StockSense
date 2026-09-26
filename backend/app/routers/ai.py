from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import forecast_engine, anomaly_detector

router = APIRouter(
    prefix="/ai",
    tags=["ai"]
)

@router.get("/forecast/{product_id}")
def get_product_forecast(product_id: int, db: Session = Depends(get_db)):
    from ..models import StockLedger
    
    # Fetch historical ledger data for the product, ordered by time
    historical_data = db.query(StockLedger).filter(
        StockLedger.product_id == product_id
    ).order_by(StockLedger.created_at.asc()).all()
    
    forecast = forecast_engine.generate_forecast(product_id, historical_data)
    
    # Save forecast to DB
    from ..models import AIForecast
    db_forecast = AIForecast(
        product_id=forecast["product_id"],
        predicted_stockout_date=forecast["predicted_stockout_date"],
        suggested_reorder_qty=forecast["suggested_reorder_qty"],
        confidence=forecast["confidence"],
        generated_at=forecast["generated_at"]
    )
    db.add(db_forecast)
    db.commit()
    
    return forecast

import time
import os
from google import genai
from google.genai import types

# Setup Gemini API using new google.genai SDK
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    _genai_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    _genai_client = None

GEMINI_MODEL = "gemini-3.8-flash"

@router.post("/query")
def natural_language_query(query: str):
    """
    Translates plain English into structured data using Gemini (google.genai SDK).
    Includes retry logic for overload/rate-limit errors.
    """
    prompt = f"""
    You are an AI assistant for an Inventory Management System called StockSense.
    The user is asking a question about their inventory.
    Extract the core intent and respond with a helpful message.
    User Query: "{query}"
    
    Return your answer as a clean JSON object with two keys:
    "intent_recognized" (e.g. "STOCK_CHECK", "PENDING_RECEIPTS", "GREETING")
    "answer" (a friendly conversational answer based on their query)
    """

    max_retries = 3
    for attempt in range(max_retries):
        try:
            if not _genai_client:
                return {
                    "error": "No API Key",
                    "original_query": query,
                    "message": "AI is temporarily unavailable. Please set GEMINI_API_KEY."
                }
                
            response = _genai_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=512,
                )
            )
            text = response.text.strip()

            # Extract JSON if wrapped in markdown code blocks
            if "```json" in text:
                import json
                json_str = text.split("```json")[1].split("```")[0].strip()
                return json.loads(json_str)
            
            # Try to parse as raw JSON
            import json
            try:
                return json.loads(text)
            except Exception:
                pass

            return {
                "original_query": query,
                "intent_recognized": "GENERAL_QUERY",
                "answer": text
            }

        except Exception as e:
            error_str = str(e)
            # Retry on overload/rate limit
            if attempt < max_retries - 1 and any(x in error_str.lower() for x in ["overload", "rate", "429", "503", "resource_exhausted"]):
                wait = 2 ** attempt  # 1s, 2s, 4s
                time.sleep(wait)
                continue
            return {
                "error": error_str,
                "original_query": query,
                "message": "AI is temporarily unavailable. Please try again in a moment."
            }
