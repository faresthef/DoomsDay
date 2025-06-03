const express = require('express');
const cors = require('cors');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
require('dayjs/locale/fr');

dayjs.extend(customParseFormat);
dayjs.locale('fr');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let latestResult = null;

function analyzeBirthdate(input) {
  const formats = [
    'DD/MM/YY', 'DD/MM/YYYY',
    'DD-MM-YY', 'DD-MM-YYYY',
    'D MMMM YYYY', 'MMMM D YYYY'
  ];

  for (const format of formats) {
    const date = dayjs(input, format, true);
    if (date.isValid()) {
      return {
        jourComplet: date.format('dddd'),     // ex : lundi
        jourAbrégé: date.format('dd').toLowerCase(), // ex : lu
        joursÉcoulés: dayjs().diff(date, 'day')
      };
    }
  }
  return null;
}

app.get('/birthdate/:date', (req, res) => {
  const input = decodeURIComponent(req.params.date);
  const result = analyzeBirthdate(input);

  if (result) {
    latestResult = result;
    return res.status(204).send();
  } else {
    latestResult = null;
    return res.status(400).send("Date invalide. Formats acceptés: xx/xx/xx, xx/xx/yyyy, xx-xx-xx, xx-xx-yyyy, jour mois année.");
  }
});

app.get('/final', (req, res) => {
  if (latestResult) {
    res.type('text/plain');
    return res.send(`${latestResult.joursÉcoulés}\n${latestResult.jourAbrégé}`);
  } else {
    return res.send("");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur actif sur http://localhost:${PORT}`);
});
