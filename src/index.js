const connectDB = require("./db/db.js");
const app = require("./app.js");
const bot = require("./controllers/bot.controllers.js");
require("dotenv").config({ path: "./.env" });

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`Error starting Server: ${error}`);
      throw error;
    });

    app.listen(process.env.PORT || 4000, async () => {
      // bot.start()
      console.log(`Listening on port ${process.env.PORT || 4000}`);
    });
  })
  .catch((error) => {
    console.log(`Mongo DB connection FAILED!! `, error);
  });
