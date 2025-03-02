import os
import pyodbc

connection_string = os.getenv("AZURE_SQL_CONNECTIONSTRING")

def get_conn():
    conn = pyodbc.connect(connection_string)
    return conn

def get_database_status(conn):
    """
    Retrieves the status of the 'LiveDataBotsDB' database by querying the sys.databases catalog view.
    """
    try:
        query = """
        SELECT name, state_desc 
        FROM sys.databases 
        WHERE name = 'LiveDataBotsDB'
        """

        cursor = conn.cursor()
        cursor.execute(query)

        # Fetch the result
        result = cursor.fetchone()

        if result:
            return {"database": result[0], "status": result[1]}
        else:
            print("database not found")
            return None  # Database not found

    except Exception as e:
        print(f"Error retrieving database status: {e}")
        return None

def get_tracked_routes(conn, user_id):
    """Retrieves tracked routes from the TrackedRoutes table for a specific user."""
    try:
        # Define the query to select all routes for the given user
        query = "SELECT * FROM TrackedRoutes WHERE UserId = ? ORDER BY DateCreated"
        params = [user_id]

        cursor = conn.cursor()
        cursor.execute(query, params)

        # Fetch all results
        results = cursor.fetchall()

        # Convert results to a list of dictionaries for easy handling
        routes = []
        columns = [column[0] for column in cursor.description]
        for row in results:
            route = dict(zip(columns, row))
            routes.append(route)

        return routes
    except Exception as e:
        print(f"Error retrieving tracked routes: {e}")
        return None

# CREATE TABLE TrackedRoutes (
#     Id INT IDENTITY(1,1) PRIMARY KEY,
#     UserId NVARCHAR(255) NOT NULL,
#     DateCreated DATETIME DEFAULT GETDATE(),
#     StartLocation NVARCHAR(255) NOT NULL,
#     EndLocation NVARCHAR(255) NOT NULL,
#     Frequency INT NOT NULL
# );
