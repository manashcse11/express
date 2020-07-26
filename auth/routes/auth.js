const router = require('express').Router();
const {loggedIn, adminOnly} = require("../helpers/auth.middleware");
const userController = require('../controllers/user.controller');

// Register a new User
router.post('/register', userController.register);

// Login
router.post('/login', userController.login);

// Auth user only
router.get('/authuseronly', loggedIn, userController.authuseronly);

// Admin user only
router.get('/adminonly', loggedIn, adminOnly, userController.adminonly);

module.exports = router;