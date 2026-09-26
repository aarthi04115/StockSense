from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db, SessionLocal
from ..services.anomaly_detector import detect_anomaly

router = APIRouter(
    prefix="/adjustments",
    tags=["adjustments"]
)

def run_anomaly_detection_async(adjustment_id: int, product_id: int, delta: float, reason: str):
    # This runs asynchronously outside the main request cycle (satisfying AI/ML queues design goal)
    db = SessionLocal()
    try:
        adj_data = {"delta": delta, "reason": reason or ""}
        anomaly_result = detect_anomaly(adj_data)
        if anomaly_result["is_anomalous"]:
            flag = models.AIAnomalyFlag(
                product_id=product_id,
                adjustment_id=adjustment_id,
                anomaly_score=anomaly_result["score"],
                reason=anomaly_result["reason"]
            )
            db.add(flag)
            db.commit()
    finally:
        db.close()

@router.post("/", response_model=schemas.Adjustment)
def create_adjustment(adjustment: schemas.AdjustmentCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    stock = db.query(models.StockLevel).filter(
        models.StockLevel.product_id == adjustment.product_id,
        models.StockLevel.location_id == adjustment.location_id
    ).with_for_update().first()
    
    current_qty = stock.quantity if stock else 0.0
    delta = adjustment.counted_qty - current_qty
    
    db_adj = models.Adjustment(
        **adjustment.model_dump(exclude={'delta'}),
        delta=delta,
        created_by=1
    )
    db.add(db_adj)
    
    if stock:
        stock.quantity = adjustment.counted_qty
    else:
        stock = models.StockLevel(
            product_id=adjustment.product_id,
            location_id=adjustment.location_id,
            quantity=adjustment.counted_qty
        )
        db.add(stock)
        
    db.commit()
    db.refresh(db_adj)
    
    # Ledger entry
    ledger = models.StockLedger(
        product_id=adjustment.product_id,
        location_id=adjustment.location_id,
        doc_type="adjustment",
        doc_id=db_adj.id,
        delta=delta,
        balance_after=stock.quantity,
        actor_id=1
    )
    db.add(ledger)
    db.commit()
    
    # Queue Anomaly Detection
    background_tasks.add_task(
        run_anomaly_detection_async, 
        db_adj.id, 
        adjustment.product_id, 
        delta, 
        adjustment.reason
    )
    
    return db_adj
