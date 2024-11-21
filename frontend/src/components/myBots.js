import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import apiService from '../apiService';
import BotDetails from './botDetails';

function MyBots() {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBot, setSelectedBot] = useState(null);

  // Fetch bots on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchBots = async () => {
        setLoading(true); // Start loading
        try {
          // Call API to get the list of bots
          const response = await apiService.getBots({ userId: user.sub });
          setBots(response); // Assuming the API response is the list of bots
        } catch (err) {
          console.error("Error fetching bots:", err);
          setError("Failed to fetch bots. Please try again later.");
        } finally {
          setLoading(false); // Stop loading
        }
      };

      fetchBots();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div>
        <h3>You must sign in to view your bots</h3>
        <button onClick={() => loginWithRedirect()}>Sign In</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h3>Loading your bots...</h3>
        <p>Please wait while we fetch your data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  const updateBot = (newBot) => {
    setBots((prevBots) =>
      prevBots
        .map((bot) => (bot.botId === selectedBot.botId ? newBot : bot))
        .filter((bot) => bot !== null)
    );
  };

  return (
    <div>
      {selectedBot ? (
        <BotDetails bot={selectedBot} onClose={() => setSelectedBot(null)} updateParent={updateBot} />
      ) : bots.length === 0 ? (
        <p>No bots found.</p>
      ) : (
        <>
            <h2>My Bots</h2>
            <ul>
            {bots.map((bot) => (
                <li key={bot.botId} style={{ marginBottom: '15px' }}>
                <h3>{bot.botName}</h3>
                <p>{bot.description}</p>
                <button onClick={() => setSelectedBot(bot)}>View</button>
                </li>
            ))}
            </ul>
        </>
      )}
    </div>
  );
}

export default MyBots;