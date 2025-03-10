import React, { useState } from 'react';
import styles from '../styles';
import LoadingSpinner from './loadingSpinner';
import RouteDetails from './routeDetails';

const Home = ({ routes, setRoutes, loading, isMobile, isDbActive, isAuthenticated, userId }) => {
  const [selectedRoute, setSelectedRoute] = useState(null);

  if (!isDbActive) {
    return <h2>The database is currently unavailable. Please try again later.</h2>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h2>You need to log in to see your tracked routes.</h2>
        <p>Please log in to view your data.</p>
      </div>
    );
  }

  const handleDelete = (routeId) => {
    setRoutes(routes.filter(route => route.Id !== routeId));
  };

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <section>
          {selectedRoute ? (
            <RouteDetails 
              route={selectedRoute} 
              onBack={() => setSelectedRoute(null)} 
              userId={userId} 
              onDelete={handleDelete} 
            />
          ) : (
            <>
              <h2 style={isMobile ? styles.mobileHeader : {}}>Tracked Routes</h2>
              <ul style={isMobile ? styles.mobileList : {}}>
                {routes.map((route) => (
                  <li key={route.Id}>
                    {route.StartLocationAddress} -> {route.EndLocationAddress} 
                    <button onClick={() => setSelectedRoute(route)}>View</button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;