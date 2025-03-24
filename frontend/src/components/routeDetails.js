import React, { useEffect, useState } from 'react';
import apiService from '../apiService';
import LoadingSpinner from './loadingSpinner';
import RouteDurationGraph from './routeDurationGraph';

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
    const localTimeString = date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  
    // Remove the timezone part (e.g., "GMT", "PST", etc.) but keep the AM/PM part
    const parts = localTimeString.split(' ');
    return parts.slice(0, -1).join(' ') + ' ' + parts[parts.length - 1];
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) return { mean: 0, min: 0, max: 0, minTime: null, maxTime: null };
  
    const durations = data.map(d => parseInt(d.Duration, 10));
    const total = durations.reduce((acc, curr) => acc + curr, 0);
    const mean = total / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
  
    const minTime = data[durations.indexOf(min)].Time;
    const maxTime = data[durations.indexOf(max)].Time;
  
    return { mean, min, max, minTime, maxTime };
  };

  const stats = calculateStats(routeData);

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{route.Name ? route.Name : "Route Details"}</h2>
                <button onClick={handleDelete} style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>
                  Delete Route
                </button>
              </div>
              <p>Start Location: {route.StartLocationAddress}</p>
              <p>End Location: {route.EndLocationAddress}</p>
              <p>Distance: {convertMetersToMiles(currentRouteDirectionalInfo.distanceMeters)} miles</p>
              <p>Current Duration: {convertDurationStringToTime(currentRouteDirectionalInfo.duration)}</p>
              {routeData.length > 0 ? (
                <>
                  <p>Mean Duration: {convertDurationStringToTime(stats.mean.toString())}</p>
                  <p>Min Duration: {convertDurationStringToTime(stats.min.toString())} - {convertToUserTimezone(stats.minTime)}</p>
                  <p>Max Duration: {convertDurationStringToTime(stats.max.toString())} - {convertToUserTimezone(stats.maxTime)}</p>
                  <h3>Route Data Over Time</h3>
                  <RouteDurationGraph routeData={routeData} convertDurationStringToTime={convertDurationStringToTime} convertToUserTimezone={convertToUserTimezone}/>
                </>
              ) : (
                <p>We are now tracking this route. Come back soon to see duration over time.</p>
              )}
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