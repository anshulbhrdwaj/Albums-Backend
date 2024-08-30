const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const albumName = req.body.albumName.replace(/\s+/g, '_');
    const albumPath = `./albums/${albumName}`;
    if (!fs.existsSync(albumPath)) {
      fs.mkdirSync(albumPath, { recursive: true });
    }
    cb(null, albumPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1000000 * 100 } // Example limit: 100MB
});

module.exports = upload;
