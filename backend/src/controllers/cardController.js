/**
 * Card Controller
 * 
 * Handles all flashcard and deck-related operations including:
 * - Creating, reading, updating, and deleting cards
 * - Creating, reading, and deleting decks
 * - Managing card statistics and study tracking
 */

const Card = require('../models/Card');
const Deck = require('../models/Deck');

/**
 * Create a New Card
 * Creates a new flashcard in the specified deck
 * Verifies deck ownership (admins can create cards in any deck)
 * @route POST /api/cards
 * @requires Authentication
 */
const createCard = async (req, res) => {
  try {
    const { front, back, deckId, difficulty, tags } = req.body;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    // Verify deck exists and user has permission
    // Admins can create cards in any deck; regular users only in their own decks
    const deckQuery = isAdmin 
      ? { _id: deckId }
      : { _id: deckId, createdBy: userId };
    const deck = await Deck.findOne(deckQuery);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found or access denied'
      });
    }

    // Create new card instance
    const card = new Card({
      front,
      back,
      deck: deckId,
      createdBy: userId,
      difficulty: difficulty || 'medium',
      tags: tags || []
    });

    await card.save();

    // Update the deck's card count to reflect the new card
    await deck.updateCardCount();

    res.status(201).json({
      success: true,
      message: 'Card created successfully',
      data: {
        card
      }
    });

  } catch (error) {
    console.error('Create card error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get All Cards for a Deck
 * Retrieves all cards in a deck, optionally filtered by difficulty
 * @route GET /api/cards/decks/:deckId/cards
 * @requires Authentication
 */
const getCardsByDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { difficulty } = req.query;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    // Verify deck exists and user has permission
    // Admins can view cards in any deck; regular users only in their own decks
    const deckQuery = isAdmin 
      ? { _id: deckId }
      : { _id: deckId, createdBy: userId };
    const deck = await Deck.findOne(deckQuery);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found or access denied'
      });
    }

    // Build query with optional difficulty filter from query parameters
    const query = { deck: deckId };
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      query.difficulty = difficulty;
    }

    const cards = await Card.find(query)
      .sort({ createdAt: -1 })
      .populate('deck', 'name');

    res.json({
      success: true,
      data: {
        cards,
        deck
      }
    });

  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update a card
const updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { front, back, difficulty, tags } = req.body;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    const cardQuery = isAdmin 
      ? { _id: cardId }
      : { _id: cardId, createdBy: userId };
    const card = await Card.findOne(cardQuery);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found or access denied'
      });
    }

    // Update card fields
    if (front !== undefined) card.front = front;
    if (back !== undefined) card.back = back;
    if (difficulty !== undefined) card.difficulty = difficulty;
    if (tags !== undefined) card.tags = tags;

    await card.save();

    res.json({
      success: true,
      message: 'Card updated successfully',
      data: {
        card
      }
    });

  } catch (error) {
    console.error('Update card error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete a card
const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    const cardQuery = isAdmin 
      ? { _id: cardId }
      : { _id: cardId, createdBy: userId };
    const card = await Card.findOne(cardQuery);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found or access denied'
      });
    }

    const deckId = card.deck;
    await Card.findByIdAndDelete(cardId);

    // Update deck card count
    const deck = await Deck.findById(deckId);
    if (deck) {
      await deck.updateCardCount();
    }

    res.json({
      success: true,
      message: 'Card deleted successfully'
    });

  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create a New Deck
 * Creates a new flashcard deck for the authenticated user
 * @route POST /api/cards/decks
 * @requires Authentication
 */
const createDeck = async (req, res) => {
  try {
    const { name, description, isPublic, tags } = req.body;
    const userId = req.user.userId;

    // Create new deck instance
    const deck = new Deck({
      name,
      description: description || '',
      createdBy: userId,
      isPublic: isPublic || false,
      tags: tags || []
    });

    await deck.save();

    res.status(201).json({
      success: true,
      message: 'Deck created successfully',
      data: {
        deck
      }
    });

  } catch (error) {
    console.error('Create deck error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get All Decks for User
 * Retrieves all decks for the authenticated user
 * Admins can see all decks from all users
 * @route GET /api/cards/decks
 * @requires Authentication
 */
const getUserDecks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    // Build query: admins see all decks, regular users see only their own
    const deckQuery = isAdmin ? {} : { createdBy: userId };
    const decks = await Deck.find(deckQuery)
      .sort({ updatedAt: -1 }) // Sort by most recently updated first
      .populate('createdBy', 'username email'); // Include creator information

    res.json({
      success: true,
      data: {
        decks
      }
    });

  } catch (error) {
    console.error('Get user decks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete a Deck
 * Deletes a deck and all associated cards (cascade delete)
 * Verifies deck ownership before deletion
 * @route DELETE /api/cards/decks/:deckId
 * @requires Authentication
 */
const deleteDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    // Verify deck exists and user has permission
    // Admins can delete any deck; regular users only their own
    const deckQuery = isAdmin 
      ? { _id: deckId }
      : { _id: deckId, createdBy: userId };
    const deck = await Deck.findOne(deckQuery);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found or access denied'
      });
    }

    // Cascade delete: Remove all cards associated with this deck
    await Card.deleteMany({ deck: deckId });

    // Delete the deck itself
    await Deck.findByIdAndDelete(deckId);

    res.json({
      success: true,
      message: 'Deck deleted successfully'
    });

  } catch (error) {
    console.error('Delete deck error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createCard,
  getCardsByDeck,
  updateCard,
  deleteCard,
  createDeck,
  getUserDecks,
  deleteDeck
};
