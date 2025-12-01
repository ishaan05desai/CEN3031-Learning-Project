const Deck = require('../models/Deck');
const Card = require('../models/Card');

/**
 * Creates a seed flashcard deck with sample cards for a new user
 * @param {String} userId - The ID of the user to create the deck for
 * @returns {Promise<Object>} The created deck
 */
const createSeedDeck = async (userId) => {
  try {
    // Create the seed deck
    const deck = new Deck({
      name: 'Getting Started',
      description: 'Welcome to FlashLearn! This is a sample deck to help you get started. Feel free to edit or delete these cards.',
      createdBy: userId,
      isPublic: false,
      tags: ['welcome', 'sample']
    });

    await deck.save();

    // Define seed cards
    const seedCards = [
      {
        front: 'What is spaced repetition?',
        back: 'Spaced repetition is a learning technique that involves increasing intervals of time between subsequent review of previously learned material to exploit the psychological spacing effect.',
        difficulty: 'medium',
        tags: ['learning', 'technique']
      },
      {
        front: 'What is active recall?',
        back: 'Active recall is a study method where you actively retrieve information from memory rather than passively reviewing it. This strengthens memory retention.',
        difficulty: 'medium',
        tags: ['learning', 'technique']
      },
      {
        front: 'How often should you review flashcards?',
        back: 'Review frequency depends on your mastery level. New cards may need daily review, while well-mastered cards can be reviewed less frequently using spaced repetition algorithms.',
        difficulty: 'easy',
        tags: ['study', 'tips']
      },
      {
        front: 'What makes a good flashcard?',
        back: 'A good flashcard has a clear, specific question on the front and a concise answer on the back. It should test one concept at a time and avoid unnecessary information.',
        difficulty: 'easy',
        tags: ['tips', 'creation']
      },
      {
        front: 'What is the forgetting curve?',
        back: 'The forgetting curve is a hypothesis that shows how information is lost over time when there is no attempt to retain it. Regular review helps flatten this curve.',
        difficulty: 'hard',
        tags: ['psychology', 'learning']
      }
    ];

    // Create all seed cards
    const cards = seedCards.map(cardData => ({
      front: cardData.front,
      back: cardData.back,
      deck: deck._id,
      createdBy: userId,
      difficulty: cardData.difficulty,
      tags: cardData.tags
    }));

    await Card.insertMany(cards);

    // Update deck card count
    await deck.updateCardCount();

    console.log(`Seed deck created for user ${userId} with ${seedCards.length} cards`);
    return deck;
  } catch (error) {
    console.error('Error creating seed deck:', error);
    throw error;
  }
};

module.exports = {
  createSeedDeck
};

