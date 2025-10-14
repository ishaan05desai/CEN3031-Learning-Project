const { body, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Card validation rules
const validateCard = [
  body('front')
    .trim()
    .notEmpty()
    .withMessage('Card front content is required')
    .isLength({ max: 500 })
    .withMessage('Card front cannot exceed 500 characters'),
  
  body('back')
    .trim()
    .notEmpty()
    .withMessage('Card back content is required')
    .isLength({ max: 500 })
    .withMessage('Card back cannot exceed 500 characters'),
  
  body('deckId')
    .isMongoId()
    .withMessage('Invalid deck ID'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Each tag cannot exceed 20 characters'),
  
  handleValidationErrors
];

// Deck validation rules
const validateDeck = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Deck name is required')
    .isLength({ max: 100 })
    .withMessage('Deck name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Each tag cannot exceed 20 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateCard,
  validateDeck,
  handleValidationErrors
};
