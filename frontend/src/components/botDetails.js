import React, { useState, useEffect } from 'react';
import apiService from '../apiService';
import BotForm from './botForm';
import styles from '../styles';

function BotDetails({ bot, onClose, updateParent, isMobile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayedBot, setDisplayedBot] = useState(bot);
  const [isDeleted, setIsDeleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    setErrorMessage(null);
  }, [isEditing]);

  const handleUpdateBot = async (updatedBot) => {
    setErrorMessage(null);
    try {
      const response = await apiService.updateBot(bot, updatedBot);
      if (!response) {
        throw new Error("Update response is null");
      }
      setIsEditing(false);
      setDisplayedBot(updatedBot);
      updateParent(updatedBot);
    } catch (error) {
      console.error("Error updating bot:", error);
      setErrorMessage("There was an error updating the bot. Please try again later.");
    }
  };

  const handleDeleteBot = async () => {
    setErrorMessage(null);
    const userConfirmed = window.confirm("Are you sure you want to delete this bot?");
    if (!userConfirmed) return; // If the user cancels, exit early

    try {
      const response = await apiService.deleteBot(bot.id);
      if (!response) {
        throw new Error("Delete response is null");
      }
      setIsDeleted(true);
      updateParent(null);
    } catch (error) {
      console.error("Error deleting bot:", error);
      setErrorMessage("There was an error deleting the bot. Please try again later.");
    }
  };

  const fontStyle = isMobile ? styles.mobileSubText : {};

  return (
    <div style={styles.detailsContainer}>
      {/* Back Arrow */}
      <div style={{ ...styles.backArrow, ...(isMobile ? { fontSize: '1.75rem'} : {}) }} onClick={onClose}>
        ← <span style={{ ...styles.backText, ...(isMobile ? { fontSize: '1.75rem'} : {}) }}>Back</span>
      </div>

      {isDeleted ? (
        <div>
          <h3 style={fontStyle}>Bot Deleted Successfully</h3>
          <button style={{ ...styles.actionButton, ...styles.cancelButton }} onClick={onClose}>Close</button>
        </div>
      ) : isEditing ? (
        <BotForm
          bot={displayedBot}
          onSubmit={handleUpdateBot}
          onCancel={() => setIsEditing(false)}
          isEditing={true}
          isMobile={isMobile}
        />
      ) : (
        <div style={fontStyle}>
          <div style={{ display: 'flex', height: '2rem', alignItems: 'center', ...(isMobile ? { display: 'block', height: null } : {}) }}>
            <h2 style={{ marginRight: '1rem' }}>{displayedBot.name}</h2>
            <button style={{ ...styles.actionButton, ...styles.chatButton, padding: '10px 20px', ...(isMobile ? styles.mobileButton : {}) }} onClick={() => setIsEditing(true)}>Edit</button>
            <button style={{ ...styles.actionButton, ...styles.cancelButton, ...(isMobile ? styles.mobileButton : {}) }} onClick={handleDeleteBot}>Delete</button>
          </div>
          <br/>
          <p><strong>Description:</strong> {displayedBot.description}</p>
          <p><strong>Response Style:</strong> {displayedBot.responseStyle || "N/A"}</p>
          <p><strong>Greeting Text:</strong> {displayedBot.greetingText || "N/A"}</p>
          <p><strong>Context:</strong> {displayedBot.context}</p>
          <p>
            <strong>Only Answer with Context:</strong>{" "}
            {displayedBot.onlyAnswerWithContext ? "Yes" : "No"}
          </p>
        </div>
      )}
      {errorMessage && <p style={{ ...styles.errorMsg, ...fontStyle}}>{errorMessage}</p>}
    </div>
  );
}

export default BotDetails;
