const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const { createLeadRules, updateLeadRules, noteRules, handleValidation } = require('../validators/lead.validator');

router.use(authenticate);

router.get('/', leadController.getLeads);
router.get('/:leadId', leadController.getLead);
router.post('/', requireRole('admin'), createLeadRules, handleValidation, leadController.createLead);
router.patch('/:leadId', updateLeadRules, handleValidation, leadController.updateLead);
router.delete('/:leadId', requireRole('admin'), leadController.deleteLead);

router.get('/:leadId/notes', leadController.getNotes);
router.post('/:leadId/notes', noteRules, handleValidation, leadController.createNote);

router.get('/:leadId/activity', leadController.getActivity);

module.exports = router;
