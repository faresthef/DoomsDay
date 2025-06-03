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
      const dayOfWeek = date.day(); // 0 = dimanche
      let symbol = '';

      switch (dayOfWeek) {
        case 1: symbol = '.'; break;       // lundi
        case 2: symbol = '..'; break;      // mardi
        case 3: symbol = '...'; break;     // mercredi
        case 4: symbol = ','; break;       // jeudi
        case 5: symbol = ',,'; break;      // vendredi
        case 6: symbol = ',,,'; break;     // samedi
        case 0: symbol = ''; break;        // dimanche
      }

      return {
        joursÉcoulés: dayjs().diff(date, 'day'),
        codeJour: symbol
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
    return res.status(204).send(); // No content, result is stored
  } else {
    latestResult = null;
    return res.status(400).send("Date invalide. Formats acceptés: xx/xx/xx, xx/xx/yyyy, xx-xx-xx, xx-xx-yyyy, jour mois année.");
  }
});

app.get('/final', (req, res) => {
  if (latestResult) {
    res.type('text/plain');
    return res.send(`${latestResult.joursÉcoulés}\n${latestResult.codeJour}`);
  } else {
    return res.send("");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur actif sur http://localhost:${PORT}`);
});
