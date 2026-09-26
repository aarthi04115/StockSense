import os
import sys
from datetime import datetime, timedelta
import random

# Add backend directory to sys.path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.database import SessionLocal, engine
from app import models

def seed_ai_data():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Seeding AI Synthetic Data...")

    # Ensure we have at least one product
    product = db.query(models.Product).first()
    if not product:
        category = models.Category(name="AI Testing")
        db.add(category)
        db.commit()
        product = models.Product(name="Synthetic Widget", sku="WIDGET-01", category_id=category.id, uom="pcs")
        db.add(product)
        db.commit()

    # Generate Synthetic Forecasts
    forecasts = [
        models.AIForecast(
            product_id=product.id,
            predicted_stockout_date=datetime.utcnow() + timedelta(days=5),
            suggested_reorder_qty=500,
            confidence=0.88,
            generated_at=datetime.utcnow()
        ),
        models.AIForecast(
            product_id=product.id,
            predicted_stockout_date=datetime.utcnow() + timedelta(days=2),
            suggested_reorder_qty=150,
            confidence=0.95,
            generated_at=datetime.utcnow() - timedelta(days=1)
        )
    ]
    db.add_all(forecasts)
    print("Added Forecasts")

    # Generate Synthetic Anomalies
    location = db.query(models.Location).first()
    if not location:
        warehouse = models.Warehouse(name="AI Warehouse", location="Cloud")
        db.add(warehouse)
        db.commit()
        location = models.Location(warehouse_id=warehouse.id, code="AI-RACK", type="Rack")
        db.add(location)
        db.commit()

    # Create dummy adjustments to flag
    adjustments = []
    flags = []
    for i in range(3):
        adj = models.Adjustment(
            product_id=product.id,
            location_id=location.id,
            recorded_qty=100.0,
            counted_qty=float(random.randint(10, 50)),
            delta=float(random.randint(-90, -50)),
            reason="Unknown Loss",
            created_by=1
        )
        db.add(adj)
        db.commit()
        
        flag = models.AIAnomalyFlag(
            product_id=product.id,
            adjustment_id=adj.id,
            anomaly_score=random.uniform(0.7, 0.99),
            reason=f"Massive unexpected stock decrease outside normal variance. Z-score: {random.uniform(3.0, 5.0):.2f}",
            reviewed=False
        )
        flags.append(flag)

    db.add_all(flags)
    db.commit()
    print("Added Anomalies")
    
    db.close()
    print("Synthetic AI data generation complete!")

if __name__ == "__main__":
    seed_ai_data()
