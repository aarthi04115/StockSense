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

@router.post("/query")
def natural_language_query(query: str):
    """
    Mock NLP to query translator.
    Would use Claude API (Anthropic) to translate plain English into a structured DB query.
    """
    return {
        "original_query": query,
        "intent_recognized": "CHECK_PENDING_RECEIPTS",
        "mock_result": "There are 14 pending receipts in the current warehouse layout."
    }
