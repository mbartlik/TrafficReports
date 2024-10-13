import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../apiService';

function Bot() {
  const { id } = useParams(); // Get bot ID from URL params
  const [botDetails, setBotDetails] = useState(null);
  const [messages, setMessages] = useState([]); // To store messages
  const [input, setInput] = useState(''); // To store the current input

  useEffect(() => {
    const getBotDetails = async () => {
      try {
        const botDetails = await apiService.getBotDetails(id);
        setBotDetails(botDetails);
      } catch (error) {
        console.error(`Error fetching bot details for bot (${id}):`, error);
      }
    };

    getBotDetails();
  }, [id]); // Add id as a dependency to refetch if it changes

  // Handle sending a message
  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { sender: 'user', text: input };
      setMessages((prevMessages) => [...prevMessages, userMessage]); // Add user message to the chat
      setInput('');

      const botResponse = await apiService.chat(id, userMessage.text);
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
      {botDetails ? (
        <>
          <h2>Chat with {botDetails.title}</h2> {/* Display the bot title */}
          <p>{botDetails.summary}</p> {/* Display the bot description */}
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
      )}
    </div>
  );
}

export default Bot;
