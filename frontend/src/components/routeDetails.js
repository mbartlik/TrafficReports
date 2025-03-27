import React, { useEffect, useState } from 'react';
import apiService from '../apiService';
import styles from '../styles';
import LoadingSpinner from './loadingSpinner';
import RouteDurationGraph from './routeDurationGraph';

const RouteDetails = ({ route, onBack, userId, onDelete }) => {
  const [currentRouteDirectionalInfo, setCurrentRouteDirectionalInfo] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routeInfo, data] = await Promise.all([
          apiService.getRouteInfo(route.StartLatitude, route.StartLongitude, route.EndLatitude, route.EndLongitude),
          apiService.getRouteData(route.Id)
        ]);
        setCurrentRouteDirectionalInfo(routeInfo);
        setRouteData(data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    if (route && route.StartLatitude && route.StartLongitude && route.EndLatitude && route.EndLongitude) {
      fetchData();
    }
  }, [route]);

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await apiService.deleteRoute(route.Id, userId);
      setDeleteSuccess(true);
      setIsDeleting(false);
      onDelete(route.Id);
      setTimeout(onBack, 2000);
    } catch (error) {
      console.error("Error deleting route:", error.message);
      setIsDeleting(false);
    }
  };

  const convertMetersToMiles = meters => (meters / 1609.34).toFixed(2);

  const convertDurationStringToTime = durationString => {
    const seconds = parseInt(durationString, 10);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m ` : ''}${remainingSeconds}s`.trim();
  };

  const convertToUserTimezone = gmtTime => {
    const date = new Date(gmtTime);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).replace(/ GMT.*$/, '');
  };

  const calculateStats = data => {
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
    <div style={{ marginTop: '1rem' }}>
      {isDeleting && <LoadingSpinner />}
      {!isDeleting && !deleteSuccess && (
        <>
          {currentRouteDirectionalInfo && routeData ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem' }}>
                <span 
                  onClick={onBack} 
                  style={{ 
                    cursor: 'pointer', 
                    fontSize: '1.5rem', 
                    lineHeight: '1', 
                    userSelect: 'none' 
                  }}
                >
                  ←
                </span>
                <h2 style={{ margin: 0 }}>{route.Name || "Route Details"}</h2>
                <button onClick={handleDelete} style={{ ...styles.standardButton, ...styles.deleteButton }}>
                  Delete
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
                  <RouteDurationGraph 
                    routeData={routeData} 
                    convertDurationStringToTime={convertDurationStringToTime} 
                    convertToUserTimezone={convertToUserTimezone} 
                  />
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem' }}>
            <span 
              onClick={onBack} 
              style={{ 
                cursor: 'pointer', 
                fontSize: '1.5rem', 
                lineHeight: '1', 
                userSelect: 'none' 
              }}
            >
              ←
            </span>
            <h2 style={{ margin: 0 }}>Route Deleted</h2>
          </div>
          <div style={{ color: 'green', marginTop: '20px' }}>
            Route deleted successfully!
          </div>
        </>
      )}
      {showConfirmDelete && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
          <p>Are you sure you want to delete this route?</p>
          <button onClick={confirmDelete} style={{ ...styles.standardButton, marginRight: '10px' }}>Yes</button>
          <button onClick={() => setShowConfirmDelete(false)} style={styles.standardButton}>No</button>
        </div>
      )}
    </div>
  );
};

export default RouteDetails;

