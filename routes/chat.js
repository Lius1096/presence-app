const express = require('express');
const router = express.Router();
const { getInitialMessage } = require('../controllers/chatController');

router.get('/', getInitialMessage);

module.exports = router;