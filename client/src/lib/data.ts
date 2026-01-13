import {
  Department,
  Role,
  LicenseType,
  ShiftCode,
  EmployeeSkill,
  Employee,
  DayAssignment
} from '../types/aerostaff';

export type { Department, Role, LicenseType, ShiftCode, EmployeeSkill, Employee, DayAssignment };

export const SHIFT_CODES: { code: ShiftCode; label: string; hours: number; category: 'duty' | 'off' }[] = [
  { code: 'Ea', label: 'Early', hours: 8, category: 'duty' },
  { code: 'La', label: 'Late', hours: 8, category: 'duty' },
  { code: 'M', label: 'Middle', hours: 8, category: 'duty' },
  { code: 'Ae', label: 'Afternoon-Early', hours: 8, category: 'duty' },
  { code: 'AL', label: 'Afternoon-Late', hours: 8, category: 'duty' },
  { code: 'e', label: 'Extended Early', hours: 10, category: 'duty' },
  { code: 'eA', label: 'Extended Alt', hours: 10, category: 'duty' },
  { code: 'l', label: 'Late Extended', hours: 10, category: 'duty' },
  { code: 'LA', label: 'Late Alt', hours: 8, category: 'duty' },
  { code: 'TD', label: 'Part Time Day', hours: 8, category: 'duty' },
  { code: 'HO', label: 'Home Office', hours: 8, category: 'duty' },
  { code: 'FT', label: 'Feiertag', hours: 0, category: 'off' },
  { code: 'BT', label: 'Business Trip', hours: 8, category: 'duty' },
  { code: 'ET', label: 'Educational Trip', hours: 8, category: 'duty' },
  { code: 'FD', label: 'Flight Duty', hours: 8, category: 'duty' },
  { code: 'SI', label: 'School Internal', hours: 8, category: 'duty' },
  { code: 'SE', label: 'School External', hours: 8, category: 'duty' },
  { code: 'Sn', label: 'School Night', hours: 8, category: 'duty' },
  { code: 'TR', label: 'Training', hours: 8, category: 'duty' },
  { code: 'V', label: 'Vacation', hours: 0, category: 'off' },
  { code: 'T', label: 'Training', hours: 0, category: 'off' },
  { code: 'S', label: 'Sick w/ Cert', hours: 0, category: 'off' },
  { code: 'IC', label: 'Sick w/ Cert', hours: 0, category: 'off' },
  { code: 'IW', label: 'Sick w/o Cert', hours: 0, category: 'off' },
  { code: 'AC', label: 'Accident w/ Cert', hours: 0, category: 'off' },
  { code: 'AW', label: 'Accident w/o Cert', hours: 0, category: 'off' },
  { code: 'MC', label: 'Military w/ EO', hours: 0, category: 'off' },
  { code: 'MW', label: 'Military w/o EO', hours: 0, category: 'off' },
  { code: 'PD', label: 'Death Leave', hours: 0, category: 'off' },
  { code: 'PG', label: 'Death (In-Law)', hours: 0, category: 'off' },
  { code: 'PI', label: 'Death (Sibling)', hours: 0, category: 'off' },
  { code: 'PW', label: 'Wedding Leave', hours: 0, category: 'off' },
  { code: 'PC', label: 'Child Wedding', hours: 0, category: 'off' },
  { code: 'PB', label: 'Birth Leave', hours: 0, category: 'off' },
  { code: 'PH', label: 'Moving (>100km)', hours: 0, category: 'off' },
  { code: 'PM', label: 'Moving (1 Day)', hours: 0, category: 'off' },
  { code: 'PL', label: 'Paid Leave', hours: 0, category: 'off' },
  { code: 'UL', label: 'Unpaid Leave', hours: 0, category: 'off' },
  { code: 'KO', label: 'Komp. Overtime', hours: 0, category: 'off' },
  { code: 'KB', label: 'Komp. Timebonus', hours: 0, category: 'off' },
  { code: 'FL', label: 'Komp. Flextime', hours: 0, category: 'off' },
  { code: 't4', label: 'Training 4H', hours: 4, category: 'duty' },
  { code: '?', label: 'Unknown', hours: 0, category: 'off' },
  { code: '-', label: 'Off Day', hours: 0, category: 'off' },
  { code: 'OFF', label: 'Off Day', hours: 0, category: 'off' },
];

export const AIRCRAFT_TYPES = ['B777', 'A343', 'A220', 'A330 RR', 'A350', 'A320 NEO', 'A320 CF', 'A321 NEO', 'A321RR'];

