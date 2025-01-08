import React, { useState } from "react";

function BotForm({ bot, onSubmit, onCancel, isEditing }) {
  const [botName, setBotName] = useState(bot?.name || "");
  const [description, setDescription] = useState(bot?.description || "");
  const [responseStyle, setResponseStyle] = useState(bot?.responseStyle || "");
  const [context, setContext] = useState(bot?.context || "");
  const [greetingText, setGreetingText] = useState(bot?.greetingText || "");
  const [onlyAnswerWithContext, setOnlyAnswerWithContext] = useState(
    bot?.onlyAnswerWithContext || false
  );

  // Handle input changes
  const handleBotNameChange = (e) => setBotName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleResponseStyleChange = (e) => setResponseStyle(e.target.value);
  const handleContextChange = (e) => setContext(e.target.value);
  const handleGreetingTextChange = (e) => setGreetingText(e.target.value);
  const handleOnlyAnswerWithContextChange = (e) =>
    setOnlyAnswerWithContext(e.target.checked);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: botName,
      description,
      responseStyle,
      context,
      greetingText,
      onlyAnswerWithContext,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Bot Name */}
      <h2>{isEditing ? "Edit Bot" : "Create a New Bot"}</h2>
      <div>
        <label>Bot Name:</label>
        <input type="text" value={botName} onChange={handleBotNameChange} required />
      </div>

      {/* Bot Description */}
      <div>
        <label>Bot Description:</label>
        <textarea value={description} onChange={handleDescriptionChange} required />
      </div>

      {/* Response Style */}
      <div>
        <label>Response Style:</label>
        <input
          type="text"
          value={responseStyle}
          onChange={handleResponseStyleChange}
          placeholder="humorous, formal, etc."
        />
      </div>

      {/* Greeting Text */}
      <div>
        <label>Greeting Text:</label>
        <input
          type="text"
          value={greetingText}
          onChange={handleGreetingTextChange}
          placeholder="Welcome! How can I help you today?"
        />
      </div>

      {/* Context */}
      <div>
        <label>Bot Context:</label>
        <textarea value={context} onChange={handleContextChange} required />
      </div>

      {/* Only Answer with Context */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={onlyAnswerWithContext}
            onChange={handleOnlyAnswerWithContextChange}
          />
          Only answer questions with the provided context
        </label>
      </div>

      {/* Submit Button */}
      <div>
        <button type="submit">{isEditing ? "Update Bot" : "Create Bot"}</button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default BotForm;