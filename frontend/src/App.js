import React, { useState, useEffect } from 'react';
import Navbar from "./components/navbar";
import Home from "./components/home";
import About from './components/about';
import Bot from './components/bot';
import CreateBot from './components/createBot';
import MyBots from './components/myBots';
import apiService from './apiService';
import styles from './styles';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    RouteProps
} from "react-router-dom";

function App() {
  const [isDbActive, setIsDbActive] = useState(true);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
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
    if (isDbActive) {
      const fetchBots = async () => {
        setLoading(true);
        try {
          const botsList = await apiService.getBots({ isFeatured: 1 });
          if (!botsList) {
            throw new Error('Bots list is null');
          }
          setBots(botsList);
        } catch (error) {
          console.error('Error fetching bots:', error);
          setBots([]);
        } finally {
          setLoading(false);
        }
      };

      fetchBots();
    }
  }, [isDbActive]);

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
          <Route path="/" element={<Home bots={bots} loading={loading && isDbActive} isMobile={isMobile} isDbActive={isDbActive} />} />
          <Route path="/about" element={<About isMobile={isMobile} />} />
          <Route path="/bot/:id" element={<Bot isMobile={isMobile} />} />
          <Route path="/create-bot" element={<CreateBot isMobile={isMobile} />} />
          <Route path="/my-bots" element={<MyBots isMobile={isMobile} />} />
          {/* Add a fallback 404 route */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
