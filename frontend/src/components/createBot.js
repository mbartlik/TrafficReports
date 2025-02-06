import React, { useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router-dom';
import apiService from '../apiService';
import BotForm from './botForm';
import styles from '../styles';

function CreateBot({ isMobile }) {
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const [success, setSuccess] = useState(false);
  const [createdBotDetails, setCreatedBotDetails] = useState(null);

  const handleCreateBot = async (bot) => {
    if (user) {
      try {
        const response = await apiService.createBot(bot, user.sub);
        if (!response || !response.id) {
          throw new Error("Response is null or missing botId");
        }
        setSuccess(true);
        setCreatedBotDetails({ id: response.id });
      } catch (error) {
        console.error("Error creating bot:", error);
        alert("There was a problem creating the bot. Please try again later.");
      }
    }
  };
  

  if (!isAuthenticated) {
    return (
      <div>
        <h3>You must sign in to create a bot</h3>
        <button onClick={() => loginWithRedirect()}>Sign In</button>
      </div>
    );
  }

  if (success) {
    return (
      <div>
        <h2>Bot Created Successfully!</h2>
        {createdBotDetails && (
            <>
                <p><strong>Bot Name:</strong> {createdBotDetails?.id}</p>
                <Link to={`/bot/${createdBotDetails.id}`} style={{ ...styles.actionButton, ...styles.chatButton, marginLeft: '0' }}>
                    Chat
                </Link>
            </>
        )}
      </div>
    );
  }

  return <BotForm onSubmit={handleCreateBot} isEditing={false} isMobile={isMobile} />;
}

export default CreateBot;