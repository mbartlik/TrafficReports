import React, { useState } from 'react';

function BotForm({ bot, onSubmit, onCancel, isEditing }) {
  const [botName, setBotName] = useState(bot?.botName || '');
  const [description, setDescription] = useState(bot?.description || '');
  const [links, setLinks] = useState(bot?.links || [{ url: '', description: '' }]);

  // Handle input changes
  const handleBotNameChange = (e) => setBotName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleLinkChange = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  // Add new link row
  const addLink = () => setLinks([...links, { url: '', description: '' }]);

  // Remove link row
  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ botName, description, links });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Edit Bot' : 'Create a New Bot'}</h2>

      {/* Bot Name */}
      <div>
        <label>Bot Name:</label>
        <input
          type="text"
          value={botName}
          onChange={handleBotNameChange}
          required
        />
      </div>

      {/* Bot Description */}
      <div>
        <label>Bot Description:</label>
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          required
        />
      </div>

      {/* Links Section */}
      <div>
        <h3>Bot Links</h3>
        {links.map((link, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <label>Link URL:</label>
            <input
              type="text"
              value={link.url}
              onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
              required
            />
            <br />
            <label>Link Description:</label>
            <input
              type="text"
              value={link.description}
              onChange={(e) =>
                handleLinkChange(index, 'description', e.target.value)
              }
              required
            />
            <br />
            <button type="button" onClick={() => removeLink(index)}>
              Remove Link
            </button>
          </div>
        ))}
        <button type="button" onClick={addLink}>
          Add Another Link
        </button>
      </div>

      {/* Submit Button */}
      <div>
        <button type="submit">{isEditing ? 'Update Bot' : 'Create Bot'}</button>
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