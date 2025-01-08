import os
import pyodbc
from datetime import date

connection_string = os.getenv("AZURE_SQL_CONNECTIONSTRING")

def get_conn():
    conn = pyodbc.connect(connection_string)
    return conn

def get_todays_count(conn):
    today = date.today()
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

def increment_today_count(conn):
    today = date.today()
    cursor = conn.cursor()
    
    # Update today's count by incrementing it by 1
    cursor.execute("UPDATE DAILY_USAGE SET usage_count = usage_count + 1 WHERE usage_date = ?", today)
    
    # Check if the row was updated; if not, create today's entry and set it to 1
    if cursor.rowcount == 0:
        cursor.execute("INSERT INTO DAILY_USAGE (usage_date, usage_count) VALUES (?, ?)", today, 1)
    
    conn.commit()

def get_bots(conn, filters=None):
    """Retrieves bots from the Bots table, optionally filtered by provided attributes."""
    try:
        # Start with the basic query
        query = "SELECT * FROM Bots"
        params = []

        # Add filters if provided
        if filters:
            filter_conditions = []
            for key, value in filters.items():
                filter_conditions.append(f"{key} = ?")
                params.append(value)
            query += " WHERE " + " AND ".join(filter_conditions)

        cursor = conn.cursor()
        cursor.execute(query, params)

        # Fetch all results
        results = cursor.fetchall()

        # Return the results as a list of dictionaries for easy handling
        bots = []
        columns = [column[0] for column in cursor.description]
        for row in results:
            bot = dict(zip(columns, row))
            bots.append(bot)

        return bots
    except Exception as e:
        print(f"Error retrieving bots: {e}")
        return None

def create_bot(conn, name, bot_id, user_id, description, context, is_featured, greeting_text, only_answer_with_context, response_style):
    """Inserts a new bot record into the Bots table."""
    try:
        # Check if bot with the same bot_id already exists
        existing_bots = get_bots(conn, filters={"botId": bot_id})
        if existing_bots:
            print(f"Bot with botId '{bot_id}' already exists.")
            return False, "Bot with that botId already exists"

        # Insert the new bot with all attributes
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Bots (
                name, id, userId, dateCreated, description, context, isFeatured,
                greetingText, onlyAnswerWithContext, responseStyle
            )
            VALUES (?, ?, ?, GETDATE(), ?, ?, ?, ?, ?, ?)
        """, name, bot_id, user_id, description, context, is_featured, greeting_text, only_answer_with_context, response_style)

        conn.commit()
        return True, "Bot created successfully"
    except Exception as e:
        print(f"Error creating bot: {e}")
        return False, f"Error: {str(e)}"

def update_bot(conn, old_bot_id, new_bot_id, new_name, new_description, new_context, is_featured,
               greeting_text, only_answer_with_context, response_style):
    """
    Updates a bot's details in the Bots table.
    """
    try:
        cursor = conn.cursor()
        changes_made = False

        # Update all fields if any have changed
        cursor.execute("""
            UPDATE Bots
            SET name = ?, description = ?, id = ?, context = ?, isFeatured = ?,
                greetingText = ?, onlyAnswerWithContext = ?, responseStyle = ?
            WHERE id = ?
        """, new_name, new_description, new_bot_id, new_context, is_featured, greeting_text,
              only_answer_with_context, response_style, old_bot_id)
        changes_made = cursor.rowcount > 0

        if changes_made:
            conn.commit()
            return True, "Bot updated successfully"
        return False, "No changes made"
    except Exception as e:
        print(f"Error updating bot: {e}")
        return False, str(e)

def delete_bot(conn, bot_id):
    """Deletes a bot from Bots"""
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Bots WHERE id = ?", bot_id)
        conn.commit()
        return True
    except Exception as e:
        print(f"Error deleting bot: {e}")
        return False

# Tables
# Bots
# CREATE TABLE Bots (
#     id NVARCHAR(255) NOT NULL, -- Hyphenated bot name for URL, used as the primary key
#     name NVARCHAR(255) NOT NULL, -- Bot name
#     description NVARCHAR(MAX), -- Description of the bot
#     context NVARCHAR(MAX), -- Description of the bot
#     dateCreated DATETIME2 DEFAULT GETDATE(), -- Date and time the bot was created
#     userId NVARCHAR(255) NOT NULL, -- ID of the user who created the bot
#     isFeatured BIT DEFAULT 0, -- Whether the bot is featured (true/false)
#     greetingText NVARCHAR(MAX), -- Custom greeting text for the bot
#     onlyAnswerWithContext BIT DEFAULT 0, -- Whether the bot should only answer questions using provided context
#     responseStyle NVARCHAR(255), -- Response style (e.g., humorous, formal)
# );