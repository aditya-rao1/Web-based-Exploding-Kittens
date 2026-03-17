from http.client import HTTPException

from sqlmodel import create_engine
import os

database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("The database url was not set")
    raise HTTPException(500, "No database found")
engine = create_engine(database_url, echo=True)
