const apiHostName = process.env.REACT_APP_API_HOST;

const listBots = async () => {
  try {
    const response = await fetch(`${apiHostName}/listBots`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const bots = await response.json();

    return bots;
  } catch (error) {
    console.error('Error fetching bots:', error);
    return null;
  }
}

const getBotDetails = async (id) => {
  const response = await fetch(`${apiHostName}/botDetails?id=${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bot details for ID: ${id}`);
  }
  return await response.json();
}

const chat = async (id, text) => {
  const response = await fetch(`${apiHostName}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, text }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch chat for bot with ID: ${id}`);
  }

  return await response.json();
};
  
const apiService = {
  listBots,
  getBotDetails,
  chat
};
export default apiService;