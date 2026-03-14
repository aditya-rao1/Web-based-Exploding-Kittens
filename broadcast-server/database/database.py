from sqlmodel import SQLModel, create_engine
import os

#TODO: Do not commit these 
DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL, echo=True)