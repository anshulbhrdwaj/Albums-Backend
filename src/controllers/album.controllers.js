const fs = require("fs");
const path = require("path");
const { Album, Media } = require("../models/Album.model");

exports.getAlbums = async (req, res, next) => {
  try {
    const albums = await Album.find();
    if (albums.length === 0) {
      return res.status(200).json({ message: "No albums found!" });
    }
    res.status(200).json({ albums });
  } catch (error) {
    next(error);
  }
};

exports.deleteAlbums = async (req, res, next) => {
  try {
    console.log(req.body);
    const albumsIds = req.body.albums;
    if (!albumsIds) {
      return res.status(400).json({ error: "Albums info required!" });
    }
    albumsIds.map(async (albumId) => {
      const deletedAlbum = await Album.findByIdAndDelete(albumId);
      if (deletedAlbum) {
        fs.rm(deletedAlbum.path, { recursive: true, force: true }, (err) => {
          if (err) {
            console.error("Error deleting Album: ", err);
          } else {
            console.log(
              `Album ${deletedAlbum.albumName} deleted successfully!`
            );
          }
        });
      }
    });
    res.status(201).json({ message: "Albums deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

exports.createAlbum = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Files are required!" });
    }

    console.log(req.files);

    const mediaIds = [];

    for (const file of req.files) {
      const media = new Media({
        mediaName: file.filename,
        album: req.body.albumName.replace(/\s+/g, "_"),
        path: file.path,
        size: file.size,
      });
      await media.save();
      mediaIds.push(media._id);
    }

    const album = new Album({
      albumName: req.body.albumName.replace(/\s+/g, "_"),
      media: mediaIds,
      path: path.join(
        __dirname,
        "..",
        "..",
        "albums",
        req.body.albumName.replace(/\s+/g, "_")
      ),
      category: req.body.category,
      status: req.body.status,
      size:
        req.files.reduce((totalSize, media) => totalSize + media.size, 0) /
        (1024 * 1024),
    });

    await album.save();

    await Album.findByIdAndUpdate(album._id, {
      $set: {
        botLink: `https://telegram.me/ab_practice_bot?start=${album._id}`,
      },
    });

    res.status(201).json({
      message: "Album created successfully!",
      album,
      // telegram: `https://telegram.me/ab_practice_bot?start=${album._id}`,
    });
  } catch (error) {
    console.error("Error creating album: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAlbumById = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.album);
    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    const albumData = {
      _id: album._id,
      albumName: album.albumName,
      media: album.media,
    };

    return res.status(200).json(albumData);
  } catch (error) {
    console.error("Error finding album:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteAlbumById = async (req, res, next) => {
  try {
    const albumId = req.params.album;
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    if (album) {
      fs.rm(album.path, { recursive: true, force: true }, (err) => {
        if (err) {
          console.error("Error deleting Album: ", err);
        } else {
          console.log(`Album ${album.albumName} deleted successfully!`);
        }
      });
    }

    await Album.findByIdAndDelete(albumId);

    res.status(201).json({
      message: `Album named ${album.albumName} and associated media files deleted successfully!`,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateAlbumById = async (req, res, next) => {
  try {
    // if (!req.files || req.files.length === 0) {
    //   return res.status(400).json({ error: "Files are required!" });
    // }

    const albumId = req.params.album;

    const album = await Album.findById(albumId);

    if (!album) {
      fs.rm(
        path.join(
          __dirname,
          "..",
          "..",
          `albums`,
          req.body.albumName.replace(/\s+/g, "_")
        ),
        { recursive: true, force: true },
        (err) => {
          if (err) {
            console.error("Error deleting Media: ", err);
          } else {
            console.log(`Media deleted successfully!`);
          }
        }
      );
      return res.status(404).json({ error: "Album not found" });
    }

    const mediaIds = [];

    if (req.files || req.files.length > 0) {
      for (const file of req.files) {
        const media = new Media({
          mediaName: file.filename,
          album: album.albumName,
          path: file.path,
          size: file.size,
        });
        await media.save();
        mediaIds.push(media._id);
      }
    }

    await Album.updateOne(
      { _id: albumId },
      {
        $set: {
          albumName: req.body.albumName,
          status: req.body.status,
          category: req.body.category,
        },
        $push: {
          media: { $each: mediaIds },
        },
      },
      { useFindAndModify: false }
    );

    const updatedAlbum = await Album.findById(albumId);

    res.status(201).json({
      message: "Album updated successfully!",
      ...{
        updatedAlbum,
        telegram: `https://telegram.me/ab_practice_bot?start=${updatedAlbum._id}`,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteMedia = async (req, res, next) => {
  try {
    const mediaId = req.params.media;
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    if (media) {
      fs.unlink(media.path, (err) => {
        if (err) {
          console.error("Error deleting Media: ", err);
        } else {
          console.log(`Media ${media.mediaName} deleted successfully!`);
        }
      });
    }

    await Media.findByIdAndDelete(mediaId);
    await Album.findOneAndUpdate(
      { albumName: media.album },
      { $pull: { media: mediaId } }
    );

    res.status(201).json({
      message: `Media named ${media.mediaName} from ${media.album} deleted successfully!`,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getMediaById = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.media);
    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    const mediaUrl = `${req.protocol}://${req.get("host")}/${media.path}`;
    // const mediaUrl = `https://${req.get("host")}/${media.path}`;

    console.log(mediaUrl);

    res.json({ url: mediaUrl });
  } catch (error) {
    next(error);
  }
};
