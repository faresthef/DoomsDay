const express = require('express');
const cors = require('cors');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Fonction pour calculer le jour et les jours écoulés
function mentalism(dateStr, simpleOutput = false) {
  const formats = [
    'DD/MM/YYYY',
    'D/M/YYYY',
    'DD/MM/YY',
    'D/M/YY',
    'DD-MM-YYYY',
    'D-M-YYYY',
    'DD-MM-YY',
    'D-M-YY',
    'DD MMMM YYYY',
    'MMMM DD YYYY',
    'D MMMM YYYY',
    'MMMM D YYYY'
  ];

  let birthDate = null;
  for (const format of formats) {
    const parsed = dayjs(dateStr, format, true);
    if (parsed.isValid()) {
      birthDate = parsed;
      break;
    }
  }

  if (!birthDate) {
    return "Date invalide. Formats acceptés: xx/xx/xx, xx/xx/xxxx, xx-xx-xx, xx-xx-xxxx, jour mois année, mois jour année.";
  }

  const today = dayjs();
  const daysElapsed = today.diff(birthDate, 'day');
  const weekday = birthDate.format('dddd'); // nom du jour

  return simpleOutput
    ? `${weekday.toLowerCase()},${daysElapsed}`
    : `Vous êtes né un ${weekday}.\nNombre de jours écoulés depuis votre naissance : ${daysElapsed}`;
}

// ➤ Endpoint dynamique avec date
app.get('/birthdate/:date', (req, res) => {
  const input = decodeURIComponent(req.params.date);
  const result = mentalism(input);
  res.setHeader('Content-Type', 'text/plain');
  res.send(result);
});

// ➤ Web Polling + fallback + ?date= optionnel
app.get(['/birthdate/final', '/birthdate/final/'], (req, res) => {
  const date = req.query.date || "13 décembre 1986"; // valeur par défaut
  const result = mentalism(date, true);
  res.setHeader('Content-Type', 'text/plain');
  res.send(result);
});

// ➤ Lancer serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
