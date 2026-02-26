const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.get('/', UserController.users);
router.get('/:id', UserController.user);

module.exports = router;
