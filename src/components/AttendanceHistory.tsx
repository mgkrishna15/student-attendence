import React, { useState, useMemo } from 'react';
import type { Student, AttendanceRecord } from '../types';

interface AttendanceHistoryProps {
  students: Student[];
  attendance: AttendanceRecord[];
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ students, attendance }) => {
  const [viewMode, setViewMode] = useState<'date' | 'student'>('date');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  const classes = useMemo(() => {
    const uniqueClasses = [...new Set(students.map(s => s.class))];
    return ['all', ...uniqueClasses];
  }, [students]);

  const getDatesWithAttendance = useMemo(() => {
    const dates = [...new Set(attendance.map(r => r.date))];
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [attendance]);

  const getFilteredAttendance = useMemo(() => {
    let filtered = [...attendance];

    if (filterClass !== 'all') {
      const classStudentIds = students
        .filter(s => s.class === filterClass)
        .map(s => s.id);
      filtered = filtered.filter(r => classStudentIds.includes(r.studentId));
    }

    if (viewMode === 'date' && selectedDate) {
      filtered = filtered.filter(r => r.date === selectedDate);
    } else if (viewMode === 'student' && selectedStudent) {
      filtered = filtered.filter(r => r.studentId === selectedStudent);
    }

    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [attendance, filterClass, viewMode, selectedDate, selectedStudent, students]);

  const studentStats = useMemo(() => {
    if (!selectedStudent) return null;
    
    const studentRecords = attendance.filter(r => r.studentId === selectedStudent);
    const totalDays = studentRecords.length;
    const presentDays = studentRecords.filter(r => r.status === 'present').length;
    const absentDays = studentRecords.filter(r => r.status === 'absent').length;
    const lateDays = studentRecords.filter(r => r.status === 'late').length;
    const attendancePercentage = totalDays > 0 
      ? Math.round(((presentDays + lateDays) / totalDays) * 100) 
      : 0;

    return { totalDays, presentDays, absentDays, lateDays, attendancePercentage };
  }, [attendance, selectedStudent]);

  const formatDateString = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Unknown';
  };

  return (
    <div className="attendance-history">
      <div className="history-header">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'date' ? 'active' : ''}`}
            onClick={() => setViewMode('date')}
          >
            By Date
          </button>
          <button
            className={`toggle-btn ${viewMode === 'student' ? 'active' : ''}`}
            onClick={() => setViewMode('student')}
          >
            By Student
          </button>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Class:</label>
            <select 
              value={filterClass} 
              onChange={(e) => setFilterClass(e.target.value)}
            >
              {classes.map(c => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Classes' : c}
                </option>
              ))}
            </select>
          </div>

          {viewMode === 'date' ? (
            <div className="filter-group">
              <label>Date:</label>
              <select 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">All Dates</option>
                {getDatesWithAttendance.map(date => (
                  <option key={date} value={date}>
                    {formatDateString(date)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="filter-group">
              <label>Student:</label>
              <select 
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} (#{student.rollNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {viewMode === 'student' && selectedStudent && studentStats && (
        <div className="student-stats-card">
          <h4>Attendance Statistics</h4>
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-value">{studentStats.totalDays}</span>
              <span className="stat-label">Total Days</span>
            </div>
            <div className="stat present">
              <span className="stat-value">{studentStats.presentDays}</span>
              <span className="stat-label">Present</span>
            </div>
            <div className="stat late">
              <span className="stat-value">{studentStats.lateDays}</span>
              <span className="stat-label">Late</span>
            </div>
            <div className="stat absent">
              <span className="stat-value">{studentStats.absentDays}</span>
              <span className="stat-label">Absent</span>
            </div>
            <div className="stat percentage">
              <span className="stat-value">{studentStats.attendancePercentage}%</span>
              <span className="stat-label">Attendance</span>
            </div>
          </div>
        </div>
      )}

      {getFilteredAttendance.length === 0 ? (
        <div className="empty-state">
          <p>No attendance records found.</p>
        </div>
      ) : (
        <div className="history-table-container">
          {viewMode === 'date' ? (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Status</th>
                  <th>Marked At</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAttendance.map((record) => (
                  <tr key={record.id}>
                    <td className="date-cell">{formatDateString(record.date)}</td>
                    <td>{getStudentName(record.studentId)}</td>
                    <td>
                      #{students.find(s => s.id === record.studentId)?.rollNumber || '-'}
                    </td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="time-cell">
                      {new Date(record.markedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Marked At</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAttendance.map((record) => (
                  <tr key={record.id}>
                    <td className="date-cell">{formatDateString(record.date)}</td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="time-cell">
                      {new Date(record.markedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;