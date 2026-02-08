import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv
load_dotenv()

DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

print("\n--- Setting up database ---")
conn = None
try:
    conn = psycopg2.connect(dbname='postgres', user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    with conn.cursor() as cur:
        cur.execute(f"SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
        exists = cur.fetchone()
        if not exists:
            print(f"Database '{DB_NAME}' does not exist. Creating it...")
            cur.execute(f"CREATE DATABASE {DB_NAME}")
            print("Database created successfully.")
        else:
            print(f"Database '{DB_NAME}' already exists.")

finally:
    if conn:
        conn.close()

print(f"\n--- Populating '{DB_NAME}' database ---")
try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT)
    
    with conn.cursor() as cur:
        print('Creating users table.')
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                fullname TEXT,   
                role TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP        
            )
        """)

        conn.commit()
        print("Tables Created.")

except psycopg2.Error as e:
    print(f"Database error: {e}")

finally:
    if conn:
        conn.close()