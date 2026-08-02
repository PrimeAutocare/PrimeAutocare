import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def main():
    if not DATABASE_URL:
        print("DATABASE_URL not set")
        sys.exit(1)

    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("Keep-alive ping successful")

if __name__ == "__main__":
    main()