import React, { useState, useEffect } from 'react';
import CardCreationForm from './CardCreationForm';
import StudySession from './StudySession';
import './DeckManagement.css';

const DeckManagement = () => {
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showStudySession, setShowStudySession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/cards/decks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setDecks(data.data.decks);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCards = async (deckId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/cards/decks/${deckId}/cards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCards(data.data.cards);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const handleDeckSelect = (deck) => {
    setSelectedDeck(deck);
    setDifficultyFilter('all'); // Reset filter when selecting a new deck
    fetchCards(deck._id);
  };

  const handleCardCreated = (newCard) => {
    setCards(prev => [newCard, ...prev]);
    setShowCreateCard(false);
    // Update deck card count
    setDecks(prev => prev.map(deck => 
      deck._id === selectedDeck._id 
        ? { ...deck, cardCount: deck.cardCount + 1 }
        : deck
    ));
  };

  const handleCardUpdated = (updatedCard) => {
    setCards(prev => prev.map(card => 
      card._id === updatedCard._id ? updatedCard : card
    ));
    setEditingCard(null);
  };

  const handleCardClick = (card) => {
    setEditingCard(card);
  };

  const handleCreateDeck = async (deckData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/cards/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deckData),
      });

      const data = await response.json();
      if (data.success) {
        setDecks(prev => [data.data.deck, ...prev]);
        setShowCreateDeck(false);
      } else {
        alert(data.message || 'Failed to create deck');
      }
    } catch (error) {
      console.error('Error creating deck:', error);
      alert('Failed to create deck. Please try again.');
    }
  };

  const handleStartStudy = () => {
    if (cards.length === 0) {
      alert('No cards in this deck. Add some cards first!');
      return;
    }
    setShowStudySession(true);
  };

  const handleEndStudySession = () => {
    setShowStudySession(false);
    // Refresh cards to get updated stats
    if (selectedDeck) {
      fetchCards(selectedDeck._id);
    }
  };

  const handleDeleteDeck = async () => {
    if (!selectedDeck) return;

    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedDeck.name}"? This will also delete all cards in this deck. This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/cards/decks/${selectedDeck._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // Remove deck from list
        setDecks(prev => prev.filter(deck => deck._id !== selectedDeck._id));
        // Clear selection
        setSelectedDeck(null);
        setCards([]);
      } else {
        alert(data.message || 'Failed to delete deck');
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
      alert('Failed to delete deck. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="deck-management">
        <div className="loading">Loading your decks...</div>
      </div>
    );
  }

  if (showStudySession && selectedDeck) {
    return (
      <StudySession 
        deck={selectedDeck}
        onEndSession={handleEndStudySession}
      />
    );
  }

  return (
    <div className="deck-management">
      <div className="deck-management-header">
        <h2>My Decks</h2>
        <button 
          className="create-deck-button"
          onClick={() => setShowCreateDeck(true)}
        >
          + New Deck
        </button>
      </div>

      <div className="deck-management-content">
        <div className="decks-sidebar">
          {decks.length === 0 ? (
            <div className="empty-state">
              <p>No decks yet. Create your first deck to get started!</p>
            </div>
          ) : (
            <div className="decks-list">
              {decks.map(deck => (
                <div 
                  key={deck._id}
                  className={`deck-item ${selectedDeck?._id === deck._id ? 'active' : ''}`}
                  onClick={() => handleDeckSelect(deck)}
                >
                  <div className="deck-name">{deck.name}</div>
                  <div className="deck-meta">
                    <span className="card-count">{deck.cardCount} cards</span>
                    <span className="deck-date">
                      {new Date(deck.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="deck-content">
          {selectedDeck ? (
            <div className="deck-details">
              <div className="deck-header">
                <h3>{selectedDeck.name}</h3>
                <div className="deck-actions">
                  <button 
                    className="study-button"
                    onClick={handleStartStudy}
                    disabled={cards.length === 0}
                  >
                    🎯 Study Deck
                  </button>
                  <button 
                    className="add-card-button"
                    onClick={() => setShowCreateCard(true)}
                  >
                    + Add Card
                  </button>
                  <button 
                    className="delete-deck-button"
                    onClick={handleDeleteDeck}
                  >
                    🗑️ Delete Deck
                  </button>
                </div>
              </div>
              
              {selectedDeck.description && (
                <p className="deck-description">{selectedDeck.description}</p>
              )}

              <div className="cards-section">
                <div className="cards-section-header">
                  <h4>
                    Cards 
                    {difficultyFilter === 'all' 
                      ? ` (${cards.length})` 
                      : ` (${cards.filter(card => card.difficulty === difficultyFilter).length} of ${cards.length})`}
                  </h4>
                  <div className="difficulty-filter">
                    <label htmlFor="difficulty-filter">Filter by difficulty:</label>
                    <select
                      id="difficulty-filter"
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="difficulty-filter-select"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                {(() => {
                  const filteredCards = difficultyFilter === 'all' 
                    ? cards 
                    : cards.filter(card => card.difficulty === difficultyFilter);
                  
                  return filteredCards.length === 0 ? (
                    <div className="empty-cards">
                      <p>
                        {cards.length === 0 
                          ? 'No cards in this deck yet. Add your first card!'
                          : `No ${difficultyFilter} cards found. Try selecting a different difficulty.`}
                      </p>
                    </div>
                  ) : (
                    <div className="cards-list">
                      {filteredCards.map(card => (
                        <div 
                          key={card._id} 
                          className="card-item clickable-card"
                          onClick={() => handleCardClick(card)}
                        >
                          <div className="card-front">
                            <strong>Front:</strong> {card.front}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="no-deck-selected">
              <p>Select a deck to view and manage cards</p>
            </div>
          )}
        </div>
      </div>

      {showCreateCard && selectedDeck && (
        <CardCreationForm
          deckId={selectedDeck._id}
          onCardCreated={handleCardCreated}
          onCancel={() => setShowCreateCard(false)}
        />
      )}

      {editingCard && selectedDeck && (
        <CardCreationForm
          deckId={selectedDeck._id}
          card={editingCard}
          onCardUpdated={handleCardUpdated}
          onCancel={() => setEditingCard(null)}
        />
      )}

      {showCreateDeck && (
        <CreateDeckForm
          onCreateDeck={handleCreateDeck}
          onCancel={() => setShowCreateDeck(false)}
        />
      )}
    </div>
  );
};

// Simple deck creation form component
const CreateDeckForm = ({ onCreateDeck, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onCreateDeck(formData);
    }
  };

  return (
    <div className="create-deck-modal">
      <div className="create-deck-form">
        <div className="form-header">
          <h3>Create New Deck</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Deck Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter deck name..."
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter deck description..."
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit">Create Deck</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeckManagement;