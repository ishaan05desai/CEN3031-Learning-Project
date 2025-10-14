const mongoose = require('mongoose');

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

// Update updatedAt field before saving
deckSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update card count when cards are added/removed
deckSchema.methods.updateCardCount = async function() {
  const Card = mongoose.model('Card');
  this.cardCount = await Card.countDocuments({ deck: this._id });
  await this.save();
};

module.exports = mongoose.model('Deck', deckSchema);
