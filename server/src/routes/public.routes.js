const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const publicController = require('../controllers/public.controller');
const { publicLeadRules, handleValidation } = require('../validators/lead.validator');

const leadSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/leads', leadSubmitLimiter, publicLeadRules, handleValidation, publicController.submitLead);

module.exports = router;
