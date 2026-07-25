const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const { createUserRules, handleValidation } = require('../validators/auth.validator');

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/users', adminController.getUsers);
router.post('/users', createUserRules, handleValidation, adminController.createUser);
router.patch('/users/:userId/status', adminController.updateUserStatus);

module.exports = router;
