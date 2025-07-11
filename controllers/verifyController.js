const VerificationCode = require('../models/VerificationCode');
const User = require('../models/User');

exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email et code requis' });
    }

    const record = await VerificationCode.findOne({ email, code });
    if (!record) {
      return res.status(400).json({ error: 'Code invalide ou expiré' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    user.isVerified = true;
    await user.save();

    await VerificationCode.deleteOne({ _id: record._id });

    res.json({ message: 'Compte vérifié avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};