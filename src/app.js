const express = require("express");
const cors = require("cors");
const path = require("path");
// const bot = require("./controllers/bot.controllers.js");
const errorHandlerUtil = require("./utils/errorHandler.util.js");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// app.use(`/telegram`, bot.webhookMiddleware);
app.use("/api/albums", require("./routes/album.routes.js"));
app.use("/albums", express.static(path.join(__dirname, "..", "albums")));

app.use(errorHandlerUtil);

module.exports = app;
