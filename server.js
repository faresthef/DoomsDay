const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const MONTHS_FR = {
  "janvier": 1,
  "février": 2,
  "fevrier": 2,
  "mars": 3,
  "avril": 4,
  "mai": 5,
  "juin": 6,
  "juillet": 7,
  "août": 8,
  "aout": 8,
  "septembre": 9,
  "octobre": 10,
  "novembre": 11,
  "décembre": 12,
  "decembre": 12,
};

function parseDateInput(input) {
  input = input.trim().toLowerCase();

  // Forme 1: xx/xx/xx ou xx/xx/xxxx
  const slashMatch = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    let day = parseInt(slashMatch[1], 10);
    let month = parseInt(slashMatch[2], 10);
    let year = parseInt(slashMatch[3], 10);
    if (year < 100) {
      // Assume 1900+year if < 100
      year += year > 30 ? 1900 : 2000; // simple 2-digit year fix
    }
    return new Date(year, month - 1, day);
  }

  // Forme 2: jour mois année  (ex: 13 decembre 1986)
  const dayMonthYearMatch = input.match(/^(\d{1,2})\s+([a-zéû]+)\s+(\d{4})$/);
  if (dayMonthYearMatch) {
    const day = parseInt(dayMonthYearMatch[1], 10);
    const monthName = dayMonthYearMatch[2];
    const year = parseInt(dayMonthYearMatch[3], 10);
    const month = MONTHS_FR[monthName];
    if (!month) return null;
    return new Date(year, month - 1, day);
  }

  // Forme 3: mois jour année (ex: decembre 13 1986)
  const monthDayYearMatch = input.match(/^([a-zéû]+)\s+(\d{1,2})\s+(\d{4})$/);
  if (monthDayYearMatch) {
    const monthName = monthDayYearMatch[1];
    const day = parseInt(monthDayYearMatch[2], 10);
    const year = parseInt(monthDayYearMatch[3], 10);
    const month = MONTHS_FR[monthName];
    if (!month) return null;
    return new Date(year, month - 1, day);
  }

  // Date invalide ou format non supporté
  return null;
}

function getDayName(date) {
  const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  return days[date.getDay()];
}

function daysBetween(d1, d2) {
  const oneDayMs = 1000 * 60 * 60 * 24;
  // Troncature aux dates pour éviter souci heure d'été
  const dt1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const dt2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  const diffMs = dt2 - dt1;
  return Math.floor(diffMs / oneDayMs);
}

function mentalism(dateStr) {
  const birthDate = parseDateInput(dateStr);
  if (!birthDate) return "Date invalide. Formats acceptés: xx/xx/xx, xx/xx/xxxx, jour mois année, mois jour année.";

  const dayName = getDayName(birthDate);
  const today = new Date();
  const daysElapsed = daysBetween(birthDate, today);

  return `Vous êtes né un ${dayName}.\nNombre de jours écoulés depuis votre naissance : ${daysElapsed}`;
}

// Web polling endpoint avec paramètre date
app.get('/birthdate/:date', (req, res) => {
  const dateStr = decodeURIComponent(req.params.date);
  const result = mentalism(dateStr);
  res.setHeader('Content-Type', 'text/plain');
  res.send(result);
});

// Endpoint test
app.get('/final', (req, res) => {
  const result = mentalism("13 decembre 1986");
  res.setHeader('Content-Type', 'text/plain');
  res.send(result);
});

app.listen(PORT, () => {
  console.log(`✅ Serveur mentalisme actif sur http://localhost:${PORT}`);
});
