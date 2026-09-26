from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/deliveries",
    tags=["deliveries"]
)

@router.post("/", response_model=schemas.Delivery)
def create_delivery(delivery: schemas.DeliveryCreate, db: Session = Depends(get_db)):
    db_delivery = models.Delivery(**delivery.model_dump())
    # Mocking user_id = 1 for now
    db_delivery.created_by = 1
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)
    return db_delivery

@router.post("/{delivery_id}/lines", response_model=schemas.DeliveryLine)
def add_delivery_line(delivery_id: int, line: schemas.DeliveryLineCreate, db: Session = Depends(get_db)):
    db_delivery = db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    
    db_line = models.DeliveryLine(**line.model_dump(), delivery_id=delivery_id)
    db.add(db_line)
    db.commit()
    db.refresh(db_line)
    return db_line

@router.post("/{delivery_id}/validate")
def validate_delivery(delivery_id: int, db: Session = Depends(get_db)):
    db_delivery = db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    if db_delivery.status == "Done":
        raise HTTPException(status_code=400, detail="Delivery already validated")

    lines = db.query(models.DeliveryLine).filter(models.DeliveryLine.delivery_id == delivery_id).all()
    for line in lines:
        if line.qty_picked <= 0:
            continue
            
        stock = db.query(models.StockLevel).filter(
            models.StockLevel.product_id == line.product_id,
            models.StockLevel.location_id == 1 # Assuming default location 1 for warehouse_id for now
        ).with_for_update().first()
        
        if not stock or stock.quantity < line.qty_picked:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {line.product_id}")
            
        stock.quantity -= line.qty_picked
        
        ledger = models.StockLedger(
            product_id=line.product_id,
            location_id=1,
            doc_type="delivery",
            doc_id=delivery_id,
            delta=-line.qty_picked,
            balance_after=stock.quantity,
            actor_id=1
        )
        db.add(ledger)
        
    db_delivery.status = "Done"
    db_delivery.validated_at = datetime.utcnow()
    db.commit()
    return {"message": "Delivery validated"}

@router.get("/", response_model=List[schemas.Delivery])
def read_deliveries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    deliveries = db.query(models.Delivery).offset(skip).limit(limit).all()
    return deliveries
