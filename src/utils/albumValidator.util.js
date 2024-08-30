const Album = require('../models/Album.model.js');

exports.validateAlbumExists = async (req, res, next) => {
  const albumId = req.params.album;
  try {
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    req.album = album;
    next();
  } catch (error) {
    next(error);
  }
};
