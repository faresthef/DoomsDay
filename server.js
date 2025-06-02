const express = require('express');
const cors = require('cors');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const localeFr = require('dayjs/locale/fr');

dayjs.extend(customParseFormat);
dayjs.locale(localeFr);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let latestResult = null;

// Fonction principale
function analyzeBirthdate(inputDateStr) {
  const formats = [
    'DD/MM/YY', 'DD/MM/YYYY',
    'DD-MM-YY', 'DD-MM-YYYY',
    'D MMMM YYYY', 'MMMM D YYYY'
  ];

  for (const format of formats) {
    const date = dayjs(inputDateStr, format, true);
    if (date.isValid()) {
      const jour = date.format('dddd'); // jour en français
      const joursÉcoulés = dayjs().diff(date, 'day');

      return [
        `Vous êtes né un ${jour}.`,
        `Il y a exactement ${joursÉcoulés} jours.`
      ].join('\n');
    }
  }

  return null;
}

// Endpoint de soumission : /birthdate/:date
app.get('/birthdate/:date', (req, res) => {
  const input = decodeURIComponent(req.params.date);
  const result = analyzeBirthdate(input);

  if (result) {
    latestResult = result;
    return res.status(204).send(); // Pas de contenu, on stocke juste
  } else {
    return res.status(400).send("Date invalide. Formats acceptés: xx/xx/xx, xx/xx/yyyy, xx-xx-xx, xx-xx-yyyy, jour mois année.");
  }
});

// Endpoint d'affichage final
app.get('/final', (req, res) => {
  if (latestResult) {
    res.type('text/plain');
    return res.send(latestResult);
  } else {
    return res.send("");
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur actif sur http://localhost:${PORT}`);
});
