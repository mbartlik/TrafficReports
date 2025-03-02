import React from 'react';
import styles from '../styles';
import LoadingSpinner from './loadingSpinner';

const Home = ({ routes, loading, isMobile, isDbActive, isAuthenticated }) => {
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

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <section>
          {routes.length > 0 ? (
            <>
              <h2 style={isMobile ? styles.mobileHeader : {}}>Tracked Routes</h2>
              <ul style={isMobile ? styles.mobileList : {}}>
                {routes.map((route) => (
                  <li key={route.id}>
                    {/* Add a link or any other details about the route */}
                    {route.StartLocation} to {route.EndLocation} - Frequency: {route.Frequency}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h2>You are not currently tracking any routes.</h2>
              <p>Click <strong>"Track a new route"</strong> to start tracking your routes.</p>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
