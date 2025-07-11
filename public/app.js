window.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('main-content');
  try {
    const response = await fetch('home.html');
    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = '<p class="text-red-500">Erreur de chargement de la page d’accueil.</p>';
    console.error('Erreur chargement home.html :', error);
  }
});
