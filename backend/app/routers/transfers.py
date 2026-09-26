from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/transfers",
    tags=["transfers"]
)

@router.post("/", response_model=schemas.Transfer)
def create_transfer(transfer: schemas.TransferCreate, db: Session = Depends(get_db)):
    db_transfer = models.Transfer(**transfer.model_dump(), created_by=1) # Mock user 1
    db.add(db_transfer)
    db.commit()
    db.refresh(db_transfer)
    return db_transfer

@router.post("/{transfer_id}/lines", response_model=schemas.TransferLine)
def add_transfer_line(transfer_id: int, line: schemas.TransferLineCreate, db: Session = Depends(get_db)):
    db_transfer = db.query(models.Transfer).filter(models.Transfer.id == transfer_id).first()
    if not db_transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    db_line = models.TransferLine(**line.model_dump(), transfer_id=transfer_id)
    db.add(db_line)
    db.commit()
    db.refresh(db_line)
    return db_line

@router.post("/{transfer_id}/validate")
def validate_transfer(transfer_id: int, db: Session = Depends(get_db)):
    db_transfer = db.query(models.Transfer).filter(models.Transfer.id == transfer_id).first()
    if not db_transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    if db_transfer.status == "Done":
        raise HTTPException(status_code=400, detail="Transfer already validated")

    lines = db.query(models.TransferLine).filter(models.TransferLine.transfer_id == transfer_id).all()
    for line in lines:
        # Decrease stock from source
        stock_from = db.query(models.StockLevel).filter(
            models.StockLevel.product_id == line.product_id,
            models.StockLevel.location_id == db_transfer.from_location_id
        ).with_for_update().first()
        if not stock_from or stock_from.quantity < line.qty:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {line.product_id} at source location")
        
        stock_from.quantity -= line.qty
        
        # Increase stock at destination
        stock_to = db.query(models.StockLevel).filter(
            models.StockLevel.product_id == line.product_id,
            models.StockLevel.location_id == db_transfer.to_location_id
        ).with_for_update().first()
        if not stock_to:
            stock_to = models.StockLevel(product_id=line.product_id, location_id=db_transfer.to_location_id, quantity=0)
            db.add(stock_to)
        
        stock_to.quantity += line.qty
        
        # Add ledger entries
        ledger_from = models.StockLedger(
            product_id=line.product_id,
            location_id=db_transfer.from_location_id,
            doc_type="transfer",
            doc_id=transfer_id,
            delta=-line.qty,
            balance_after=stock_from.quantity,
            actor_id=1
        )
        ledger_to = models.StockLedger(
            product_id=line.product_id,
            location_id=db_transfer.to_location_id,
            doc_type="transfer",
            doc_id=transfer_id,
            delta=line.qty,
            balance_after=stock_to.quantity,
            actor_id=1
        )
        db.add(ledger_from)
        db.add(ledger_to)

    db_transfer.status = "Done"
    db.commit()
    return {"message": "Transfer validated"}
