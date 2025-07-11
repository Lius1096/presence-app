const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',   // ou le SMTP de ton fournisseur mail
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL,           // ton email d'envoi
    pass: process.env.EMAIL_PASSWORD   // ton mot de passe ou token d'appli
  }
});

async function sendVerificationCode(email, code) {
  const mailOptions = {
    from: `"Présence App" <${process.env.EMAIL}>`,  // l'expéditeur doit matcher l'utilisateur SMTP
    to: email,      // ici, l'adresse de réception (ex: MAIL_RECEIVER ou un utilisateur)
    subject: 'Votre code de vérification',
    text: `Votre code de vérification est : ${code}`
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationCode };
