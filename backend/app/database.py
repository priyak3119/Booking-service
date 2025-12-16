from sqlalchemy import create_engine, MetaData
from databases import Database

# Local SQLite database file
DATABASE_URL = "sqlite:///./events.db"

database = Database(DATABASE_URL)
metadata = MetaData()
engine = create_engine(DATABASE_URL)
