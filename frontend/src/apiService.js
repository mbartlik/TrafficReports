const apiHostName = process.env.REACT_APP_API_HOST;

const isDatabaseActive = async () => {
  const timeout = 2000;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), timeout)
  );

  try {
    const response = await Promise.race([
      fetch(`${apiHostName}/is-db-active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      timeoutPromise,
    ]);

    if (response.ok) {
      const result = await response.json();
      return result.isActive;
    } else {
      console.error('Error checking database status:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
};


const createBot = async (bot, userId) => {
  const data = {
    bot,
    userId
  };

  try {
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
      console.error('Error creating bot:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

const getBots = async (filter, includeContext = false) => {
  try {
    const response = await fetch(`${apiHostName}/get_bots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filter, includeContext }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Error fetching bots:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

const chat = async (botDetails, messages) => {
  try {
    const response = await fetch(`${apiHostName}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages, botDetails }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error(`Error fetching chat for bot with ID ${botDetails.id}:`, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
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
      console.error('Error updating bot:', response.statusText);
      return null;
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

    if (response.ok) {
      const responseData = await response.json();
      console.log('Bot deleted successfully:', responseData.message);
      return responseData;
    } else {
      console.error('Error deleting bot:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error deleting bot:', error);
    return null;
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
