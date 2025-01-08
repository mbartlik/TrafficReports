const apiHostName = process.env.REACT_APP_API_HOST;

const createBot = async (bot, userId) => {
  // Prepare the data to send
  const data = {
    bot,
    userId
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

const getBots = async (filter, includeContext=false) => {
  const response = await fetch(`${apiHostName}/get_bots`, {
    method: 'POST', // Use POST instead of GET
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filter, includeContext }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bots`);
  }

  return await response.json();
};


const chat = async (botDetails, messages, token) => {
  const response = await fetch(`${apiHostName}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, botDetails }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch chat for bot with ID: ${botDetails.botId}`);
  }

  return await response.json();
};

const updateBot = async (oldBot, newBot) => {
  console.log(newBot);
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

// const getBotContext = async (bot) => {
//   try {
//     const response = await fetch(`${apiHostName}/get_bot_context`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ bot }),
//     });

//     console.log(response);

//     if (!response.ok) {
//       throw new Error(`Failed to fetch bot context. Status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching bot context:', error);
//     throw error; // Re-throw to handle it elsewhere if needed
//   }
// };
  
const apiService = {
  createBot,
  updateBot,
  getBots,
  chat,
  deleteBot,
};
export default apiService;