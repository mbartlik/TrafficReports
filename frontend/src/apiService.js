const apiHostName = process.env.REACT_APP_API_HOST;

const handleResponse = async (response) => {
  if (!response.ok) {
    const responseJson = await response.json();
    const errorText = responseJson?.error || 'An error occurred while making the request.';
    throw new Error(errorText);
  }
  return response.json();
};

const timeoutPromise = (timeout) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout));

const isDatabaseActive = async () => {
  const timeout = 2000;
  try {
    const response = await Promise.race([
      fetch(`${apiHostName}/is-db-active`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
      timeoutPromise(timeout),
    ]);
    const result = await handleResponse(response);
    return result.isActive;
  } catch (error) {
    console.log('Database not active');
    throw error; // Re-throw error to ensure it's propagated
  }
};

const createBot = async (bot, userId) => {
  try {
    const response = await fetch(`${apiHostName}/create_bot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot, userId }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating bot:', error.message);
    throw error; // Re-throw error to allow proper handling upstream
  }
};

const getBots = async (filter, includeContext = false) => {
  try {
    const response = await fetch(`${apiHostName}/get_bots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter, includeContext }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching bots:', error.message);
    throw error;
  }
};

const chat = async (botDetails, messages, user) => {
  try {
    const response = await fetch(`${apiHostName}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, botDetails, user }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error chatting with bot:', error.message);
    throw error;
  }
};

const updateBot = async (oldBot, newBot) => {
  try {
    const response = await fetch(`${apiHostName}/update_bot`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldBot, newBot }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating bot:', error.message);
    throw error;
  }
};

const deleteBot = async (botId) => {
  try {
    const response = await fetch(`${apiHostName}/delete_bot/${botId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting bot:', error.message);
    throw error;
  }
};

const apiService = {
  isDatabaseActive,
  createBot,
  updateBot,
  getBots,
  chat,
  deleteBot,
};

export default apiService;