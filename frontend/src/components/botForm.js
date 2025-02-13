import React, { useState } from "react";
import styles from '../styles';
import LoadingSpinner from './loadingSpinner'; // Import LoadingSpinner

function BotForm({ bot, onSubmit, onCancel, isEditing, isMobile }) {
  const [botName, setBotName] = useState(bot?.name || "");
  const [description, setDescription] = useState(bot?.description || "");
  const [responseStyle, setResponseStyle] = useState(bot?.responseStyle || "");
  const [context, setContext] = useState(bot?.context || "");
  const [greetingText, setGreetingText] = useState(bot?.greetingText || "");
  const [onlyAnswerWithContext, setOnlyAnswerWithContext] = useState(
    bot?.onlyAnswerWithContext || false
  );
  const [loading, setLoading] = useState(false); // Add loading state
  const [successMessage, setSuccessMessage] = useState(""); // Success message state

  // Handle input changes
  const handleBotNameChange = (e) => setBotName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleResponseStyleChange = (e) => setResponseStyle(e.target.value);
  const handleContextChange = (e) => setContext(e.target.value);
  const handleGreetingTextChange = (e) => setGreetingText(e.target.value);
  const handleOnlyAnswerWithContextChange = (e) =>
    setOnlyAnswerWithContext(e.target.checked);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true before calling onSubmit
    setSuccessMessage(""); // Reset success message before submitting

    try {
      await onSubmit({
        name: botName,
        description,
        responseStyle,
        context,
        greetingText,
        onlyAnswerWithContext,
      });
      setSuccessMessage("Bot successfully updated/created!"); // Display success message after successful API call
    } catch (error) {
      setSuccessMessage("There was an error while submitting the form."); // Error handling
    } finally {
      setLoading(false); // Set loading to false after the API call is finished
    }
  };

  const mobileFontSizeAdjustment = isMobile ? styles.mobileSubText : {};

  return (
    <form onSubmit={handleSubmit}>
      {/* Bot Name */}
      {isEditing ? <h2 style={styles.formTitle}>Edit Bot</h2> : <br />}
      <div style={{ ...styles.formField, ...styles.formFieldSmall }}>
        <label style={{ ...styles.formLabel, ...mobileFontSizeAdjustment }}>Bot Name:</label>
        <input
          type="text"
          value={botName}
          onChange={handleBotNameChange}
          required
          style={styles.formInput}
        />
      </div>

      {/* Bot Description */}
      <div style={styles.formField}>
        <label style={{ ...styles.formLabel, ...mobileFontSizeAdjustment }}>Bot Description:</label>
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          required
          style={styles.formTextarea}
        />
      </div>

      {/* Response Style */}
      <div style={{ ...styles.formField, ...styles.formFieldSmall }}>
        <label style={{ ...styles.formLabel, ...mobileFontSizeAdjustment }}>Response Style:</label>
        <input
          type="text"
          value={responseStyle}
          onChange={handleResponseStyleChange}
          placeholder="humorous, formal, etc."
          style={styles.formInput}
        />
      </div>

      {/* Greeting Text */}
      <div style={styles.formField}>
        <label style={{ ...styles.formLabel, ...mobileFontSizeAdjustment }}>Greeting Text:</label>
        <input
          type="text"
          value={greetingText}
          onChange={handleGreetingTextChange}
          placeholder="Welcome! How can I help you today?"
          style={styles.formInput}
        />
      </div>

      {/* Context */}
      <div style={styles.formField}>
        <label style={{ ...styles.formLabel, ...mobileFontSizeAdjustment }}>Bot Context:</label>
        <textarea
          value={context}
          onChange={handleContextChange}
          required
          style={styles.formTextarea}
        />
      </div>

      {/* Only Answer with Context */}
      <div style={{ ...styles.formField, ...(isMobile ? styles.mobileSubText : {}) }}>
        <label>
          <input
            type="checkbox"
            checked={onlyAnswerWithContext}
            onChange={handleOnlyAnswerWithContextChange}
            style={styles.formCheckbox}
          />
          Only answer questions with the provided context
        </label>
      </div>

      {/* Submit Button */}
      <div style={styles.formField}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              ...styles.actionButton,
              ...styles.cancelButton,
              ...(isMobile ? styles.mobileButton : {}),
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          style={{
            ...styles.actionButton,
            ...styles.formButton,
            ...(isMobile ? { ...styles.mobileButton, width: '8rem', padding: 0 } : {}),
          }}
          disabled={loading} // Disable button while loading
        >
          {isEditing ? "Update Bot" : "Create Bot"}
        </button>
      </div>

      {/* Show Loading Spinner */}
      {loading && <LoadingSpinner />} 

      {/* Show Success/Error Message */}
      {successMessage && <p>{successMessage}</p>}
    </form>
  );
}

export default BotForm;
