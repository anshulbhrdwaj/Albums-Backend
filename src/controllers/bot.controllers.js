const { Bot, session, InlineKeyboard, InputFile } = require("grammy");
const { freeStorage } = require("@grammyjs/storage-free");
const { apiClient, publicEarn } = require("../constants/api-client.js");
const { isVideoUrl } = require("../utils/utils.js");
require("dotenv").config({ path: "./.env" });

const bot = new Bot(process.env.BOT_TOKEN);
bot.use(
  session({
    initial: () => ({ token: "", username: "", expiresAt: 0 }),
    storage: freeStorage(bot.token),
  })
);

bot.command("start", async (ctx) => {
  const input = ctx.message.text.split(" ")[1];
  let albumId;

  if (input.includes("token_")) {
    let token = input.slice("token_".length);
    console.log(token);

    ctx.session.token = token;
    ctx.session.username = ctx.from.username;
    ctx.session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  } else {
    albumId = input;
  }

  if (!albumId) {
    return;
  }

  try {
    const { id, username, first_name, last_name } = ctx.from;
    console.log(id);
    const album = await apiClient
      .get(`/api/albums/${albumId}`, {
        data: {
          userId: id,
          username,
          name: `${first_name} ${last_name}`,
          // token: ctx.session.token,
        },
      })
      .then((res) => res.data)
      .catch(async (err) => {
        const { error, refreshUrl } = err.response.data;
        console.log(refreshUrl);
        const { shortenedUrl } = await publicEarn
          .get("/api", {
            params: { api: process.env.PUBLIC_EARN_TOKEN, url: refreshUrl },
          })
          .then((res) => res.data);
        const refreshKeyboard = new InlineKeyboard().url(
          "💥 Click to refresh token. 💥",
          shortenedUrl
        );
        return await ctx.reply(`${error}`, {
          reply_markup: refreshKeyboard,
        });
      });

    // if (album.response.data.error)

    const mediaUrls = await Promise.all(
      album?.media?.map(async (mediaItem) => {
        try {
          const mediaUrl = await apiClient
            .get(`/api/albums/media/${mediaItem}`)
            .then((res) => res.data.url);

          // console.log(photoResponse);
          return mediaUrl;
        } catch (error) {
          console.error(`Error fetching media item ${mediaItem}:`, error);
          throw new Error(
            `Error fetching media item ${mediaItem}: ${error.message}`
          );
        }
      })
    );

    for (const url of mediaUrls) {
      console.log(url);

      const isVideo = isVideoUrl(url);
      if (isVideo) {
        await ctx.replyWithVideo(new InputFile({ url }));
      } else {
        // Assuming you have a method to handle photos
        await ctx.replyWithPhoto(new InputFile({ url }));
      }
    }
  } catch (error) {
    console.error("Error fetching and replying with photos:", error);
    // ctx.reply("An error occurred while fetching and replying with photos.");
  }
});

module.exports = bot;
// exports.webhookMiddleware = webhookCallback(bot, "express");
