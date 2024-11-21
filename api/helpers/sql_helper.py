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

def get_bot_links(conn, bot_ids):
    """Fetches links for the given bot IDs from the BotLinks table."""
    if not bot_ids:
        return {}

    try:
        # Create a query to fetch links for the given botIds
        placeholders = ",".join("?" for _ in bot_ids)
        query = f"""
            SELECT botId, link, description
            FROM BotLinks
            WHERE botId IN ({placeholders})
        """

        cursor = conn.cursor()
        cursor.execute(query, bot_ids)

        # Fetch all results
        results = cursor.fetchall()

        # Group links by botId
        links_by_bot_id = {}
        for bot_id, link, description in results:
            if bot_id not in links_by_bot_id:
                links_by_bot_id[bot_id] = []
            links_by_bot_id[bot_id].append({
                "url": link,
                "description": description
            })

        return links_by_bot_id
    except Exception as e:
        print(f"Error retrieving bot links: {e}")
        return {}
    
def get_bots(conn, filters=None):
    """Retrieves bots from the Bots table, optionally filtered by provided attributes.
       Also fetches associated bot links and includes them in the result."""
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

        # Fetch bot links for all botIds
        bot_ids = [bot["botId"] for bot in bots]
        bot_links = get_bot_links(conn, bot_ids)

        # Add links to each bot
        for bot in bots:
            bot["links"] = bot_links.get(bot["botId"], [])

        return bots
    except Exception as e:
        print(f"Error retrieving bots: {e}")
        return None

def create_bot(conn, name, bot_id, user_id, description):
    """Inserts a new bot record into the Bots table, including description if provided.
       First checks if a bot with the given bot_id already exists."""
    try:
        # Check if bot with the same bot_id already exists
        existing_bots = get_bots(conn, filters={"botId": bot_id})
        if existing_bots:
            print(f"Bot with botId '{bot_id}' already exists.")
            return False, "Bot with that botId already exists"  # Bot already exists, don't create it

        # Insert the new bot since it doesn't exist yet
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Bots (botName, botId, userId, dateCreated, description)
            VALUES (?, ?, ?, GETDATE(), ?)
        """, name, bot_id, user_id, description)

        # Retrieve the auto-generated ID (if you want to use it later)
        cursor.execute("SELECT SCOPE_IDENTITY()")
        new_bot_id = cursor.fetchone()[0]

        conn.commit()
        return True, "Bot created successfully"
    except Exception as e:
        print(f"Error creating bot: {e}")
        return False, f"Error: {str(e)}"

def update_bot(conn, old_bot_id, new_bot_id, new_name, new_description, old_name, old_description, old_links, new_links):
    """
    Updates a bot's name, description, and links in the Bots and BotLinks tables.
    If the botId changes, all associated links are reassigned to the new botId.
    """
    try:
        cursor = conn.cursor()
        changes_made = False

        # Step 1: Update bot name or description if they have changed
        if old_name != new_name or old_description != new_description or old_bot_id != new_bot_id:
            cursor.execute("""
                UPDATE Bots
                SET botName = ?, description = ?, botId = ?
                WHERE botId = ?
            """, new_name, new_description, new_bot_id, old_bot_id)
            changes_made = True

        # Step 2: Handle bot links
        old_links_set = {(link['url'], link['description']) for link in old_links}
        new_links_set = {(link['url'], link['description']) for link in new_links}

        if old_bot_id != new_bot_id:
            # Bot ID changed: Reassign all existing links to the new botId
            cursor.execute("""
                UPDATE BotLinks
                SET botId = ?
                WHERE botId = ?
            """, new_bot_id, old_bot_id)
            changes_made = True

        # Step 3: Determine changes in links
        links_to_add = new_links_set - old_links_set
        links_to_remove = old_links_set - new_links_set

        # Add new links
        for link, description in links_to_add:
            if not create_bot_link(conn, new_bot_id, link, description):
                return False, f"Failed to add link '{link}'"
            changes_made = True

        # Remove old links
        for link, _ in links_to_remove:
            if not delete_bot_link(conn, new_bot_id, link):
                return False, f"Failed to remove link '{link}'"
            changes_made = True

        # Commit changes if any were made
        if changes_made:
            conn.commit()
        return True, "Bot updated successfully" if changes_made else "No changes made"
    except Exception as e:
        print(f"Error updating bot: {e}")
        return False, str(e)

def delete_bot(conn, bot_id):
    """Deletes a bot from Bots and related links from BotLinks."""
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM BotLinks WHERE botId = ?", bot_id)
        cursor.execute("DELETE FROM Bots WHERE botId = ?", bot_id)
        conn.commit()
        return True
    except Exception as e:
        print(f"Error deleting bot: {e}")
        return False

def create_bot_link(conn, bot_id, link, description):
    """Inserts a single BotLink associated with a bot."""
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO BotLinks (botId, link, description)
            VALUES (?, ?, ?)
        """, bot_id, link, description)
        conn.commit()
        return True
    except Exception as e:
        print(f"Error creating bot link: {e}")
        return False

def update_bot_link(conn, bot_id, old_link, new_link, description):
    """Updates a single BotLink's URL and description."""
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE BotLinks
            SET link = ?, description = ?
            WHERE botId = ? AND link = ?
        """, new_link, description, bot_id, old_link)
        conn.commit()
        return True
    except Exception as e:
        print(f"Error updating bot link: {e}")
        return False

def delete_bot_link(conn, bot_id, link):
    """Deletes a BotLink by its botId and link."""
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM BotLinks WHERE botId = ? AND link = ?", bot_id, link)
        conn.commit()
        return True
    except Exception as e:
        print(f"Error deleting bot link: {e}")
        return False

# Tables
# Bots
#    botName
#    botId (hyphenated bot name for url) and primary key
#    description
#    dateCreated
#    userId
#    isFeatured


# BotLinks
#    botId
#    link
#    description