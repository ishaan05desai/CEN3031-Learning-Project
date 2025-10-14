const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  front: {
    type: String,
    required: [true, 'Card front content is required'],
    trim: true,
    maxlength: [500, 'Card front cannot exceed 500 characters']
  },
  back: {
    type: String,
    required: [true, 'Card back content is required'],
    trim: true,
    maxlength: [500, 'Card back cannot exceed 500 characters']
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: [true, 'Card must belong to a deck']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  studyCount: {
    type: Number,
    default: 0
  },
  correctCount: {
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
cardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate accuracy percentage
cardSchema.virtual('accuracy').get(function() {
  if (this.studyCount === 0) return 0;
  return Math.round((this.correctCount / this.studyCount) * 100);
});

// Ensure virtual fields are serialized
cardSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Card', cardSchema);
