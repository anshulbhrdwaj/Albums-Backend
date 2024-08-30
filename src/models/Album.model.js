const mongoose = require("mongoose");
const  { Schema } = mongoose

const mediaSchema = new Schema(
  {
    mediaName: { type: String, requred: true },
    album: { type: String, requred: true },
    path: { type: String, requred: true },
    size: { type: Number, requred: true },
  },
  { timestamps: true }
)

const albumSchema = new Schema(
  {
    albumName: { type: String, requred: true },
    category: { type: String, requred: true },
    status: { type: String, requred: true },
    botLink: { type: String, requred: true },
    media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
    path: { type: String, requred: true },
    size: { type: Number, requred: true },
  },
  { timestamps: true }
);

const Media = mongoose.model("Media", mediaSchema);
const Album = mongoose.model("Album", albumSchema);

module.exports = {Media, Album}