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
    console.log(response);
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

const autocompleteAddress = async (query) => {
  try {
    const response = await fetch(`${apiHostName}/autocomplete_address`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching autocomplete:", error.message);
    throw error;
  }
};

const getRouteInfo = async (startLat, startLng, endLat, endLng) => {
  try {
    const response = await fetch(`${apiHostName}/get_route_info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_lat: startLat, start_lng: startLng, end_lat: endLat, end_lng: endLng }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching route information:", error.message);
    throw error;
  }
};

const createRoute = async (start, destination, userId) => {
  try {
    console.log(start);
    const response = await fetch(`${apiHostName}/create_route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startLocationAddress: start.address?.freeformAddress,
        startLatitude: start.position?.lat,
        startLongitude: start.position?.lon,
        endLocationAddress: destination.address?.freeformAddress,
        endLatitude: destination.position?.lat,
        endLongitude: destination.position?.lon,
        userId
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error creating route:", error.message);
    throw error;
  }
};

const deleteRoute = async (routeId, userId) => {
  try {
    const response = await fetch(`${apiHostName}/delete_route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId, userId }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error deleting route:", error.message);
    throw error;
  }
};

const apiService = {
  getTrackedRoutes,
  isDatabaseActive,
  autocompleteAddress,
  createRoute,
  getRouteInfo,
  deleteRoute,
};

export default apiService;