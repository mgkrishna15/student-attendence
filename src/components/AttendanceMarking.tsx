import React, { useState, useMemo } from 'react';
import type { Student, AttendanceRecord } from '../types';
import { storage } from '../utils/storage';

interface AttendanceMarkingProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onAttendanceChange: (attendance: AttendanceRecord[]) => void;
}

const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({
  students,
  attendance,
  onAttendanceChange,
}) => {
  const [selectedDate, setSelectedDate] = useState(storage.getToday());
  const [filterClass, setFilterClass] = useState('all');

  const classes = useMemo(() => {
    const uniqueClasses = [...new Set(students.map(s => s.class))];
    return ['all', ...uniqueClasses];
  }, [students]);

  const todayRecords = useMemo(() => {
    return attendance.filter(r => r.date === selectedDate);
  }, [attendance, selectedDate]);

  const getStudentStatus = (studentId: string): 'present' | 'absent' | 'late' | 'unmarked' => {
    const record = todayRecords.find(r => r.studentId === studentId);
    return record?.status || 'unmarked';
  };

  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    storage.markAttendance(studentId, selectedDate, status);
    onAttendanceChange(storage.getAttendance());
  };

  const handleMarkAll = (status: 'present' | 'absent' | 'late') => {
    const filteredStudents = filterClass === 'all' 
      ? students 
      : students.filter(s => s.class === filterClass);
    
    filteredStudents.forEach(student => {
      storage.markAttendance(student.id, selectedDate, status);
    });
    onAttendanceChange(storage.getAttendance());
  };

  const filteredStudents = filterClass === 'all' 
    ? students 
    : students.filter(s => s.class === filterClass);

  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const marked = filteredStudents.filter(s => getStudentStatus(s.id) !== 'unmarked').length;
    const present = filteredStudents.filter(s => getStudentStatus(s.id) === 'present').length;
    const absent = filteredStudents.filter(s => getStudentStatus(s.id) === 'absent').length;
    const late = filteredStudents.filter(s => getStudentStatus(s.id) === 'late').length;

    return { total, marked, present, absent, late };
  }, [filteredStudents, todayRecords]);

  return (
    <div className="attendance-marking">
      <div className="marking-header">
        <div className="date-selector">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={storage.getToday()}
          />
        </div>
        
        <div className="class-filter">
          <label>Filter by Class:</label>
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
      </div>

      <div className="marking-stats">
        <span className="stat">
          Total: <strong>{stats.total}</strong>
        </span>
        <span className="stat marked">
          Marked: <strong>{stats.marked}</strong>
        </span>
        <span className="stat present">
          Present: <strong>{stats.present}</strong>
        </span>
        <span className="stat absent">
          Absent: <strong>{stats.absent}</strong>
        </span>
        <span className="stat late">
          Late: <strong>{stats.late}</strong>
        </span>
      </div>

      <div className="quick-actions">
        <button 
          className="btn btn-success"
          onClick={() => handleMarkAll('present')}
          disabled={filteredStudents.length === 0}
        >
          Mark All Present
        </button>
        <button 
          className="btn btn-danger"
          onClick={() => handleMarkAll('absent')}
          disabled={filteredStudents.length === 0}
        >
          Mark All Absent
        </button>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          <p>No students to mark attendance for.</p>
        </div>
      ) : (
        <div className="attendance-grid">
          {filteredStudents.map((student) => {
            const status = getStudentStatus(student.id);
            return (
              <div key={student.id} className={`attendance-card ${status}`}>
                <div className="student-info">
                  <h4 className="student-name">{student.name}</h4>
                  <p className="student-details">
                    <span className="roll">#{student.rollNumber}</span>
                    <span className="class">{student.class}</span>
                  </p>
                </div>
                
                <div className="status-indicator">
                  {status === 'unmarked' ? (
                    <span className="unmarked-badge">Not Marked</span>
                  ) : (
                    <span className={`status-badge ${status}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  )}
                </div>
                
                <div className="action-buttons">
                  <button
                    className={`btn-sm ${status === 'present' ? 'active' : ''}`}
                    onClick={() => handleMarkAttendance(student.id, 'present')}
                    title="Mark Present"
                  >
                    ✓ Present
                  </button>
                  <button
                    className={`btn-sm ${status === 'late' ? 'active' : ''}`}
                    onClick={() => handleMarkAttendance(student.id, 'late')}
                    title="Mark Late"
                  >
                    ⏰ Late
                  </button>
                  <button
                    className={`btn-sm ${status === 'absent' ? 'active' : ''}`}
                    onClick={() => handleMarkAttendance(student.id, 'absent')}
                    title="Mark Absent"
                  >
                    ✗ Absent
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendanceMarking;