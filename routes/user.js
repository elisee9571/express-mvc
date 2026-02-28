const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const asyncHandler = require("../utils/asyncHandler");

router.get('/', asyncHandler(UserController.users));
router.get('/:id', asyncHandler(UserController.user));

module.exports = router;