// Aircraft license compatibility rules:
// - A320 NEO license can repair A321RR
// - A321 NEO license can repair A321RR
// - A320 (NEO/CF) license can repair A321 variants
export const AIRCRAFT_COMPATIBILITY: Record<string, string[]> = {
  'A320 NEO': ['A320 NEO', 'A321RR', 'A321 NEO'],
  'A320 CF': ['A320 CF', 'A321RR'],
  'A321 NEO': ['A321 NEO', 'A321RR'],
  'A321RR': ['A321RR'],
  'B777': ['B777'],
  'A343': ['A343'],
  'A220': ['A220'],
  'A330 RR': ['A330 RR'],
  'A350': ['A350'],
};

// Check if an employee with a given license can work on a specific aircraft type
export function canWorkOnAircraft(employeeLicenseType: string, targetAircraftType: string): boolean {
  const compatibleTypes = AIRCRAFT_COMPATIBILITY[employeeLicenseType];
  if (compatibleTypes) {
    return compatibleTypes.includes(targetAircraftType);
  }
  // Direct match fallback
  return employeeLicenseType === targetAircraftType;
}

export const SPECIAL_SKILLS = [
  'FUEL TANK',
  'Walliclean',
  'Forklift',
  'CYCLEAN',
  'Cobra',
  'Cee Bee',
  'OXY Hand',
  'ENTRY',
  'A32CFM Boro',
  'A32PW Boro',
  'A330RR Boro',
  'A340 Boro',
  'A350 Boro',
  'A220 Boro',
  'B777 Boro',
  'A220 RU',
  'A320 RU',
  'A320NEO RU',
  'A330 RU',
  'A343 RU',
  'A350 RU',
  'B777 RU',
];

export const EMPLOYEE_SORT_ORDER = [
  'THRU', 'MELM', 'YCCR', 'TIMJ', 'HUAB', 'YYRJ', 'MECU', 'LECN', 'LCLE', 'HUDM',
  'ARUZ', 'KRZE', 'LSIE', 'AAUL', 'WINY', 'SOER', 'ERIZ', 'BHAE', 'DALL', 'GBRU',
  'LUPR', 'RREN', 'GNET', 'TOKR', 'COSM', 'FILM', 'PAAO', 'LUCP', 'MF', 'NATS',
  'MZIM', 'TIML', 'OLCR', 'WEZE', 'JAWE', 'KRAF', 'RUAC', 'SAEF', 'LABB', 'RDAR',
  'ARNG', 'MCOS', 'THNA', 'JUTI', 'GERO', 'MURB', 'BOGO', 'EGGL', 'RULO', 'RPAS',
  'DMIA', 'ENRL', 'ATET', 'DETH', 'POCS', 'YCEA', 'FREY', 'GANT', 'GUIM', 'OLSE',
  'TOKA', 'ZIMM', 'BATT', 'SPEC', 'THAN', 'MIES', 'BONO', 'FILI', 'GISL', 'DACO'
];

