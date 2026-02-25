const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

router.post('/register', AuthController.signUp);
router.post('/login', AuthController.signIn);
router.get('/refresh', AuthController.refresh);

module.exports = router;
