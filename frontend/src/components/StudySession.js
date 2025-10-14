import React, { useState, useEffect } from 'react';
import './StudySession.css';

const StudySession = ({ deck, onEndSession }) => {
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalCards: 0,
    studiedCards: 0,
    correctAnswers: 0,
    incorrectAnswers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    if (deck) {
      fetchCards();
    }
  }, [deck]);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/cards/decks/${deck._id}/cards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.data.cards.length > 0) {
        // Shuffle cards for study session
        const shuffledCards = shuffleArray([...data.data.cards]);
        setCards(shuffledCards);
        setSessionStats(prev => ({
          ...prev,
          totalCards: shuffledCards.length
        }));
      } else {
        alert('No cards found in this deck. Add some cards first!');
        onEndSession();
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      alert('Failed to load cards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleAnswer = async (isCorrect) => {
    const currentCard = cards[currentCardIndex];
    
    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      studiedCards: prev.studiedCards + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: isCorrect ? prev.incorrectAnswers : prev.incorrectAnswers + 1
    }));

    // Update card stats on server
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/cards/${currentCard._id}`, {
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
    }

    // Move to next card or end session
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
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