export const initialEmployees: Employee[] = [
  {
    id: '1', initials: 'THRU', name: 'Thoegersen, Rune', department: 'S/TMBA', role: 'PM', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1/2' }, { aircraftType: 'A343', license: 'B1/2' }, { aircraftType: 'A220', license: 'B1/2' },
      { aircraftType: 'A330 RR', license: 'B1/2' }, { aircraftType: 'A350', license: 'B1/2' }, { aircraftType: 'A320 NEO', license: 'B1/2' },
      { aircraftType: 'A320 CF', license: 'B1/2' }
    ], certifications: ['Boro ALL', 'Cee Bee', 'OXY Hand', 'FUEL TANK', 'CYCLEAN', 'ENTRY']
  },
  {
    id: '2', initials: 'MELM', name: 'Meyer, Melchior', department: 'S/TMBAA', role: 'PS', grade: 0, skills: [
      { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A220', license: 'B1' }, { aircraftType: 'A330 RR', license: 'B1' },
      { aircraftType: 'A320 NEO', license: 'B1' }, { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['777 RU', '343 RU', '32S RU', '32 RU PW', 'CS RU', 'A350 RU', 'FUEL TANK']
  },
  {
    id: '3', initials: 'YCCR', name: 'Calabrese, Crescenzio', department: 'S/TMBAA', role: 'SrEng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1' }, { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A220', license: 'B1' },
      { aircraftType: 'A330 RR', license: 'B1' }, { aircraftType: 'A350', license: 'B1' }, { aircraftType: 'A320 NEO', license: 'B1' },
      { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['777 RU', '343 RU', '32S RU', '32 RU PW', 'A350 RU', 'Boro ALL', 'FUEL TANK']
  },
  {
    id: '4', initials: 'HUAB', name: 'Hubschmid, Fabian', department: 'S/TMBAA', role: 'SrEng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1/2' }, { aircraftType: 'A343', license: 'B1/2' }, { aircraftType: 'A220', license: 'B1/2' },
      { aircraftType: 'A330 RR', license: 'B1/2' }, { aircraftType: 'A350', license: 'B1/2' }, { aircraftType: 'A320 NEO', license: 'B1/2' },
      { aircraftType: 'A320 CF', license: 'B1/2' }
    ], certifications: ['32S RU', '32 RU PW', 'Boro ALL', 'Cee Bee', 'ENTRY']
  },
  {
    id: '5', initials: 'TIMJ', name: 'Simon, Tim', department: 'S/TMBAA', role: 'SrEng', grade: 100, skills: [
      { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: []
  },
  {
    id: '6', initials: 'LCLE', name: 'Clerici, Luca', department: 'S/TMBAA', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1' }, { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A320 NEO', license: 'B1' },
      { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: []
  },
  {
    id: '7', initials: 'EGGL', name: 'Eggenberger, Lars', department: 'S/TMBAA', role: 'Eng', grade: 50, skills: [
      { aircraftType: 'A220', license: 'A' }, { aircraftType: 'A330 RR', license: 'A' }
    ], certifications: []
  },
  {
    id: '8', initials: 'HUDM', name: 'Hudec, Marek', department: 'S/TMBAA', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: []
  },
  { id: '9', initials: 'KRZE', name: 'Krenz, Sarah', department: 'S/TMBAA', role: 'Eng', grade: 50, skills: [], certifications: [] },
  { id: '10', initials: 'LECN', name: 'Lechner, Nico', department: 'S/TMBAA', role: 'Eng', grade: 100, skills: [], certifications: [] },
  {
    id: '11', initials: 'MECU', name: 'Mercurio, Franco', department: 'S/TMBAA', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1' }, { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A220', license: 'B1' },
      { aircraftType: 'A330 RR', license: 'B1' }, { aircraftType: 'A350', license: 'B1' }, { aircraftType: 'A320 NEO', license: 'B1' },
      { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['32S RU', 'ENTRY']
  },
  {
    id: '12', initials: 'YYRJ', name: 'Raschle, Jan', department: 'S/TMBAA', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A220', license: 'B1' }, { aircraftType: 'A330 RR', license: 'B1' },
      { aircraftType: 'A350', license: 'B1' }, { aircraftType: 'A320 NEO', license: 'B1' }, { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['32S RU', 'Cee Bee']
  },
  { id: '13', initials: 'AAUL', name: 'Renault, Andrea', department: 'S/TMBAA', role: 'Eng', grade: 50, skills: [], certifications: [] },
  { id: '14', initials: 'ARUZ', name: 'Ruzaj, Arjan', department: 'S/TMBAA', role: 'Eng', grade: 100, skills: [], certifications: [] },
  {
    id: '15', initials: 'SOER', name: 'Sommer, Stefan', department: 'S/TMBAA', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'A343', license: 'B2' }, { aircraftType: 'A220', license: 'B2' }, { aircraftType: 'A330 RR', license: 'B2' },
      { aircraftType: 'A320 NEO', license: 'B2' }, { aircraftType: 'A320 CF', license: 'B2' }
    ], certifications: []
  },
  { id: '16', initials: 'LSIE', name: 'Siegle, Luca', department: 'S/TMBAA', role: 'Eng', grade: 50, skills: [], certifications: [] },
  { id: '17', initials: 'WINY', name: 'Winkler, Yves', department: 'S/TMBAA', role: 'Eng', grade: 0, skills: [], certifications: [] },
  {
    id: '18', initials: 'ERIZ', name: 'Zängerle, Eric', department: 'S/TMBAA', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B2' }, { aircraftType: 'A343', license: 'B2' }
    ], certifications: ['ENTRY']
  },
  {
    id: '19', initials: 'BHAE', name: 'Bähler, Michael', department: 'S/TMBAB', role: 'PS', grade: 0, skills: [
      { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A220', license: 'B1' }, { aircraftType: 'A330 RR', license: 'B1' },
      { aircraftType: 'A350', license: 'B1' }
    ], certifications: ['A350 RU', 'ENTRY']
  },
  {
    id: '20', initials: 'GBRU', name: 'Bruni, Guido', department: 'S/TMBAB', role: 'SrEng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1' }, { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A220', license: 'B1' },
      { aircraftType: 'A330 RR', license: 'B1' }, { aircraftType: 'A320 NEO', license: 'B1' }, { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['777 RU', '32S RU', 'A350 RU']
  },
  {
    id: '21', initials: 'DALL', name: 'Müller, Daniel', department: 'S/TMBAB', role: 'SrEng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'C' }, { aircraftType: 'A343', license: 'C' }, { aircraftType: 'A220', license: 'C' },
      { aircraftType: 'A330 RR', license: 'B1' }, { aircraftType: 'A350', license: 'C' }, { aircraftType: 'A320 NEO', license: 'C' },
      { aircraftType: 'A320 CF', license: 'C' }
    ], certifications: ['777 RU', '343 RU', '32S RU', '32 RU PW', 'CS RU', 'A350 RU', 'Boro ALL']
  },
  {
    id: '22', initials: 'LUPR', name: 'Praia de Sousa, Luis', department: 'S/TMBAB', role: 'SrEng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1/2' }, { aircraftType: 'A343', license: 'B1/2' }, { aircraftType: 'A320 NEO', license: 'B1/2' },
      { aircraftType: 'A320 CF', license: 'B1/2' }
    ], certifications: []
  },
  {
    id: '23', initials: 'BOGO', name: 'Borgo, Davide', department: 'S/TMBAB', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A320 NEO', license: 'B1' }, { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['Cee Bee']
  },
  {
    id: '24', initials: 'YCEA', name: 'Ceramella, Aaron', department: 'S/TMBAB', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1' }, { aircraftType: 'A330 RR', license: 'B1' }, { aircraftType: 'A350', license: 'B1' }
    ], certifications: ['777 RU']
  },
  { id: '25', initials: 'FILM', name: 'Filipcic, Matej', department: 'S/TMBAB', role: 'Eng', grade: 100, skills: [], certifications: [] },
  { id: '26', initials: 'FREY', name: 'Frey, Martin', department: 'S/TMBAB', role: 'Eng', grade: 100, skills: [], certifications: [] },
  { id: '27', initials: 'GANT', name: 'Gantner, Philipp', department: 'S/TMBAB', role: 'Eng', grade: 100, skills: [], certifications: [] },
  { id: '28', initials: 'GUIM', name: 'Guimaraes Lisboa Costa, Andre', department: 'S/TMBAB', role: 'Eng', grade: 100, skills: [], certifications: [] },
  { id: '29', initials: 'RULO', name: 'Loi, Ruben', department: 'S/TMBAB', role: 'Eng', grade: 0, skills: [], certifications: [] },
  { id: '30', initials: 'TIML', name: 'Müller, Tim', department: 'S/TMBAB', role: 'Eng', grade: 50, skills: [], certifications: [] },
  {
    id: '31', initials: 'NATS', name: 'Natusch, Mark', department: 'S/TMBAB', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B2' }, { aircraftType: 'A343', license: 'B2' }, { aircraftType: 'A220', license: 'B2' },
      { aircraftType: 'A330 RR', license: 'B2' }, { aircraftType: 'A350', license: 'B2' }, { aircraftType: 'A320 NEO', license: 'B2' },
      { aircraftType: 'A320 CF', license: 'B2' }
    ], certifications: []
  },
  { id: '32', initials: 'OLSE', name: 'Olsen, Kenneth', department: 'S/TMBAB', role: 'Eng', grade: 100, skills: [], certifications: [] },
  { id: '33', initials: 'LUCP', name: 'Pfeiffer, Luca', department: 'S/TMBAB', role: 'Eng', grade: 100, skills: [], certifications: [] },
  {
    id: '34', initials: 'RREN', name: 'Rindlisbacher, René', department: 'S/TMBAB', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1' }, { aircraftType: 'A330 RR', license: 'B1' }, { aircraftType: 'A350', license: 'B1' },
      { aircraftType: 'A320 NEO', license: 'B1' }, { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: []
  },
  { id: '35', initials: 'TOKA', name: 'Tokarczyk, Adam', department: 'S/TMBAB', role: 'Eng', grade: 100, skills: [], certifications: [] },
  { id: '36', initials: 'MZIM', name: 'Zimmermann, Mario', department: 'S/TMBAB', role: 'Eng', grade: 100, skills: [], certifications: [] },
  {
    id: '37', initials: 'OLCR', name: 'Olivares, Cristian', department: 'S/TMBAC', role: 'PS', grade: 0, skills: [
      { aircraftType: 'B777', license: 'B1' }, { aircraftType: 'A343', license: 'B1' }
    ], certifications: []
  },
  {
    id: '38', initials: 'WEZE', name: 'Fountain, Richard', department: 'S/TMBAC', role: 'SrEng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1/2' }, { aircraftType: 'A343', license: 'B1/2' }, { aircraftType: 'A220', license: 'B1' },
      { aircraftType: 'A330 RR', license: 'B1' }, { aircraftType: 'A350', license: 'B1/2' }, { aircraftType: 'A320 NEO', license: 'B1' },
      { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['777 RU', '343 RU', '32S RU', '32 RU PW', 'A350 RU', 'Cee Bee']
  },
  {
    id: '39', initials: 'KRAF', name: 'Keller, Raphael', department: 'S/TMBAC', role: 'SrEng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1' }, { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A220', license: 'B1' },
      { aircraftType: 'A330 RR', license: 'B1' }, { aircraftType: 'A350', license: 'B1' }, { aircraftType: 'A320 NEO', license: 'B1' },
      { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['32S RU', '32 RU PW', 'ENTRY']
  },
  {
    id: '40', initials: 'JAWE', name: 'Schäfer, Jan Werner', department: 'S/TMBAC', role: 'SrEng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1' }, { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A220', license: 'B1' },
      { aircraftType: 'A330 RR', license: 'B1' }, { aircraftType: 'A350', license: 'B1' }, { aircraftType: 'A320 NEO', license: 'B1' },
      { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['777 RU', '32 RU PW', 'Boro ALL', 'Cee Bee', 'ENTRY']
  },
  {
    id: '41', initials: 'RUAC', name: 'Ackermann, Rudolf', department: 'S/TMBAC', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1' }, { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A220', license: 'B1' },
      { aircraftType: 'A330 RR', license: 'B1' }, { aircraftType: 'A350', license: 'B1' }, { aircraftType: 'A320 NEO', license: 'B1' },
      { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['777 RU', '343 RU', '32S RU', '32 RU PW', 'CS RU', 'A350 RU', 'Boro ALL']
  },
  { id: '42', initials: 'BONO', name: 'Bonomo, Marco', department: 'S/TMBAC', role: 'Eng', grade: 100, skills: [], certifications: [] },
  { id: '43', initials: 'DACO', name: 'Da Costa Paes, Fabio', department: 'S/TMBAC', role: 'Eng', grade: 100, skills: [], certifications: [] },
  {
    id: '44', initials: 'GERO', name: 'Generali, Roberto', department: 'S/TMBAC', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B2' }, { aircraftType: 'A343', license: 'B2' }, { aircraftType: 'A220', license: 'B2' },
      { aircraftType: 'A330 RR', license: 'B2' }, { aircraftType: 'A320 NEO', license: 'B2' }, { aircraftType: 'A320 CF', license: 'B2' }
    ], certifications: []
  },
  { id: '45', initials: 'GISL', name: 'Gíslason, Unnar Örn', department: 'S/TMBAC', role: 'Eng', grade: 100, skills: [], certifications: [] },
  {
    id: '46', initials: 'JUTI', name: 'Görber, Justin', department: 'S/TMBAC', role: 'Eng', grade: 50, skills: [
      { aircraftType: 'A330 RR', license: 'A' }
    ], certifications: ['Cee Bee']
  },
  {
    id: '47', initials: 'LABB', name: 'Labiad, Abdessamad', department: 'S/TMBAC', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A320 NEO', license: 'B1' }, { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['32S RU', 'Cee Bee']
  },
  {
    id: '48', initials: 'ENRL', name: 'Leimbacher, Enrico Paul', department: 'S/TMBAC', role: 'Eng', grade: 50, skills: [
      { aircraftType: 'A343', license: 'A' }, { aircraftType: 'A220', license: 'A' }
    ], certifications: []
  },
  { id: '49', initials: 'DMIA', name: 'Patino Martinez, Aldo Damian', department: 'S/TMBAC', role: 'Eng', grade: 0, skills: [], certifications: [] },
  {
    id: '50', initials: 'RPAS', name: 'Raniolo, Pasquale', department: 'S/TMBAC', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1' }, { aircraftType: 'A343', license: 'B1' }, { aircraftType: 'A350', license: 'B1' },
      { aircraftType: 'A320 NEO', license: 'B1' }, { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['Cee Bee']
  },
  {
    id: '51', initials: 'RDAR', name: 'Rosa Blasco, Dario', department: 'S/TMBAC', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'B777', license: 'B1/2' }, { aircraftType: 'A320 CF', license: 'B1/2' }
    ], certifications: []
  },
  {
    id: '52', initials: 'SAEF', name: 'Saredi, Stefano', department: 'S/TMBAC', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'A220', license: 'B1' }, { aircraftType: 'A330 RR', license: 'B1' }, { aircraftType: 'A320 NEO', license: 'B1' },
      { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['777 RU', '343 RU', '32S RU', 'FUEL TANK']
  },
  { id: '53', initials: 'THNA', name: 'Thalmann, Nando', department: 'S/TMBAC', role: 'Eng', grade: 0, skills: [], certifications: [] },
  {
    id: '54', initials: 'MURB', name: 'Urben, Marcel', department: 'S/TMBAC', role: 'Eng', grade: 100, skills: [
      { aircraftType: 'A220', license: 'B1' }, { aircraftType: 'A330 RR', license: 'B1' }, { aircraftType: 'A320 CF', license: 'B1' }
    ], certifications: ['343 RU', '32S RU']
  },
  { id: '55', initials: 'BATT', name: 'Battistella, Nicola', department: 'S/TMBBA', role: 'Eng', grade: 100, skills: [], certifications: [] },
  { id: '56', initials: 'SPEC', name: 'Speicher, Christian', department: 'S/TMBBA', role: 'Eng', grade: 100, skills: [], certifications: [] },
  { id: '57', initials: 'ATET', name: 'Stettler, Anton', department: 'S/TMBBA', role: 'Eng', grade: 100, skills: [], certifications: [] },
  { id: '58', initials: 'DETH', name: 'Dempsey, Thomas', department: 'S/TMBBB', role: 'Eng', grade: 0, skills: [], certifications: [] },
  { id: '59', initials: 'POCS', name: 'Pocs, Christian', department: 'S/TMBBB', role: 'Eng', grade: 0, skills: [], certifications: [] },
  { id: '60', initials: 'THAN', name: 'Thanos, Panagiotis', department: 'S/TMBBC', role: 'Eng', grade: 100, skills: [], certifications: [] },
  { id: '61', initials: 'MIES', name: 'Miesch, Stefan', department: 'S/TMBBC', role: 'Eng', grade: 100, skills: [], certifications: [] },
];

