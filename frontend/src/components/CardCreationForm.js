import React, { useState, useEffect } from 'react';
import './CardCreationForm.css';

const CardCreationForm = ({ deckId, onCardCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    difficulty: 'medium',
    tags: []
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && formData.tags.length < 5) {
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.front.trim()) {
      newErrors.front = 'Card front content is required';
    } else if (formData.front.length > 500) {
      newErrors.front = 'Card front cannot exceed 500 characters';
    }

    if (!formData.back.trim()) {
      newErrors.back = 'Card back content is required';
    } else if (formData.back.length > 500) {
      newErrors.back = 'Card back cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          deckId
        }),
      });

      const data = await response.json();

      if (data.success) {
        onCardCreated(data.data.card);
        // Reset form
        setFormData({
          front: '',
          back: '',
          difficulty: 'medium',
          tags: []
        });
        setTagInput('');
      } else {
        alert(data.message || 'Failed to create card');
      }
    } catch (error) {
      console.error('Create card error:', error);
      alert('Failed to create card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-creation-modal">
      <div className="card-creation-form">
        <div className="form-header">
          <h3>Create New Card</h3>
          <button 
            type="button" 
            className="close-button"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card-form">
          <div className="form-group">
            <label htmlFor="front">Front of Card *</label>
            <textarea
              id="front"
              name="front"
              value={formData.front}
              onChange={handleChange}
              placeholder="Enter the question, term, or prompt..."
              className={errors.front ? 'error' : ''}
              rows={4}
              maxLength={500}
              required
            />
            <div className="character-count">
              {formData.front.length}/500
            </div>
            {errors.front && <span className="error-message">{errors.front}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="back">Back of Card *</label>
            <textarea
              id="back"
              name="back"
              value={formData.back}
              onChange={handleChange}
              placeholder="Enter the answer, definition, or explanation..."
              className={errors.back ? 'error' : ''}
              rows={4}
              maxLength={500}
              required
            />
            <div className="character-count">
              {formData.back.length}/500
            </div>
            {errors.back && <span className="error-message">{errors.back}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  maxLength={20}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                />
                <button 
                  type="button" 
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 5}
                >
                  Add
                </button>
              </div>
              <div className="tags-display">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="create-button"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardCreationForm;
