import React, { useState } from "react";
import styles from "../styles";
import LoadingSpinner from "./loadingSpinner"; // Import LoadingSpinner

function BotForm({ bot, onSubmit, onCancel, isEditing, isMobile }) {
  const [formData, setFormData] = useState({
    name: bot?.name || "",
    description: bot?.description || "",
    responseStyle: bot?.responseStyle || "",
    context: bot?.context || "",
    greetingText: bot?.greetingText || "",
    onlyAnswerWithContext: bot?.onlyAnswerWithContext || false,
  });
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

// Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const success = await onSubmit(formData);
      if (success) {
      }
    } catch (error) {
      alert("There was an error while submitting the form."); // Error handling
    } finally {
      setLoading(false);
    }
  };

  const mobileFontSizeAdjustment = isMobile ? styles.mobileSubText : {};

  // Helper to render form fields (use explicit names matching formData keys)
  const renderInputField = (label, name, value, onChange, placeholder = "", required = false, type = "text") => (
    <div style={styles.formField}>
      <label style={{ ...styles.formLabel, ...mobileFontSizeAdjustment }}>{label}:</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        style={styles.formInput}
      />
    </div>
  );

  const renderTextareaField = (label, name, value, onChange, required = false) => (
    <div style={styles.formField}>
      <label style={{ ...styles.formLabel, ...mobileFontSizeAdjustment }}>{label}:</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={styles.formTextarea}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {isEditing && <h2 style={styles.formTitle}>Edit Bot</h2>}

      {renderInputField("Bot Name", "name", formData.name, handleInputChange, "", true)}
      {renderTextareaField("Bot Description", "description", formData.description, handleInputChange, true)}
      {renderInputField("Response Style", "responseStyle", formData.responseStyle, handleInputChange, "humorous, formal, etc.")}
      {renderInputField("Greeting Text", "greetingText", formData.greetingText, handleInputChange, "Welcome! How can I help you today?")}
      {renderTextareaField("Bot Context", "context", formData.context, handleInputChange, true)}

      <div style={{ ...styles.formField, ...(isMobile ? styles.mobileSubText : {}) }}>
        <label>
          <input
            type="checkbox"
            name="onlyAnswerWithContext"
            checked={formData.onlyAnswerWithContext}
            onChange={handleInputChange}
            style={styles.formCheckbox}
          />
          Only answer questions with the provided context
        </label>
      </div>

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
          disabled={loading}
        >
          {isEditing ? "Update Bot" : "Create Bot"}
        </button>
      </div>

      {loading && <LoadingSpinner />}

    </form>
  );
}

export default BotForm;
