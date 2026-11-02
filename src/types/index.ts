export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  class: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedAt: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}

export interface DailyAttendance {
  date: string;
  students: {
    studentId: string;
    studentName: string;
    rollNumber: string;
    status: 'present' | 'absent' | 'late';
  }[];
}