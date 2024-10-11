const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// set CORS
const corsOptions = {
  origin: process.env.CLIENT_URL,
};
app.use(cors(corsOptions));

// Example list of bots
const bots = [
  {
    id: 1,
    title: 'Weather Bot',
    summary: 'Provides weather updates and forecasts.',
  },
  {
    id: 2,
    title: 'Finance Bot',
    summary: 'Gives stock prices and financial news.',
  },
  {
    id: 3,
    title: 'Chatbot',
    summary: 'A simple conversational chatbot.',
  }
];

app.get('/listBots', (req, res) => {
  res.json(bots);
});

app.get('/botDetails', (req, res) => {
  const { id } = req.query;
  const bot = bots[0];

  if (bot) {
    res.json(bot);
  } else {
    res.status(404).json({ message: 'Bot not found' });
  }
});

app.get('/chat', (req, res) => {
  const { id } = req.query;

  const message = "test response from the bot with id - " + id
  if (message) {
    res.json({ message });
  } else {
    res.status(404).json({ message: 'There was an error getting a response from the bot. Please try again later.' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});