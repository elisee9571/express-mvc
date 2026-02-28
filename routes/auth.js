const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const asyncHandler = require("../utils/asyncHandler");

router.post("/register", asyncHandler(AuthController.signUp));
router.post("/login", asyncHandler(AuthController.signIn));
router.get("/refresh", asyncHandler(AuthController.refresh));

module.exports = router;
