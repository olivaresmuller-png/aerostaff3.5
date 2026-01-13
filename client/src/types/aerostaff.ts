export type Department = 'S/TMBA' | 'S/TMBAA' | 'S/TMBAB' | 'S/TMBAC' | 'S/TMBAD' | 'S/TMBB' | 'S/TMBBA' | 'S/TMBBB' | 'S/TMBBC' | 'S/TMBBD';
export type Role = 'PM' | 'PS' | 'SrEng' | 'Eng';
export type LicenseType = 'B1' | 'B2' | 'B1/2' | 'C' | 'A' | null;

export type ShiftCode = 
  | 'Ea' | 'La' | 'M' | 'Ae' | 'AL' | 'e' | 'eA' | 'l' | 'LA'
  | 'TD' | 'V' | 'T' | 'S' | 'OFF' | '-'
  | 'FT' | 'BT' | 'SI' | 'SE' | 'Sn' | 'PD' | 'UL' | 'IW' | 'KO' | 't4' | '?'
  | 'PW' | 'PB' | 'IC' | 'AC' | 'AW' | 'MC' | 'MW' | 'FL' | 'KB' | 'HO' | 'ET' | 'FD'
  | 'PC' | 'PG' | 'PI' | 'PH' | 'PM' | 'PL' | 'TR';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type SpecialSkill = 'FUEL TANK' | 'Walliclean' | 'Forklift' | 'CYCLEAN' | 'Cobra' | 'Cee Bee' | 'OXY Hand' | 'ENTRY' | 'A32CFM Boro' | 'A32PW Boro' | 'A330RR Boro' | 'A340 Boro' | 'A350 Boro' | 'A220 Boro' | 'B777 Boro' | 'A220 RU' | 'A320 RU' | 'A320NEO RU' | 'A330 RU' | 'A343 RU' | 'A350 RU' | 'B777 RU';

export interface EmployeeSkill {
  aircraftType: string;
  license: LicenseType;
}

export interface Employee {
  id: string;
  initials: string;
  name: string;
  department: Department;
  role: Role;
  grade: number;
  skills: EmployeeSkill[];
  certifications: string[];
}

export interface DayAssignment {
  date: string;
  employeeId: string;
  shiftCode: ShiftCode;
}

export interface Aircraft {
  id: string;
  registration: string;
  type: string;
  company: string;
}

export interface DutyStatus {
  date: string;
  employeeId: string;
  onDuty: boolean;
}

export interface WorkRequirement {
  id: string;
  date: string;
  aircraftId: string;
  b1Required: number;
  b2Required: number;
  catARequired: number;
  b1Hours: number;
  b2Hours: number;
  catAHours: number;
  b1TotalHours: number;
  b2TotalHours: number;
  catATotalHours: number;
  priority: Priority;
  specialSkillsRequired: SpecialSkill[];
  boroscopeRequired: boolean;
  engineRunRequired: boolean;
}

export interface Assignment {
  id: string;
  date: string;
  aircraftId: string;
  employeeId: string;
  role: 'B1' | 'B2' | 'Cat A/Helper';
  isManualOverride: boolean;
}
