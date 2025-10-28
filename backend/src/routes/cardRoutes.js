const express = require('express');
const { 
  createCard, 
  getCardsByDeck, 
  updateCard, 
  deleteCard,
  createDeck,
  getUserDecks
} = require('../controllers/cardController');
const { validateCard, validateDeck } = require('../middleware/cardValidation');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Deck routes
router.post('/decks', validateDeck, createDeck);
router.get('/decks', getUserDecks);

// Card routes - no /cards prefix since router is mounted at /api/cards
router.post('/', validateCard, createCard);
router.get('/decks/:deckId/cards', getCardsByDeck);
router.put('/:cardId', validateCard, updateCard);
router.delete('/:cardId', deleteCard);

module.exports = router;
