// botReplyKeywords.js

module.exports = function getBotReply(message) {
  const lower = message.toLowerCase();

  // Groupes de mots-clés
  const greetings = ['bonjour', 'salut', 'bonsoir', 'coucou'];
  const presence = ['présence', 'pointage', 'pointer', 'présent', 'absent'];
  const support = [
    'parler', 'discuter', 'problème', 'conseiller', 'aide', 'question',
    'transport', 'retard', 'besoin', 'souci', 'erreur', 'bug'
  ];

  if (greetings.some(mot => lower.includes(mot))) {
    return "Bonjour ! Comment puis-je vous aider ?";
  }

  if (presence.some(mot => lower.includes(mot))) {
    return "Vous pouvez pointer votre présence depuis votre tableau de bord.";
  }

  if (support.some(mot => lower.includes(mot))) {
    return "Un conseiller va vous répondre dans quelques instants.";
  }

  return "Je suis un assistant virtuel . Posez-moi une question précise .";
};
