/**
 * Study Session Component
 * 
 * Interactive flashcard study session with spaced repetition tracking.
 * Displays cards one at a time, tracks user performance, and updates card statistics.
 * 
 * @param {Object} deck - The deck object being studied
 * @param {string|null} difficulty - Optional difficulty filter ('easy', 'medium', 'hard', or null for all)
 * @param {Function} onEndSession - Callback to exit the study session
 */

import React, { useState, useEffect, useCallback } from 'react';
import './StudySession.css';

const StudySession = ({ deck, difficulty, onEndSession }) => {
  // Card and session state
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Session statistics tracking
  const [sessionStats, setSessionStats] = useState({
    totalCards: 0,
    studiedCards: 0,
    correctAnswers: 0,
    incorrectAnswers: 0
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);

  /**
   * Fetch Cards for Study Session
   * Retrieves cards from the deck, optionally filtered by difficulty
   * Shuffles cards for randomized study order
   */
  const fetchCards = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      // Build URL with optional difficulty query parameter
      let url = `http://localhost:5001/api/cards/decks/${deck._id}/cards`;
      if (difficulty) {
        url += `?difficulty=${difficulty}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.data.cards.length > 0) {
        // Shuffle cards for randomized study session
        const shuffledCards = shuffleArray([...data.data.cards]);
        setCards(shuffledCards);
        setSessionStats(prev => ({
          ...prev,
          totalCards: shuffledCards.length
        }));
      } else {
        // No cards found - show message and exit
        const difficultyText = difficulty 
          ? `${difficulty} ` 
          : "";
        alert(`No ${difficultyText}cards found in this deck. Add some cards first!`);
        onEndSession();
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      alert('Failed to load cards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [deck, difficulty, onEndSession]);

  // Fetch cards when component mounts or deck changes
  useEffect(() => {
    if (deck) {
      fetchCards();
    }
  }, [deck, fetchCards]);

  /**
   * Shuffle Array
   * Randomly shuffles an array using Fisher-Yates algorithm
   * @param {Array} array - The array to shuffle
   * @returns {Array} A new shuffled array
   */
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleCardClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  /**
   * Handle Answer Submission
   * Records whether the user answered correctly and updates card statistics
   * Moves to the next card or ends the session if all cards are studied
   * @param {boolean} isCorrect - Whether the user answered correctly
   */
  const handleAnswer = async (isCorrect) => {
    const currentCard = cards[currentCardIndex];
    
    // Update local session statistics
    setSessionStats(prev => ({
      ...prev,
      studiedCards: prev.studiedCards + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: isCorrect ? prev.incorrectAnswers : prev.incorrectAnswers + 1
    }));

    // Update card statistics on the server for spaced repetition tracking
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5001/api/cards/${currentCard._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studyCount: currentCard.studyCount + 1,
          correctCount: isCorrect ? currentCard.correctCount + 1 : currentCard.correctCount,
          lastStudied: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Error updating card stats:', error);
      // Continue even if update fails - don't interrupt study session
    }

    // Move to next card or end session if all cards are studied
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false); // Reset flip state for next card
    } else {
      setSessionComplete(true);
    }
  };

  const handleRestartSession = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setSessionStats(prev => ({
      ...prev,
      studiedCards: 0,
      correctAnswers: 0,
      incorrectAnswers: 0
    }));
  };

  if (isLoading) {
    return (
      <div className="study-session">
        <div className="loading">Loading study session...</div>
      </div>
    );
  }

  if (sessionComplete) {
    const accuracy = sessionStats.studiedCards > 0 
      ? Math.round((sessionStats.correctAnswers / sessionStats.studiedCards) * 100)
      : 0;

    return (
      <div className="study-session">
        <div className="session-complete">
          <div className="completion-header">
            <h2>🎉 Study Session Complete!</h2>
            <p>Great job studying {deck.name}</p>
          </div>
          
          <div className="session-stats">
            <div className="stat-item">
              <div className="stat-number">{sessionStats.studiedCards}</div>
              <div className="stat-label">Cards Studied</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{sessionStats.correctAnswers}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{sessionStats.incorrectAnswers}</div>
              <div className="stat-label">Incorrect</div>
            </div>
          </div>

          <div className="session-actions">
            <button 
              className="restart-button"
              onClick={handleRestartSession}
            >
              Study Again
            </button>
            <button 
              className="end-button"
              onClick={onEndSession}
            >
              End Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return (
    <div className="study-session">
      <div className="study-header">
        <div className="study-info">
          <h2>{deck.name}</h2>
          <p>Card {currentCardIndex + 1} of {cards.length}</p>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <button 
          className="end-session-button"
          onClick={onEndSession}
        >
          End Session
        </button>
      </div>

      <div className="card-container">
        <div 
          className={`flashcard ${isFlipped ? 'flipped' : ''}`}
          onClick={handleCardClick}
        >
          <div className="card-inner">
            <div className="card-front">
              <div className="card-content">
                <h3>Front</h3>
                <p>{currentCard.front}</p>
                {!isFlipped && (
                  <div className="flip-hint">
                    Click to reveal answer
                  </div>
                )}
              </div>
            </div>
            <div className="card-back">
              <div className="card-content">
                <h3>Back</h3>
                <p>{currentCard.back}</p>
                {currentCard.tags && currentCard.tags.length > 0 && (
                  <div className="card-tags">
                    {currentCard.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isFlipped && (
          <div className="answer-buttons">
            <button 
              className="incorrect-button"
              onClick={() => handleAnswer(false)}
            >
              ❌ Incorrect
            </button>
            <button 
              className="correct-button"
              onClick={() => handleAnswer(true)}
            >
              ✅ Correct
            </button>
          </div>
        )}
      </div>

      <div className="session-progress">
        <div className="progress-stats">
          <span>Studied: {sessionStats.studiedCards}</span>
          <span>Correct: {sessionStats.correctAnswers}</span>
          <span>Incorrect: {sessionStats.incorrectAnswers}</span>
        </div>
      </div>
    </div>
  );
};

export default StudySession;
