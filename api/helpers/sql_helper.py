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

def get_tracked_routes(conn, user_id=None):
    """Retrieves tracked routes from the TrackedRoutes table. If user_id is provided, filters by user_id."""
    try:
        # Define the base query
        query = "SELECT * FROM TrackedRoutes"
        params = []

        # Add filtering by user_id if provided
        if user_id:
            query += " WHERE UserId = ?"
            params.append(user_id)

        query += " ORDER BY DateCreated"

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
    
def create_tracked_route(conn, start_address, start_latitude, start_longitude, end_address, end_latitude, end_longitude, user_id, name):
    """Inserts a new tracked route into the TrackedRoutes table."""
    try:
        query = """
        INSERT INTO TrackedRoutes 
        (UserId, StartLocationAddress, StartLatitude, StartLongitude, EndLocationAddress, EndLatitude, EndLongitude, DateCreated, Frequency, Name) 
        VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), 1, ?)
        """
        params = [user_id, start_address, start_latitude, start_longitude, end_address, end_latitude, end_longitude, name]  # Placeholder UserId (adjust as needed)

        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()

        return cursor.rowcount > 0  # Returns True if a row was inserted successfully
    except Exception as e:
        print(f"Error inserting tracked route: {e}")
        return False
    
def delete_tracked_route(conn, route_id, user_id):
    """Deletes a tracked route from the TrackedRoutes table for a specific user and from the RouteData table."""
    try:
        # Delete from TrackedRoutes table
        query_tracked_routes = "DELETE FROM TrackedRoutes WHERE Id = ? AND UserId = ?"
        params_tracked_routes = [route_id, user_id]

        cursor = conn.cursor()
        cursor.execute(query_tracked_routes, params_tracked_routes)

        # Check if a row was deleted from TrackedRoutes
        if cursor.rowcount == 0:
            conn.rollback()
            return False

        # Delete from RouteData table
        query_route_data = "DELETE FROM RouteData WHERE Id = ?"
        params_route_data = [route_id]

        cursor.execute(query_route_data, params_route_data)

        conn.commit()

        return True  # Returns True if a row was deleted from TrackedRoutes
    except Exception as e:
        print(f"Error deleting tracked route: {e}")
        conn.rollback()
        return False

def upload_route_data(conn, route_data_list):
    """Uploads route data to the RouteData table."""
    try:
        query = """
        INSERT INTO RouteData (Id, Duration, Distance, Time)
        VALUES (?, ?, ?, ?)
        """
        cursor = conn.cursor()

        for route_data in route_data_list:
            params = [
                route_data['id'],
                route_data['duration'],
                route_data['distance'],
                route_data['time']
            ]
            cursor.execute(query, params)

        conn.commit()
        return True  # Returns True if all rows were inserted successfully
    except Exception as e:
        print(f"Error uploading route data: {e}")
        return False

def get_route_data(conn, route_id):
    """Retrieves route data from the RouteData table for a specific route ID."""
    try:
        query = "SELECT * FROM RouteData WHERE Id = ? ORDER BY Time"
        params = [route_id]

        cursor = conn.cursor()
        cursor.execute(query, params)

        # Fetch all results
        results = cursor.fetchall()

        # Convert results to a list of dictionaries for easy handling
        route_data = []
        columns = [column[0] for column in cursor.description]
        for row in results:
            data = dict(zip(columns, row))
            route_data.append(data)

        return route_data
    except Exception as e:
        print(f"Error retrieving route data: {e}")
        return None


# CREATE TABLE TrackedRoutes (
#     Id INT IDENTITY(1,1) PRIMARY KEY,
#     Name NVARCHAR(255) NOT NULL,
#     UserId NVARCHAR(255) NOT NULL,
#     DateCreated DATETIME DEFAULT GETDATE(),
#     StartLocationAddress NVARCHAR(255) NOT NULL,
#     StartLatitude FLOAT NOT NULL,
#     StartLongitude FLOAT NOT NULL,
#     EndLocationAddress NVARCHAR(255) NOT NULL,
#     EndLatitude FLOAT NOT NULL,
#     EndLongitude FLOAT NOT NULL,
#     Frequency INT NOT NULL
# );

# CREATE TABLE RouteData (
#     Id INT,
#     Duration INT,
#     Distance FLOAT,
#     Time DATETIME
# );