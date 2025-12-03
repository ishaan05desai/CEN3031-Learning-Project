/**
 * Card and Deck Routes
 * 
 * Defines all flashcard and deck-related API endpoints.
 * All routes require authentication via JWT token.
 */

const express = require('express');
const { 
  createCard, 
  getCardsByDeck, 
  updateCard, 
  deleteCard,
  createDeck,
  getUserDecks,
  deleteDeck
} = require('../controllers/cardController');
const { validateCard, validateCardUpdate, validateDeck } = require('../middleware/cardValidation');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes in this router
// This ensures only authenticated users can access card and deck endpoints
router.use(authMiddleware);

// ==================== DECK ROUTES ====================

// Create a new deck
router.post('/decks', validateDeck, createDeck);
// Get all decks for the authenticated user (admins see all decks)
router.get('/decks', getUserDecks);
// Delete a deck and all its cards
router.delete('/decks/:deckId', deleteDeck);

// ==================== CARD ROUTES ====================
// Note: Router is mounted at /api/cards, so these routes don't need /cards prefix

// Create a new card in a deck
router.post('/', validateCard, createCard);
// Get all cards in a specific deck (optionally filtered by difficulty)
router.get('/decks/:deckId/cards', getCardsByDeck);
// Update an existing card
router.put('/:cardId', validateCardUpdate, updateCard);
// Delete a card
router.delete('/:cardId', deleteCard);

module.exports = router;
