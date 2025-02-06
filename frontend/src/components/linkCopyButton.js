import React, { useState } from "react";
import { FiCopy } from "react-icons/fi"; // Import copy icon from react-icons
import styles from '../styles'; // Assuming your styles file

const LinkCopyButton = ({ botId }) => {
  const [showBanner, setShowBanner] = useState(false); // State to control banner visibility

  const handleCopyClick = () => {
    const url = `${process.env.REACT_APP_HOST}/bot/${botId}`; // Construct the URL
    navigator.clipboard
      .writeText(url) // Copy the URL to clipboard
      .then(() => {
        setShowBanner(true); // Show the banner after copying
        setTimeout(() => {
          setShowBanner(false); // Hide the banner after 1 second
        }, 1000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err); // Handle failure silently
      });
  };

  return (
    <>
      {/* Banner */}
      {showBanner && (
        <div style={styles.copyBanner}>
          Link copied to clipboard
        </div>
      )}

      {/* Copy Button */}
      <button
        onClick={handleCopyClick}
        style={styles.linkCopyButton}
        title="Copy link"
      >
        <FiCopy size={16} />
      </button>
    </>
  );
};

export default LinkCopyButton;
