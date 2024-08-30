const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer.middleware.js');
const albumController = require('../controllers/album.controllers.js');
const verifyToken = require('../middlewares/auth.middleware.js');

router.get('/', albumController.getAlbums);

router.delete('/', albumController.deleteAlbums);

router.post('/create-album', upload.array('media'), albumController.createAlbum);

router.get('/:album', albumController.getAlbumById);

router.delete('/:album', albumController.deleteAlbumById);

router.put('/:album', upload.array('media'), albumController.updateAlbumById);

router.delete('/media/:media', albumController.deleteMedia);

router.get('/media/:media', albumController.getMediaById);

module.exports = router;
