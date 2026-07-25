const { body, validationResult } = require('express-validator');
const { error } = require('../utils/response');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Validation failed', 422, errors.array().map((e) => e.msg));
  }
  next();
};

const publicLeadRules = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('requirement').trim().notEmpty().withMessage('Requirement is required'),
  body('source').optional().trim(),
];

const createLeadRules = [
  ...publicLeadRules,
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'])
    .withMessage('Invalid status'),
];

const updateLeadRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('requirement').optional().trim().notEmpty().withMessage('Requirement cannot be empty'),
  body('source').optional().trim(),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'])
    .withMessage('Invalid status'),
];

const noteRules = [
  body('content').trim().notEmpty().withMessage('Note content is required'),
];

module.exports = { publicLeadRules, createLeadRules, updateLeadRules, noteRules, handleValidation };
