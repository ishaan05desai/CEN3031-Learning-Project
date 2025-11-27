const Card = require('../models/Card');
const Deck = require('../models/Deck');

// Create a new card
const createCard = async (req, res) => {
  try {
    const { front, back, deckId, difficulty, tags } = req.body;
    const userId = req.user.userId;

    // Verify deck exists and belongs to user
    const deck = await Deck.findOne({ _id: deckId, createdBy: userId });
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found or access denied'
      });
    }

    // Create new card
    const card = new Card({
      front,
      back,
      deck: deckId,
      createdBy: userId,
      difficulty: difficulty || 'medium',
      tags: tags || []
    });

    await card.save();

    // Update deck card count
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

// Get all cards for a deck
const getCardsByDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const userId = req.user.userId;

    // Verify deck exists and belongs to user
    const deck = await Deck.findOne({ _id: deckId, createdBy: userId });
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found or access denied'
      });
    }

    const cards = await Card.find({ deck: deckId })
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

    const card = await Card.findOne({ _id: cardId, createdBy: userId });
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

    const card = await Card.findOne({ _id: cardId, createdBy: userId });
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

// Create a new deck
const createDeck = async (req, res) => {
  try {
    const { name, description, isPublic, tags } = req.body;
    const userId = req.user.userId;

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

// Get all decks for a user
const getUserDecks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const decks = await Deck.find({ createdBy: userId })
      .sort({ updatedAt: -1 })
      .populate('createdBy', 'username');

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

// Delete a deck
const deleteDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const userId = req.user.userId;

    // Verify deck exists and belongs to user
    const deck = await Deck.findOne({ _id: deckId, createdBy: userId });
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found or access denied'
      });
    }

    // Delete all cards associated with the deck
    await Card.deleteMany({ deck: deckId });

    // Delete the deck
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
