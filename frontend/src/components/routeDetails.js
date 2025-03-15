import React, { useEffect, useState } from 'react';
import apiService from '../apiService';
import LoadingSpinner from './loadingSpinner';

const RouteDetails = ({ route, onBack, userId, onDelete }) => {
  const [currentRouteDirectionalInfo, setcurrentRouteDirectionalInfo] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    const fetchCurrentRouteDirectionalInfo = async () => {
      try {
        const routeInfo = await apiService.getRouteInfo(
          route.StartLatitude, 
          route.StartLongitude, 
          route.EndLatitude, 
          route.EndLongitude
        );
        setcurrentRouteDirectionalInfo(routeInfo);
      } catch (error) {
        console.error("Error fetching route info:", error.message);
      }
    };

    const fetchRouteData = async () => {
      try {
        const data = await apiService.getRouteData(route.Id);
        setRouteData(data);
      } catch (error) {
        console.error("Error fetching route data:", error.message);
      }
    };

    if (route && route.StartLatitude && route.StartLongitude && route.EndLatitude && route.EndLongitude) {
      fetchCurrentRouteDirectionalInfo();
      fetchRouteData();
    }
  }, [route]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiService.deleteRoute(route.Id, userId);
      setDeleteSuccess(true);
      setIsDeleting(false);
      onDelete(route.Id); // Call the onDelete prop with the route ID
      setTimeout(() => {
        onBack(); // Go back to the routes list after deletion
      }, 2000); // Display success message for 2 seconds
    } catch (error) {
      console.error("Error deleting route:", error.message);
      setIsDeleting(false);
    }
  };

  const convertMetersToMiles = (meters) => {
    return (meters / 1609.34).toFixed(2);
  };

  const convertDurationStringToTime = (durationString) => {
    const seconds = parseInt(durationString, 10);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    let timeString = '';
    if (hours > 0) {
      timeString += `${hours}h `;
    }
    if (minutes > 0) {
      timeString += `${minutes}m `;
    }
    timeString += `${remainingSeconds}s`;
  
    return timeString.trim();
  };

  const convertToUserTimezone = (gmtTime) => {
    const date = new Date(gmtTime);
    return date.toLocaleString('en-US', {
      timeZoneName: 'short',
      hour12: true,
    });
  };

  return (
    <div>
      {isDeleting && <LoadingSpinner />}
      {!isDeleting && !deleteSuccess && (
        <>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Back
          </button>
          {currentRouteDirectionalInfo && routeData ? (
            <div>
              <h2>{route.Name ? route.Name : "Route Details"}</h2>
              <p>Start Location: {route.StartLocationAddress}</p>
              <p>End Location: {route.EndLocationAddress}</p>
              <p>Distance: {convertMetersToMiles(currentRouteDirectionalInfo.distanceMeters)} miles</p>
              <p>Current Duration: {convertDurationStringToTime(currentRouteDirectionalInfo.duration)}</p>
              <button onClick={handleDelete} style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>
                Delete Route
              </button>
              <h3>Route Data Over Time</h3>
              <ul>
                {routeData.map((data, index) => (
                  <li key={index}>
                    <p>Duration: {convertDurationStringToTime(data.Duration)}</p>
                    <p>Time: {convertToUserTimezone(data.Time)}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : <LoadingSpinner />}
        </>
      )}
      {deleteSuccess && (
        <>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Back
          </button>
          <div style={{ color: 'green', marginTop: '20px' }}>
            Route deleted successfully!
          </div>
        </>
      )}
    </div>
  );
};

export default RouteDetails;