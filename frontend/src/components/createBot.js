import React, { useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router-dom';
import apiService from '../apiService';
import BotForm from './botForm';
import LoadingSpinner from './loadingSpinner';
import styles from '../styles';

function CreateBot({ isMobile }) {
  const { isAuthenticated, loginWithRedirect, user, isLoading: authLoading } = useAuth0();
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [createdBotDetails, setCreatedBotDetails] = useState(null);

  const handleCreateBot = async (bot) => {
    if (user) {
      setStatus("loading");
      try {
        const response = await apiService.createBot(bot, user.sub);
        if (!response || !response.id) {
          throw new Error("Response is null or missing botId");
        }
        setStatus("success");
        setCreatedBotDetails({ id: response.id });
        return true;
      } catch (error) {
        console.error("Error creating bot:", error);
        alert(error.message || "There was a problem creating the bot. Please try again later.");
        setStatus("error");
      }
    }
  };

  // Display loading spinner if auth is still loading
  if (authLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h3>You must sign in to create a bot</h3>
        <button onClick={() => loginWithRedirect()}>Sign In</button>
      </div>
    );
  }

  return (
    <>
      <br />
      {status === "loading" && <div>Creating bot, please wait...</div>}
      {status === "success" && createdBotDetails ? (
        <div>
          <br />
          <h2>Bot Created Successfully!</h2>
          <p><strong>Bot ID:</strong> {createdBotDetails.id}</p>
          <Link to={`/bot/${createdBotDetails.id}`} style={{ ...styles.actionButton, ...styles.chatButton, marginLeft: '0' }}>
            Chat
          </Link>
        </div>
      ) : (
        <BotForm onSubmit={handleCreateBot} isEditing={false} isMobile={isMobile} />
      )}
    </>
  );
  
}

export default CreateBot;