const router = require('express').Router();
const userController = require('../controllers/user.controller');

// Register a new User
router.post('/register', userController.register);

module.exports = router;