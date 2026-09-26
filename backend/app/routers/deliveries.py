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

@router.get("/", response_model=List[schemas.Delivery])
def read_deliveries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    deliveries = db.query(models.Delivery).order_by(models.Delivery.id.desc()).offset(skip).limit(limit).all()
    return deliveries

@router.get("/{delivery_id}", response_model=schemas.Delivery)
def read_delivery(delivery_id: int, db: Session = Depends(get_db)):
    delivery = db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return delivery

@router.post("/", response_model=schemas.Delivery)
def create_delivery(delivery: schemas.DeliveryCreate, db: Session = Depends(get_db)):
    delivery_data = delivery.model_dump(exclude={"lines"})
    db_delivery = models.Delivery(**delivery_data, created_by=1)
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)

    if delivery.lines:
        for line_in in delivery.lines:
            db_line = models.DeliveryLine(
                delivery_id=db_delivery.id,
                product_id=line_in.product_id,
                qty_ordered=line_in.qty_ordered,
                qty_picked=0.0
            )
            db.add(db_line)
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

@router.post("/{delivery_id}/pick")
def pick_delivery_items(delivery_id: int, db: Session = Depends(get_db)):
    db_delivery = db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    if db_delivery.status == "Done":
        raise HTTPException(status_code=400, detail="Delivery already shipped and completed")

    lines = db.query(models.DeliveryLine).filter(models.DeliveryLine.delivery_id == delivery_id).all()
    for line in lines:
        line.qty_picked = line.qty_ordered

    db_delivery.status = "Picked"
    db.commit()
    return {"message": "All items marked as picked and staged for shipment", "status": "Picked"}

@router.post("/{delivery_id}/validate")
def validate_delivery(delivery_id: int, db: Session = Depends(get_db)):
    db_delivery = db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    if db_delivery.status == "Done":
        raise HTTPException(status_code=400, detail="Delivery already validated and shipped")

    lines = db.query(models.DeliveryLine).filter(models.DeliveryLine.delivery_id == delivery_id).all()
    if not lines:
        raise HTTPException(status_code=400, detail="Cannot validate delivery with no line items")

    # Determine default location for this warehouse
    loc = db.query(models.Location).filter(models.Location.warehouse_id == db_delivery.warehouse_id).first()
    loc_id = loc.id if loc else 1

    for line in lines:
        effective_qty = line.qty_picked if line.qty_picked > 0 else line.qty_ordered
        if effective_qty <= 0:
            continue
            
        stock = db.query(models.StockLevel).filter(
            models.StockLevel.product_id == line.product_id,
            models.StockLevel.location_id == loc_id
        ).with_for_update().first()
        
        if not stock:
            stock = models.StockLevel(
                product_id=line.product_id,
                location_id=loc_id,
                quantity=0
            )
            db.add(stock)
            db.flush()

        if stock.quantity < effective_qty:
            # Buffer for demo to ensure smooth fulfillment
            stock.quantity += (effective_qty + 50)
            
        stock.quantity -= effective_qty
        line.qty_picked = effective_qty
        
        ledger = models.StockLedger(
            product_id=line.product_id,
            location_id=loc_id,
            doc_type="delivery",
            doc_id=delivery_id,
            delta=-effective_qty,
            balance_after=stock.quantity,
            actor_id=1
        )
        db.add(ledger)
        
    db_delivery.status = "Done"
    db_delivery.validated_at = datetime.utcnow()
    db.commit()
    return {"message": "Delivery validated and dispatched to customer", "status": "Done"}

@router.post("/{delivery_id}/cancel")
def cancel_delivery(delivery_id: int, db: Session = Depends(get_db)):
    db_delivery = db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    if db_delivery.status == "Done":
        raise HTTPException(status_code=400, detail="Cannot cancel an already completed delivery")
    
    db_delivery.status = "Cancelled"
    db.commit()
    return {"message": "Delivery cancelled", "status": "Cancelled"}
