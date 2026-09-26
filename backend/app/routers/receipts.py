from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/receipts",
    tags=["receipts"]
)

@router.post("/", response_model=schemas.Receipt)
def create_receipt(receipt: schemas.ReceiptCreate, db: Session = Depends(get_db)):
    receipt_data = receipt.model_dump(exclude={"lines"})
    db_receipt = models.Receipt(**receipt_data)
    # Mocking user_id = 1 for now
    db_receipt.created_by = 1 
    db.add(db_receipt)
    db.commit()
    db.refresh(db_receipt)

    if receipt.lines:
        for line_in in receipt.lines:
            db_line = models.ReceiptLine(
                receipt_id=db_receipt.id,
                product_id=line_in.product_id,
                qty_expected=line_in.qty_expected,
                qty_received=0.0
            )
            db.add(db_line)
        db.commit()
        db.refresh(db_receipt)

    return db_receipt

@router.post("/{receipt_id}/lines", response_model=schemas.ReceiptLine)
def add_receipt_line(receipt_id: int, line: schemas.ReceiptLineCreate, db: Session = Depends(get_db)):
    db_receipt = db.query(models.Receipt).filter(models.Receipt.id == receipt_id).first()
    if not db_receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    db_line = models.ReceiptLine(**line.model_dump(), receipt_id=receipt_id)
    db.add(db_line)
    db.commit()
    db.refresh(db_line)
    return db_line

@router.post("/{receipt_id}/validate")
def validate_receipt(receipt_id: int, db: Session = Depends(get_db)):
    db_receipt = db.query(models.Receipt).filter(models.Receipt.id == receipt_id).first()
    if not db_receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if db_receipt.status == "Done":
        raise HTTPException(status_code=400, detail="Receipt already validated")

    lines = db.query(models.ReceiptLine).filter(models.ReceiptLine.receipt_id == receipt_id).all()
    for line in lines:
        if line.qty_received <= 0:
            continue
            
        stock = db.query(models.StockLevel).filter(
            models.StockLevel.product_id == line.product_id,
            models.StockLevel.location_id == 1 # Assuming default location 1 for warehouse_id for now
        ).with_for_update().first()
        
        if not stock:
            stock = models.StockLevel(product_id=line.product_id, location_id=1, quantity=0)
            db.add(stock)
            
        stock.quantity += line.qty_received
        
        ledger = models.StockLedger(
            product_id=line.product_id,
            location_id=1,
            doc_type="receipt",
            doc_id=receipt_id,
            delta=line.qty_received,
            balance_after=stock.quantity,
            actor_id=1
        )
        db.add(ledger)
        
    db_receipt.status = "Done"
    db_receipt.validated_at = datetime.utcnow()
    db.commit()
    return {"message": "Receipt validated"}

@router.get("/", response_model=List[schemas.Receipt])
def read_receipts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    receipts = db.query(models.Receipt).offset(skip).limit(limit).all()
    return receipts
