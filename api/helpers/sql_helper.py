import os
import pyodbc
from datetime import date

connection_string = os.getenv("AZURE_SQL_CONNECTIONSTRING")

def get_todays_count():
    today = date.today()
    with get_conn() as conn:
        cursor = conn.cursor()
        
        # Check if an entry for today exists
        cursor.execute("SELECT usage_count FROM DAILY_USAGE WHERE usage_date = ?", today)
        result = cursor.fetchone()
        
        if result:
            # If today's entry exists, return the count
            return result.usage_count
        else:
            # If today's entry does not exist, create it with a count of 0
            cursor.execute("INSERT INTO DAILY_USAGE (usage_date, usage_count) VALUES (?, ?)", today, 0)
            conn.commit()
            return 0

def increment_today_count():
    today = date.today()
    with get_conn() as conn:
        cursor = conn.cursor()
        
        # Update today's count by incrementing it by 1
        cursor.execute("UPDATE DAILY_USAGE SET usage_count = usage_count + 1 WHERE usage_date = ?", today)
        
        # Check if the row was updated; if not, create today's entry and set it to 1
        if cursor.rowcount == 0:
            cursor.execute("INSERT INTO DAILY_USAGE (usage_date, usage_count) VALUES (?, ?)", today, 1)
        
        conn.commit()

def get_conn():
    conn = pyodbc.connect(connection_string)
    return conn