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
  console.log(apiHostName);
  console.log(process.env);
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

const getTrackedRoutes = async (userId) => {
  try {
    const response = await fetch(`${apiHostName}/get_tracked_routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching tracked routes:', error.message);
    throw error;
  }
};

const apiService = {
  getTrackedRoutes,
  isDatabaseActive
};

export default apiService;