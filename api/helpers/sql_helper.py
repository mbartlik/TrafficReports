import os
import pyodbc

connection_string = os.getenv("AZURE_SQL_CONNECTIONSTRING")

def get_conn():
    return pyodbc.connect(connection_string)

def get_database_status(conn):
    """Check the status of 'LiveDataBotsDB' database."""
    try:
        query = "SELECT name, state_desc FROM sys.databases WHERE name = 'LiveDataBotsDB'"
        cursor = conn.cursor()
        cursor.execute(query)
        result = cursor.fetchone()
        return {"database": result[0], "status": result[1]} if result else None
    except Exception as e:
        print(f"Error retrieving database status: {e}")
        return None

def get_tracked_routes(conn, user_id=None):
    """Retrieve tracked routes, optionally filtered by user_id."""
    try:
        query = "SELECT * FROM TrackedRoutes"
        params = []
        if user_id:
            query += " WHERE UserId = ?"
            params.append(user_id)
        query += " ORDER BY DateCreated"

        cursor = conn.cursor()
        cursor.execute(query, params)
        columns = [column[0] for column in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error retrieving tracked routes: {e}")
        return None

def create_tracked_route(conn, start_address, start_latitude, start_longitude, end_address, end_latitude, end_longitude, user_id, name):
    """Insert a new tracked route, ensuring max 2 routes per user."""
    try:
        if len(get_tracked_routes(conn, user_id)) >= 2:
            return {"success": False, "message": "Maximum 2 routes allowed. Delete one to create a new one."}

        query = """
        INSERT INTO TrackedRoutes 
        (UserId, StartLocationAddress, StartLatitude, StartLongitude, EndLocationAddress, EndLatitude, EndLongitude, DateCreated, Frequency, Name) 
        VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), 1, ?)
        """
        params = [user_id, start_address, start_latitude, start_longitude, end_address, end_latitude, end_longitude, name]
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        return {"success": cursor.rowcount > 0, "message": "Route created successfully."}
    except Exception as e:
        print(f"Error inserting tracked route: {e}")
        return {"success": False, "message": "Error inserting tracked route."}

def delete_tracked_route(conn, route_id, user_id):
    """Delete a tracked route and its associated data."""
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM TrackedRoutes WHERE Id = ? AND UserId = ?", [route_id, user_id])
        if cursor.rowcount == 0:
            conn.rollback()
            return False
        cursor.execute("DELETE FROM RouteData WHERE Id = ?", [route_id])
        conn.commit()
        return True
    except Exception as e:
        print(f"Error deleting tracked route: {e}")
        conn.rollback()
        return False

def upload_route_data(conn, route_data_list):
    """Upload route data to the RouteData table."""
    try:
        query = "INSERT INTO RouteData (Id, Duration, Distance, Time) VALUES (?, ?, ?, ?)"
        cursor = conn.cursor()
        for route_data in route_data_list:
            cursor.execute(query, [route_data['id'], route_data['duration'], route_data['distance'], route_data['time']])
        conn.commit()
        return True
    except Exception as e:
        print(f"Error uploading route data: {e}")
        return False

def get_route_data(conn, route_id):
    """Retrieve route data for a specific route ID."""
    try:
        query = "SELECT * FROM RouteData WHERE Id = ? ORDER BY Time"
        cursor = conn.cursor()
        cursor.execute(query, [route_id])
        columns = [column[0] for column in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error retrieving route data: {e}")
        return None