import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles';
import LinkCopyButton from './linkCopyButton';

const BotListItem = ({ bot, linkPath, showButtons = false, onDetailsClick, isMobile }) => {
  const chatButton = 
    <Link to={linkPath || `/bot/${bot.id}`} style={{ ...styles.actionButton, ...styles.chatButton, ...(isMobile ? { ...styles.mobileButton, marginLeft: 'auto', padding: 0 } : {}) }}>
      Chat
    </Link>;
  return (
    <li style={{ marginBottom: '1rem', ...(isMobile ? styles.mobileList : {})}} className="bot-list-item">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h3 style={{marginRight: '1rem', ...(isMobile ? styles.mobileSubHeader : {})}}>{bot.name}</h3>
        { showButtons && <LinkCopyButton botId={bot.id}/> }
        {!showButtons && chatButton}
      </div>
      <p style={{ ...styles.botDescription, ...(isMobile ? styles.mobileSubText : {}) }}>{bot.description}</p>
      {showButtons && onDetailsClick && (
        <>
          {chatButton}
          <button
            onClick={() => onDetailsClick(bot)} 
            style={{ ...styles.actionButton, ...styles.chatButton, ...(isMobile ? { ...styles.mobileButton } : {})}} 
            >
              Details
          </button>
          </>
        )}
    </li>
  );
};

export default BotListItem;