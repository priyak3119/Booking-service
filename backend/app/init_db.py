from app.database import engine, metadata

# Create tables
metadata.create_all(engine)
print("Database and tables created!")
