import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import apiService from '../apiService';
import styles from '../styles';
import LoadingSpinner from './loadingSpinner';
import LinkCopyButton from './linkCopyButton';

function Bot() {
  const { isAuthenticated, user } = useAuth0();
  const { id } = useParams();
  const [botDetails, setBotDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [botError, setBotError] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const getBotDetails = async () => {
      try {
        const botDetails = await apiService.getBots({ id }, true);
        if (!botDetails || botDetails.length === 0) {
          setBotError(true);
          return;
        }
        setBotDetails(botDetails[0]);
  
        setMessages((prevMessages) => {
          if (prevMessages.length === 0) {
            const newMessages = [];
  
            if (isMobile) {
              newMessages.push(
                { sender: 'system', text: `Starting chat with - ${botDetails[0].name}` },
                { sender: 'system', text: `Description - ${botDetails[0].description}` }
              );
            }
  
            if (botDetails[0]?.greetingText) {
              newMessages.push({ sender: 'bot', text: botDetails[0].greetingText });
            }
  
            return newMessages;
          }
          return prevMessages;
        });
  
      } catch (error) {
        console.error(`Error fetching bot details for bot (${id}):`, error);
        setBotError(true);
      }
    };
  
    getBotDetails();
  }, [id, isMobile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { sender: 'user', text: input };
      const tempAllMessages = [...messages, userMessage];
      setMessages(tempAllMessages);
      setInput('');
      setLoading(true);

      try {
        const botResponse = await apiService.chat(botDetails, tempAllMessages, user.sub);
        const message = botResponse?.message || "Sorry, there was an error sending that chat. Please try again later.";
        setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: message }]);
      } catch (error) {
        console.error("Error sending chat message:", error);
        setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: "Sorry, there was an error sending that chat. Please try again later." }]);
      } finally {
        setLoading(false);
        inputRef.current?.focus(); // Ensure the input stays focused
      }
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div style={isMobile ? styles.chatContainerMobile : styles.chatContainer}>
        {isAuthenticated ? (
          botError ? (
            <h3>There was an error retrieving information on this bot ({id}). Please try again later.</h3>
          ) : botDetails ? (
            <>
              {!isMobile && 
                <>
                  <div style={{ display: 'flex' }}>
                    <h2 style={{ ...styles.botTitle, ...(isMobile ? styles.mobileSubHeader : {}), marginRight: '1rem' }}>Chat with {botDetails.name}</h2>
                    <LinkCopyButton botId={botDetails.id} />
                  </div>
                  <p style={{ ...styles.botDescription, ...(isMobile ? { ...styles.mobileSubText, paddingTop: 0 } : {}) }}>{botDetails.description}</p>
                  <hr />
                </>
              }

              <div style={isMobile ? styles.messagesContainerMobile : styles.messagesContainer}>
                {messages.map((message, index) => (
                  <div key={index} style={{ ...(message.sender === 'user' ? styles.userMessage : message.sender === 'bot' ? styles.botMessage : styles.systemMessage), ...(isMobile ? styles.mobileSubText : {}) }}>
                    <strong>{message.sender === 'user' ? 'You' : message.sender === 'bot' ? 'Bot' : 'System'}:</strong> {message.text}
                  </div>
                ))}
                {loading && <div style={styles.botMessage}><strong>Bot:</strong> Typing...</div>}
                <div ref={messagesEndRef} />
              </div>

            </>
          ) : (
            <LoadingSpinner />
          )
        ) : (
          <h3>Please login to access this chat.</h3>
        )}
      </div>
      <form style={{ ...styles.inputContainer, ...(!isMobile ? { maxWidth: '600px', margin: 'auto' } : {}) }} onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
        <input
          type="text"
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={loading}
          style={{ ...styles.chatInput, ...(isMobile ? styles.mobileSubText : {}) }}
        />
        <button type="submit" disabled={loading || !isAuthenticated} style={{ ...styles.sendButton, ...(isMobile ? styles.mobileButton : {}) }}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </>
  );
}

export default Bot;
