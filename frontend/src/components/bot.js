import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import apiService from '../apiService';

function Bot() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState(null);
  const { id } = useParams();
  const [botDetails, setBotDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const getBotDetails = async () => {
      try {
        const botDetails = await apiService.getBots({botId: id});
        setBotDetails(botDetails[0]);
      } catch (error) {
        console.error(`Error fetching bot details for bot (${id}):`, error);
      }
    };

    getBotDetails();
  }, [id]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);
      } catch (error) {
        console.error("Error fetching access token", error);
      }
    };

    if (isAuthenticated) {
      getToken();
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { sender: 'user', text: input };
      const tempAllMessages = [...messages, userMessage];
      setMessages((prevMessages) => tempAllMessages); // Add user message to chat
      setInput('');

      const botResponse = await apiService.chat(id, tempAllMessages, token);
      const message = botResponse.message ? botResponse.message : "There was an error getting a response from the bot. Please try again later.";
      setMessages((prevMessages) => [...prevMessages, {
        sender: 'bot',
        text: message
      }]);
    }
  };

  // Handle input field change
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  return (
    <div>
      {isAuthenticated || true ? ( // TODO: require authentication later
        botDetails ? (
          <>
            <h2>Chat with {botDetails.botName}</h2> {/* Display the bot title */}
            <p>{botDetails.description}</p> {/* Display the bot description */}
            <hr/>
  
            {/* Display chat messages */}
            <div>
              {messages.map((message, index) => (
                <div key={index}>
                  <strong>{message.sender === 'user' ? 'You' : 'Bot'}:</strong> {message.text}
                </div>
              ))}
            </div>
  
            {/* Input field and send button */}
            <div>
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type a message..."
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <h3>Loading...</h3>
        )
      ) : (
        <h3>Please login to access this chat.</h3>
      )}
    </div>
  );
}

export default Bot;
