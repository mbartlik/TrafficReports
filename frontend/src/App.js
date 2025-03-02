import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Navbar from "./components/navbar";
import Home from "./components/home";
import About from './components/about';
import apiService from './apiService';
import styles from './styles';
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";

function App() {
  const { user, isAuthenticated } = useAuth0(); // Destructure values from useAuth0
  const [isDbActive, setIsDbActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Updated to 768px
  const [overlayMessage, setOverlayMessage] = useState(
    "Database is currently paused. Sorry, this is a hobby project. Please wait a minute or two..."
  );

  useEffect(() => {
    let interval;
    let timeoutId;

    const checkDatabaseStatus = async () => {
      try {
        const active = await apiService.isDatabaseActive();
        setIsDbActive(active);

        if (active) {
          clearInterval(interval); // Stop checking if the database is active
          clearTimeout(timeoutId); // Clear timeout when active
        }
      } catch (error) {
        setIsDbActive(false); // Assume inactive if there's an error
      }
    };

    checkDatabaseStatus();
    interval = setInterval(checkDatabaseStatus, 4000);

    timeoutId = setTimeout(() => {
      setOverlayMessage(
        "Sorry, there's been a problem spinning up the database. Please check again later."
      );
      clearInterval(interval);
    }, 120000); // 2 minutes in milliseconds

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Updated to use 768px for mobile breakpoint
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isDbActive && isAuthenticated && user) {
      const fetchTrackedRoutes = async () => {
        setLoading(true);
        try {
          console.log(user);
          const routesList = await apiService.getTrackedRoutes(user.sub);
          if (!routesList) {
            throw new Error('Routes list is null');
          }
          setRoutes(routesList);
        } catch (error) {
          console.error('Error fetching routes:', error);
          setRoutes([]);
        } finally {
          setLoading(false);
        }
      };

      fetchTrackedRoutes();
    }
  }, [isDbActive, user, isAuthenticated]);

  return (
    <Router>
      {/* Blocking overlay if the database is inactive */}
      {!isDbActive && (
        <div style={styles.overlay}>
          <h2>{overlayMessage}</h2>
        </div>
      )}

      <Navbar isMobile={isMobile} />
      <div style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        <Routes>
          <Route path="/" element={<Home routes={routes} loading={loading && isDbActive} isMobile={isMobile} isDbActive={isDbActive} isAuthenticated={isAuthenticated} />} />
          <Route path="/about" element={<About isMobile={isMobile} />} />
          {/* Add a fallback 404 route */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
