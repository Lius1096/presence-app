const User = require('../models/User');
const Attendance = require('../models/Attendance');
const VerificationCode = require('../models/VerificationCode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationCode } = require('../helpers/mailer');

// POST /api/admin/register
exports.registerAdmin = async (req, res) => {
  const { firstname, lastname, email, phone, password, confirmPassword } = req.body;
  if (!firstname || !lastname || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
      role: 'admin',
      isVerified: false,
      remoteAllowed: true
    });
    await user.save();
    // send verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await VerificationCode.create({ userId: user._id, code, expiresAt });
    await sendVerificationCode(email, code);
    res.json({ message: 'Admin inscrit. Vérifiez votre email.' });
  } catch (err) {
    console.error('Erreur admin register:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/admin/login
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    if (!user.isVerified) return res.status(403).json({ error: 'Compte non vérifié' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé, admin uniquement' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Mot de passe incorrect' });
    const token = jwt.sign(
      { user: { _id: user._id, firstname: user.firstname, lastname: user.lastname, email: user.email }, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ message: 'Connexion admin réussie', token });
  } catch (err) {
    console.error('Erreur admin login:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/auth/verify
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email et code requis' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Utilisateur non trouvé' });
    const record = await VerificationCode.findOne({ userId: user._id, code });
    if (!record || record.expiresAt < new Date()) {
      await VerificationCode.deleteMany({ userId: user._id });
      return res.status(400).json({ error: 'Code invalide ou expiré' });
    }
    user.isVerified = true;
    await user.save();
    await VerificationCode.deleteMany({ userId: user._id });
    const token = jwt.sign(
      { user: { _id: user._id, firstname: user.firstname, lastname: user.lastname, email: user.email }, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ message: 'Vérification réussie', token });
  } catch (err) {
    console.error('Erreur verifyCode:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const users = await User.find({}, 'firstname lastname email phone remoteAllowed');
    const results = await Promise.all(users.map(async u => {
      const attendance = await Attendance.findOne({ user: u._id, timestamp: { $gte: startOfDay } }).sort({ timestamp: -1 });
      return {
        _id: u._id,
        firstname: u.firstname,
        lastname: u.lastname,
        email: u.email,
        phone: u.phone,
        remoteAllowed: u.remoteAllowed,
        status: attendance ? attendance.status : 'absent',
        date: attendance ? attendance.timestamp : null
      };
    }));
    res.json(results);
  } catch (err) {
    console.error('Erreur getUsers admin:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/admin/mark-absent
exports.markAbsent = async (req, res) => {
  const { userId, date } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId requis' });
  try {
    const day = date ? new Date(date) : new Date();
    day.setHours(0,0,0,0);
    const attendance = new Attendance({ user: userId, status: 'absent', timestamp: day, remote: false, location: null });
    await attendance.save();
    res.json({ message: 'Utilisateur marqué absent', userId, date: attendance.timestamp });
  } catch (err) {
    console.error('Erreur markAbsent admin:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