export function getShiftHours(code: ShiftCode): number {
  const shift = SHIFT_CODES.find(s => s.code === code);
  return shift?.hours ?? 0;
}

export function isOnDuty(code: ShiftCode): boolean {
  const shift = SHIFT_CODES.find(s => s.code === code);
  return shift?.category === 'duty';
}

export function calculateManhours(employees: Employee[], assignments: DayAssignment[], date: string): number {
  return assignments
    .filter(a => a.date === date)
    .reduce((total, assignment) => {
      const employee = employees.find(e => e.id === assignment.employeeId);
      if (!employee) return total;
      const hours = getShiftHours(assignment.shiftCode);
      return total + (hours * (employee.grade / 100));
    }, 0);
}

export function calculateWeeklyManhours(employees: Employee[], assignments: DayAssignment[], weekDates: string[]): number {
  return weekDates.reduce((total, date) => total + calculateManhours(employees, assignments, date), 0);
}

export function countLicensesByType(
  employees: Employee[],
  assignments: DayAssignment[],
  date: string,
  aircraftType: string
): { b1: number; b2: number; b12: number } {
  const onDutyEmployees = assignments
    .filter(a => a.date === date && isOnDuty(a.shiftCode))
    .map(a => employees.find(e => e.id === a.employeeId))
    .filter((e): e is Employee => e !== undefined);

  return onDutyEmployees.reduce(
    (counts, employee) => {
      const skill = employee.skills.find(s => s.aircraftType === aircraftType);
      if (skill) {
        if (skill.license === 'B1') counts.b1++;
        else if (skill.license === 'B2') counts.b2++;
        else if (skill.license === 'B1/2') counts.b12++;
      }
      return counts;
    },
    { b1: 0, b2: 0, b12: 0 }
  );
}
