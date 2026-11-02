import type { Student, AttendanceRecord } from '../types';

const STUDENTS_KEY = 'attendance_students';
const ATTENDANCE_KEY = 'attendance_records';

export const storage = {
  // Students
  getStudents: (): Student[] => {
    const data = localStorage.getItem(STUDENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveStudents: (students: Student[]): void => {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  },

  addStudent: (student: Omit<Student, 'id' | 'createdAt'>): Student => {
    const students = storage.getStudents();
    const newStudent: Student = {
      ...student,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    students.push(newStudent);
    storage.saveStudents(students);
    return newStudent;
  },

  updateStudent: (id: string, updates: Partial<Student>): Student | null => {
    const students = storage.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    students[index] = { ...students[index], ...updates };
    storage.saveStudents(students);
    return students[index];
  },

  deleteStudent: (id: string): boolean => {
    const students = storage.getStudents();
    const filtered = students.filter(s => s.id !== id);
    if (filtered.length === students.length) return false;
    
    storage.saveStudents(filtered);
    // Also delete attendance records for this student
    const records = storage.getAttendance();
    const filteredRecords = records.filter(r => r.studentId !== id);
    storage.saveAttendance(filteredRecords);
    return true;
  },

  // Attendance
  getAttendance: (): AttendanceRecord[] => {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAttendance: (records: AttendanceRecord[]): void => {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  },

  markAttendance: (studentId: string, date: string, status: 'present' | 'absent' | 'late'): AttendanceRecord => {
    const records = storage.getAttendance();
    const existingIndex = records.findIndex(r => r.studentId === studentId && r.date === date);
    
    const record: AttendanceRecord = {
      id: existingIndex !== -1 ? records[existingIndex].id : crypto.randomUUID(),
      studentId,
      date,
      status,
      markedAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }

    storage.saveAttendance(records);
    return record;
  },

  getAttendanceByDate: (date: string): AttendanceRecord[] => {
    return storage.getAttendance().filter(r => r.date === date);
  },

  getAttendanceByStudent: (studentId: string): AttendanceRecord[] => {
    return storage.getAttendance().filter(r => r.studentId === studentId);
  },

  // Utility
  formatDate: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  getToday: (): string => {
    return storage.formatDate(new Date());
  },
};