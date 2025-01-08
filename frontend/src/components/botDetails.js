import React, { useState } from 'react';
import apiService from '../apiService';
import BotForm from './botForm';

function BotDetails({ bot, onClose, updateParent }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayedBot, setDisplayedBot] = useState(bot);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleUpdateBot = async (updatedBot) => {
    try {
      await apiService.updateBot(bot, updatedBot);
      setIsEditing(false); // Exit edit mode after updating
      setDisplayedBot(updatedBot);
      updateParent(updatedBot); // Update the parent component
    } catch (error) {
      console.error("Error updating bot:", error);
    }
  };

  const handleDeleteBot = async () => {
    try {
      await apiService.deleteBot(bot.id); // Assume `deleteBot` is implemented in `apiService`
      setIsDeleted(true); // Mark the bot as deleted
      updateParent(null); // Notify parent to remove the bot
    } catch (error) {
      console.error("Error deleting bot:", error);
    } finally {
      setIsDeleting(false); // Close confirmation dialog
    }
  };

  return (
    <div>
      {isDeleted ? (
        <div>
          <h3>Bot Deleted Successfully</h3>
          <button onClick={onClose}>Close</button>
        </div>
      ) : isEditing ? (
        <BotForm
          bot={displayedBot}
          onSubmit={handleUpdateBot}
          onCancel={() => setIsEditing(false)} // Cancel editing
          isEditing={true}
        />
      ) : (
        <div>
          {/* Display Bot Details */}
          <h3>{displayedBot.name}</h3>
          <p><strong>Description:</strong> {displayedBot.description}</p>
          <p><strong>Response Style:</strong> {displayedBot.responseStyle || "N/A"}</p>
          <p><strong>Greeting Text:</strong> {displayedBot.greetingText || "N/A"}</p>
          <p><strong>Context:</strong> {displayedBot.context}</p>
          <p>
            <strong>Only Answer with Context:</strong>{" "}
            {displayedBot.onlyAnswerWithContext ? "Yes" : "No"}
          </p>

          {/* Action Buttons */}
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={() => setIsDeleting(true)}>Delete</button>
          <button onClick={onClose}>Close</button>

          {/* Confirmation Dialog */}
          {isDeleting && (
            <div>
              <p>Are you sure you want to delete this bot?</p>
              <button onClick={handleDeleteBot}>Yes, Delete</button>
              <button onClick={() => setIsDeleting(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BotDetails;
