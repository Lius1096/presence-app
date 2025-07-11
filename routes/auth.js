const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/verify-code', authController.verifyCode);
router.post('/resend-code', authController.resendCode);
router.post('/login', authController.login);

module.exports = router;