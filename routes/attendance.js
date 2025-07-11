const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken } = require('../helpers/auth');
const { requestRemote, approveRemote } = require('../controllers/attendanceController');
router.post('/', verifyToken, attendanceController.pointAttendance);
router.get('/today', attendanceController.getTodayStatus);
router.post('/request-remote', verifyToken, requestRemote);
router.post('/approve-remote', approveRemote);

module.exports = router;