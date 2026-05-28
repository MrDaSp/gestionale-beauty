// utils/legal-calculator.ts

// Festività fisse italiane (giorno, mese 0-indicizzato)
const italianHolidays = [
  { date: 1, month: 0 },   // Capodanno (1 Gennaio)
  { date: 6, month: 0 },   // Epifania (6 Gennaio)
  { date: 25, month: 3 },  // Festa della Liberazione (25 Aprile)
  { date: 1, month: 4 },   // Festa dei Lavoratori (1 Maggio)
  { date: 2, month: 5 },   // Festa della Repubblica (2 Giugno)
  { date: 15, month: 7 },  // Ferragosto (15 Agosto)
  { date: 1, month: 10 },  // Ognissanti (1 Novembre)
  { date: 8, month: 11 },  // Immacolata Concezione (8 Dicembre)
  { date: 25, month: 11 }, // Natale (25 Dicembre)
  { date: 26, month: 11 }, // Santo Stefano (26 Dicembre)
]

// Funzione helper per Pasqua e Pasquetta (Algoritmo di Gauss)
function getEasterMonday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  
  // Pasqua
  const easter = new Date(year, month, day)
  // Pasquetta (Lunedì dell'Angelo)
  const easterMonday = new Date(year, month, day + 1)
  return easterMonday
}

// Verifica se un giorno è festivo in Italia
export function isFestivo(date: Date): boolean {
  const day = date.getDay()
  // Domenica (0) o Sabato (6) nel civile spesso slitta a lunedì (dipende se atto scade sabato)
  // Nel processo civile la scadenza di sabato slitta al primo giorno lavorativo successivo (art. 155 c.p.c.)
  if (day === 0 || day === 6) return true

  const d = date.getDate()
  const m = date.getMonth()

  // Controllo festività fisse
  for (const holiday of italianHolidays) {
    if (holiday.date === d && holiday.month === m) return true
  }

  // Controllo Pasquetta
  const easterMonday = getEasterMonday(date.getFullYear())
  if (d === easterMonday.getDate() && m === easterMonday.getMonth()) return true

  return false
}

export interface TermineOptions {
  startDate: Date
  daysToAdd: number
  applySospensioneFeriale?: boolean // 1-31 Agosto
}

export function calcolaScadenza(options: TermineOptions): Date {
  let currentDate = new Date(options.startDate)
  let remainingDays = options.daysToAdd

  // Aggiungiamo i giorni uno ad uno per rispettare la sospensione feriale
  while (remainingDays > 0) {
    currentDate.setDate(currentDate.getDate() + 1)
    
    // Se cade in agosto e la sospensione feriale è attiva, non "consumiamo" il giorno
    if (options.applySospensioneFeriale && currentDate.getMonth() === 7) {
      continue // È Agosto (mese 7 in JS), saltiamo
    }
    
    remainingDays--
  }

  // Se il termine finale cade in un giorno festivo o sabato, slitta al primo giorno lavorativo successivo
  while (isFestivo(currentDate)) {
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return currentDate
}

// Modelli preimpostati (Template)
export const LegalTemplates = [
  {
    id: 'memorie_183',
    name: 'Memorie art. 183 c.6 c.p.c.',
    description: '30 gg (I memoria) + 30 gg (II memoria) + 20 gg (III memoria)',
    steps: [
      { name: 'I Memoria 183 c.6', daysToAdd: 30, type: 'scadenza' },
      { name: 'II Memoria 183 c.6', daysToAdd: 30, fromPrevious: true, type: 'scadenza' },
      { name: 'III Memoria 183 c.6', daysToAdd: 20, fromPrevious: true, type: 'scadenza' }
    ]
  },
  {
    id: 'comparse_conclusionali',
    name: 'Comparse Conclusionali e Repliche',
    description: '60 gg (Conclusionali) + 20 gg (Repliche)',
    steps: [
      { name: 'Comparse Conclusionali', daysToAdd: 60, type: 'scadenza' },
      { name: 'Memorie di Replica', daysToAdd: 20, fromPrevious: true, type: 'scadenza' }
    ]
  },
  {
    id: 'appello_ordinario',
    name: 'Appello (Termine Lungo)',
    description: '6 mesi dalla pubblicazione della sentenza',
    steps: [
      { name: 'Scadenza Termine Appello (Lungo)', daysToAdd: 180, type: 'scadenza' }
    ]
  }
]
