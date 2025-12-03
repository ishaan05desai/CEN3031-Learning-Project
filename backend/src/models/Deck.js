/**
 * Deck Model
 * 
 * Defines the schema for flashcard deck collections in the FlashLearn application.
 * Decks contain multiple cards and can be public or private.
 */

const mongoose = require('mongoose');

// Deck schema definition with validation rules
const deckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Deck name is required'],
    trim: true,
    maxlength: [100, 'Deck name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  cardCount: {
    type: Number,
    default: 0
  },
  studyCount: {
    type: Number,
    default: 0
  },
  lastStudied: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save Middleware: Update Timestamp
// Automatically updates the updatedAt field whenever the deck is saved
deckSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Update Card Count
 * Recalculates and updates the cardCount field based on actual cards in the deck
 * This ensures the count stays accurate when cards are added or removed
 * @returns {Promise<void>}
 */
deckSchema.methods.updateCardCount = async function() {
  const Card = mongoose.model('Card');
  // Count all cards that belong to this deck
  this.cardCount = await Card.countDocuments({ deck: this._id });
  await this.save();
};

module.exports = mongoose.model('Deck', deckSchema);
