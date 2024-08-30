const express = require("express");
const router = express.Router();

const authController = require('../controllers/auth.controllers.js')

router.post('/:token', authController.refreshToken)

module.exports = router