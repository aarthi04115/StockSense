from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/warehouses",
    tags=["warehouses"]
)

@router.post("/", response_model=schemas.Warehouse)
def create_warehouse(warehouse: schemas.WarehouseCreate, db: Session = Depends(get_db)):
    db_warehouse = models.Warehouse(**warehouse.model_dump())
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse

@router.get("/", response_model=List[schemas.Warehouse])
def read_warehouses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    warehouses = db.query(models.Warehouse).offset(skip).limit(limit).all()
    return warehouses

@router.get("/locations", response_model=List[schemas.Location])
def read_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    locations = db.query(models.Location).offset(skip).limit(limit).all()
    return locations

@router.post("/locations", response_model=schemas.Location)
def create_location(loc: schemas.LocationCreate, db: Session = Depends(get_db)):
    db_loc = models.Location(**loc.model_dump())
    db.add(db_loc)
    db.commit()
    db.refresh(db_loc)
    return db_loc
