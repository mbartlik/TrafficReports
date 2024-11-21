import React, { useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import apiService from '../apiService';
import BotForm from './botForm';

function CreateBot() {
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const [success, setSuccess] = useState(false);
  const [createdBotDetails, setCreatedBotDetails] = useState(null);

  const handleCreateBot = async (bot) => {
    if (user) {
      try {
        const response = await apiService.createBot(
          bot.botName,
          bot.description,
          bot.links,
          user.sub
        );
        setSuccess(true);
        setCreatedBotDetails({ botId: response.botId });
      } catch (error) {
        console.error("Error creating bot:", error);
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
        <p><strong>Bot Name:</strong> {createdBotDetails?.botId ?? "Loading..."}</p>
      </div>
    );
  }

  return <BotForm onSubmit={handleCreateBot} isEditing={false} />;
}

export default CreateBot;