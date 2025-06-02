const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Pour pouvoir utiliser les dates
const { DateTime } = require('luxon');

// Activer CORS
app.use(cors());

// Liste des mois en français pour détection
const moisFrancais = {
  janvier: 'January',
  février: 'February',
  fevrier: 'February',
  mars: 'March',
  avril: 'April',
  mai: 'May',
  juin: 'June',
  juillet: 'July',
  août: 'August',
  aout: 'August',
  septembre: 'September',
  octobre: 'October',
  novembre: 'November',
  décembre: 'December',
  decembre: 'December'
};

// Fonction pour formater la ligne
function formatLine(label, value) {
  const trimmed = label.toUpperCase().slice(0, 18).padEnd(19, ' ');
  return `${trimmed}: ${value}`;
}

// Fonction principale de mentalisme
function mentalism(inputDateStr) {
  if (!inputDateStr || typeof inputDateStr !== 'string') {
    return "ERREUR : Format invalide.";
  }

  let parsedDate = null;

  // Nettoyage
  let clean = inputDateStr.toLowerCase().trim();

  // Remplacement mois français par anglais
  for (const [fr, en] of Object.entries(moisFrancais)) {
    if (clean.includes(fr)) {
      clean = clean.replace(fr, en);
    }
  }

  // Essayer plusieurs formats
  const formats = [
    'dd/MM/yyyy',
    'dd/MM/yy',
    'd MMMM yyyy',
    'MMMM d yyyy',
    'd MMM yyyy',
    'MMMM d yy'
  ];

  for (const fmt of formats) {
    const dt = DateTime.fromFormat(clean, fmt, { locale: 'fr' });
    if (dt.isValid) {
      parsedDate = dt;
      break;
    }
  }

  if (!parsedDate || !parsedDate.isValid) {
    return "ERREUR : Date non reconnue.";
  }

  // Date actuelle fixée pour cohérence
  const today = DateTime.fromISO('2025-06-02');

  const dayName = parsedDate.setLocale('fr').toFormat('cccc'); // Jour de la semaine en français
  const daysElapsed = today.diff(parsedDate, 'days').days;

  const result = [
    "BIRTHDAY.SI7R.MENTALISM",
    formatLine("Jour de naissance", dayName),
    formatLine("Jours écoulés", Math.floor(daysElapsed))
  ];

  return result.join('\n');
}

// Endpoint web : /birthdate/:input
app.get('/birthdate/:input', (req, res) => {
  const input = decodeURIComponent(req.params.input);
  const result = mentalism(input);
  res.setHeader('Content-Type', 'text/plain');
  res.send(result);
});

// Exemple de test pour 27 février 1958
app.get('/test', (req, res) => {
  const result = mentalism("27 février 1958");
  res.setHeader('Content-Type', 'text/plain');
  res.send(result);
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur d'anniversaire mentalisme actif sur http://localhost:${PORT}`);
});
