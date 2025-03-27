import React, { useState } from "react";
import apiService from "../apiService";
import AutocompleteInput from "./autocompleteInput";
import LoadingSpinner from "./loadingSpinner";
import styles from "../styles";

const NewRoute = (props) => {
  const { userId, isAuthenticated, isMobile } = props;
  const [routeName, setRouteName] = useState("");
  const [start, setStart] = useState(null);
  const [destination, setDestination] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clearInput, setClearInput] = useState(false);

  const handleCreateRoute = async () => {
    setError("");
    setSuccess(false);

    if (!userId || !isAuthenticated) {
      setError("You need to be logged in to create a route.");
      return;
    }

    if (!routeName || !start || !destination) {
      setError("Please enter a route name, start, and destination.");
      return;
    }

    setLoading(true);

    try {
      await apiService.createRoute(start, destination, userId, routeName);
      setRouteName("");
      setStart(null);
      setDestination(null);
      setSuccess(true);
      setClearInput(true); // Clear the input fields
      setTimeout(() => setClearInput(false), 100); // Reset clearInput after a short delay
    } catch (err) {
      console.error("Error creating route:", err);
      if (err.message?.includes("You have already")) {
        setError(err.message);
      } else {
        setError("Failed to create route. Please try again.");
      }
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
    <div onKeyDown={handleKeyPress} tabIndex={0} style={{ textAlign: "left" }}>
      <h2>Create a New Route</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green", fontWeight: "bold" }}>Route successfully created! Go to the home page to view your route</p>}

      <input
        type="text"
        placeholder="Route Name"
        value={routeName}
        onChange={(e) => setRouteName(e.target.value)}
        style={{ padding: "10px", fontSize: "16px", width: "80%", marginBottom: "20px", maxWidth: '30rem', ...(isMobile ? { width: '100%' } : {}) }}
      />
      <br />

      <AutocompleteInput
        apiKey={process.env.REACT_APP_AZURE_MAPS_API_KEY}
        onAddressSelected={(address) => setStart(address)}
        clearInput={clearInput}
        isMobile={isMobile}
      />
      <br />
      <AutocompleteInput
        apiKey={process.env.REACT_APP_AZURE_MAPS_API_KEY}
        onAddressSelected={(address) => setDestination(address)}
        clearInput={clearInput}
        isMobile={isMobile}
      />
      <br />

      <button onClick={handleCreateRoute} disabled={loading} style={styles.standardButton}>
        {loading ? "Creating..." : "Create Route"}
      </button>

      {/* Overlay for loading spinner */}
      {loading && <LoadingSpinner />}
    </div>
  );
};

export default NewRoute;