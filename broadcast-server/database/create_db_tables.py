from database.database import engine
from database.models import Room
from sqlmodel import SQLModel

def create_db_tables():
    SQLModel.metadata.create_all(engine)