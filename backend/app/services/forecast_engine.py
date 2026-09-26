import pandas as pd
from datetime import datetime, timedelta

def generate_forecast(product_id: int, historical_data: list):
    """
    Implementation of demand forecasting using historical ledger data.
    Uses a simple moving average / linear extrapolation for demo purposes.
    """
    if not historical_data:
        # Default mock if no data
        return {
            "product_id": product_id,
            "predicted_stockout_date": datetime.utcnow() + timedelta(days=30),
            "suggested_reorder_qty": 100.0,
            "confidence": 0.5,
            "generated_at": datetime.utcnow()
        }

    # Extract deltas (negative deltas represent consumption)
    consumptions = [-item.delta for item in historical_data if item.delta < 0]
    
    if not consumptions:
        return {
            "product_id": product_id,
            "predicted_stockout_date": datetime.utcnow() + timedelta(days=90),
            "suggested_reorder_qty": 50.0,
            "confidence": 0.3,
            "generated_at": datetime.utcnow()
        }

    avg_consumption_per_entry = sum(consumptions) / len(consumptions)
    
    # Estimate daily consumption assuming 1 entry per day on average
    daily_consumption = avg_consumption_per_entry
    
    # Get current stock (last balance_after)
    current_stock = historical_data[-1].balance_after if historical_data else 0

    days_until_stockout = current_stock / daily_consumption if daily_consumption > 0 else 90
    predicted_stockout_date = datetime.utcnow() + timedelta(days=int(days_until_stockout))

    suggested_qty = daily_consumption * 30  # Suggest 30 days of stock
    
    return {
        "product_id": product_id,
        "predicted_stockout_date": predicted_stockout_date,
        "suggested_reorder_qty": round(suggested_qty, 2),
        "confidence": 0.85,
        "generated_at": datetime.utcnow()
    }
