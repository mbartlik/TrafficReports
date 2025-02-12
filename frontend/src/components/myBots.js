import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import apiService from '../apiService';
import BotDetails from './botDetails';
import BotListItem from './botListItem';
import LoadingSpinner from './loadingSpinner';
import styles from '../styles';

function MyBots({ isMobile }) {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBot, setSelectedBot] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchBots = async () => {
        setLoading(true);
        try {
          const response = await apiService.getBots({ userId: user.sub });
          if (!response) {
            setError("No bots found. Please try again later.");
          } else if (response.length === 0) {
            setError("You haven't created any bots yet. Go to 'Create Bot' to get started");
          } else {
            setBots(response);
          }
        } catch (err) {
          console.error("Error fetching bots:", err);
          setError("Failed to fetch bots. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchBots();
    }
  }, [isAuthenticated, user]);

  const updateBot = (newBot) => {
    setBots((prevBots) =>
      newBot
        ? prevBots.map((bot) =>
            bot.id === selectedBot.id ? { ...bot, ...newBot } : bot
          )
        : prevBots.filter((bot) => bot.id !== selectedBot.id)
    );
  };

  if (!isAuthenticated) {
    return (
      <div>
        <h3>You must sign in to view your bots</h3>
        <button onClick={() => loginWithRedirect()}>Sign In</button>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div>
        <h3>Error</h3>
        <p>{error}</p>
        <p>{user.sub}</p>
      </div>
    );
  }

  return (
    <div>
      {selectedBot ? (
        <BotDetails
          bot={selectedBot}
          onClose={() => setSelectedBot(null)}
          updateParent={updateBot}
          isMobile={isMobile}
        />
      ) : bots.length === 0 ? (
        <p>No bots found.</p>
      ) : (
        <>
          <h2>My Bots</h2>
          <ul style={isMobile ? { paddingInlineStart: 0 } : {}}>
            {bots.map((bot) => (
              <BotListItem
                key={bot.id}
                bot={bot}
                style={styles.myBotListItem}
                linkPath={`/bot/${bot.id}`}
                showButtons={true}
                onDetailsClick={(selected) => setSelectedBot(selected)}
                isMobile={isMobile}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default MyBots;
