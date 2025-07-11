const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../helpers/auth');
const adminController = require('../controllers/adminController');
const attendanceController = require('../controllers/attendanceController');

// Inscription et connexion admin (pas de vérification email)
router.post('/register', adminController.registerAdmin);
router.post('/login',    adminController.loginAdmin);

// Routes protégées – accès admin uniquement
router.get('/users',                  verifyToken, isAdmin, adminController.getUsers);
router.post('/mark-absent',           verifyToken, isAdmin, adminController.markAbsent);
router.patch('/users/:id/remote',     verifyToken, isAdmin, attendanceController.setRemoteAllowed);

module.exports = router;
