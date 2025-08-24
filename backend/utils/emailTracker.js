const { v4: uuidv4 } = require("uuid");

// Générer un lien de tracking unique
function generateTrackingLink(batchId, employeeId, originalUrl, baseUrl) {
  // Encoder les paramètres pour éviter les problèmes d'URL
  const encodedUrl = encodeURIComponent(originalUrl);

  // Retourner l'URL de tracking
  return `${baseUrl}/api/clicks/track?batchId=${batchId}&employeeId=${employeeId}&link=${encodedUrl}`;
}

// Générer des liens de tracking pour tous les employés d'un batch
function generateBatchTrackingLinks(batch, baseUrl) {
  const trackingLinks = {};

  batch.employees.forEach((employeeId) => {
    // Pour chaque lien dans le contenu de l'email, générer un lien de tracking
    // Ici, on suppose que vous avez une liste de liens à tracker
    const linksToTrack = [
      "https://votre-domaine.com/offre-speciale",
      "https://votre-domaine.com/telechargement",
    ];

    trackingLinks[employeeId] = linksToTrack.map((link) => ({
      original: link,
      tracked: generateTrackingLink(batch._id, employeeId, link, baseUrl),
    }));
  });

  return trackingLinks;
}

module.exports = {
  generateTrackingLink,
  generateBatchTrackingLinks,
};
