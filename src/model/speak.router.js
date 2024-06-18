const express = require('express');
const router = express.Router();
const { getHomeData, searchSpeakersByField, getSpeakerDetailsById, addFavoriteController, getFavoritesController, deleteFavoriteController } = require('./speak.controller');
const { checkToken } = require('../../auth/validate');

router.get('/home', getHomeData, checkToken);
router.get('/speaker/:id', getSpeakerDetailsById);
router.get('/search/speakers', searchSpeakersByField);
// Misalnya, menggunakan method POST untuk menambahkan favorit
router.post('/favorite/add', addFavoriteController);

// Menggunakan method GET untuk membaca daftar favorit
router.get('/favorite/:userId', getFavoritesController);

// Misalnya, menggunakan method DELETE untuk menghapus favorit
router.delete('/favorite/delete', deleteFavoriteController);

module.exports = router;
