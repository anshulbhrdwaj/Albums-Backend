const express = require("express");
const router = express.Router();
const { webhookMiddleware } = require("../controllers/bot.controllers.js");

router.post("*", webhookMiddleware);

module.exports = router;
