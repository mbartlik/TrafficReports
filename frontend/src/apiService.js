const apiHostName = process.env.REACT_APP_API_HOST;

const createBot = async (botName, description, links, userId) => {
  // Prepare the data to send
  const data = {
    name: botName,
    userId,
    description,
    links,
  };

  try {
    // Send the POST request to the /create_bot endpoint
    const response = await fetch(`${apiHostName}/create_bot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Bot created successfully:', responseData.message);
      return responseData;
    } else {
      throw new Error('Error creating bot');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const getBots = async (filter) => {
  const response = await fetch(`${apiHostName}/get_bots`, {
    method: 'POST', // Use POST instead of GET
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filter }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bots`);
  }

  return await response.json();
};


const chat = async (id, messages, token) => {
  const response = await fetch(`${apiHostName}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, messages }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch chat for bot with ID: ${id}`);
  }

  return await response.json();
};

const updateBot = async (oldBot, newBot) => {
  const data = {
    oldBot,
    newBot,
  };

  try {
    const response = await fetch(`${apiHostName}/update_bot`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Bot updated successfully:', responseData.message);
      return responseData;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error updating bot');
    }
  } catch (error) {
    console.error('Error updating bot:', error);
    return null;
  }
};

const deleteBot = async (botId) => {
  try {
    const response = await fetch(`${apiHostName}/delete_bot/${botId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error deleting bot');
    }

    const responseData = await response.json();
    console.log('Bot deleted successfully:', responseData.message);
    return responseData;
  } catch (error) {
    console.error('Error deleting bot:', error);
    throw error; // Re-throw to allow the caller to handle it
  }
};
  
const apiService = {
  createBot,
  updateBot,
  getBots,
  chat,
  deleteBot
};
export default apiService;