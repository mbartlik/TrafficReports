import React, { useState } from "react";
import apiService from "../apiService";
import AutocompleteInput from "./autocompleteInput";
import LoadingSpinner from "./loadingSpinner";

const NewRoute = (props) => {
  const { userId, isAuthenticated } = props;
  const [start, setStart] = useState(null);
  const [destination, setDestination] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCreateRoute = async () => {
    setError("");
    setSuccess(false);

    if (!userId || !isAuthenticated) {
      setError("You need to be logged in to create a route.");
      return;
    }

    if (!start || !destination) {
      setError("Please enter both start and destination.");
      return;
    }

    setLoading(true);

    try {
      await apiService.createRoute(start, destination, userId);
      setStart(null);
      setDestination(null);
      setSuccess(true);
    } catch (err) {
      console.error("Error creating route:", err);
      setError("Failed to create route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateRoute();
    }
  };

  return (
    <div onKeyDown={handleKeyPress} tabIndex={0} style={{ textAlign: "center" }}>
      <h2>Create a New Route</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green", fontWeight: "bold" }}>Route successfully created!</p>}

      <AutocompleteInput
        apiKey={process.env.REACT_APP_AZURE_MAPS_API_KEY}
        onAddressSelected={(address) => setStart(address)}
        value={start ? start.address.freeformAddress : ""}
      />
      <br />
      <AutocompleteInput
        apiKey={process.env.REACT_APP_AZURE_MAPS_API_KEY}
        onAddressSelected={(address) => setDestination(address)}
        value={destination ? destination.address.freeformAddress : ""}
      />
      <br />

      <button onClick={handleCreateRoute} disabled={loading} style={{ padding: "10px", fontSize: "16px" }}>
        {loading ? "Creating..." : "Create Route"}
      </button>

      {/* Overlay for loading spinner */}
      {loading && <LoadingSpinner />}
    </div>
  );
};

export default NewRoute;