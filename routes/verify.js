const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verifyController');

router.post('/code', verifyController.verifyCode);

module.exports = router;