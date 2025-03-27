import React, { useState, useEffect, useRef } from "react";
import apiService from "../apiService";

const AutocompleteInput = ({ onAddressSelected, clearInput, isMobile }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [shouldFetch, setShouldFetch] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Clear input when clearInput prop changes
  useEffect(() => {
    if (clearInput) {
      setQuery("");
      setSuggestions([]);
      setShouldFetch(false);
      setSelectedIndex(-1);
    }
  }, [clearInput]);

  // Fetch suggestions with debounce (avoiding too many API calls)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (shouldFetch && query.length > 2) {
        try {
          const data = await apiService.autocompleteAddress(query);
          setSuggestions(data.results || []);
        } catch (error) {
          console.error("Error fetching autocomplete:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimeout = setTimeout(fetchSuggestions, 200); // Debounce delay
    return () => clearTimeout(debounceTimeout);
  }, [query, shouldFetch]);

  // Handle selecting an address
  const handleSelect = (address) => {
    setQuery(address.address.freeformAddress);
    setSuggestions([]);
    setShouldFetch(false); // Prevent re-fetching after selection
    setSelectedIndex(-1);
    onAddressSelected(address);
  };

  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShouldFetch(true); // Enable fetching again when typing resumes
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : -1
      );
    } else if (e.key === "Enter" && selectedIndex !== -1) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Enter address..."
        value={query}
        ref={inputRef}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        style={{ width: '75%', height: '1.5rem', maxWidth: '50rem' }} // Adjust width to accommodate longer addresses
      />
      {suggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          style={{
            position: "absolute",
            background: "white",
            border: "1px solid #ccc",
            listStyle: "none",
            padding: "0",
            margin: "0",
            width: "100%",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          {suggestions.map((item, index) => (
            <li
              key={index}
              style={{
                padding: "8px",
                cursor: "pointer",
                background: index === selectedIndex ? "#ddd" : "white",
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => handleSelect(item)}
            >
              {item.address.freeformAddress}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;