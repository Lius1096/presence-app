const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationCode } = require('../helpers/mailer');

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/register
exports.register = async (req, res) => {
  const { firstname, lastname, email, phone, password, confirmPassword } = req.body;

  if (!firstname || !lastname || !email || !password || !confirmPassword) {
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
      isVerified: false,
    });

    await user.save();

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await VerificationCode.create({ userId: user._id, code, expiresAt });
    await sendVerificationCode(email, code);

    res.json({ message: 'Inscription réussie. Vérifiez votre email.' });
  } catch (err) {
    console.error('Erreur dans register:', err);
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
      await VerificationCode.deleteMany({ userId: user._id }); // Nettoyage
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
    console.error('Erreur dans verifyCode:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/auth/resend-code
exports.resendCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Utilisateur non trouvé' });

    if (user.isVerified) {
      return res.status(400).json({ error: 'Compte déjà vérifié' });
    }

    // Supprimer les anciens codes expirés ou non
    await VerificationCode.deleteMany({ userId: user._id });

    // Générer un nouveau code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await VerificationCode.create({ userId: user._id, code, expiresAt });

    // Envoyer le code par mail
    await sendVerificationCode(email, code);

    res.json({ message: 'Nouveau code de vérification envoyé par email.' });
  } catch (err) {
    console.error('Erreur dans resendCode:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Utilisateur non trouvé' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Compte non vérifié. Vérifiez votre email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign(
  { user: { _id: user._id, firstname: user.firstname, lastname: user.lastname, email: user.email }, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '8h' }
);


    res.json({ message: 'Connexion réussie', token });
  } catch (err) {
    console.error('Erreur dans login:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
