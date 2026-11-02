import React, { useMemo } from 'react';
import type { Student, AttendanceRecord } from '../types';
import { storage } from '../utils/storage';

interface DashboardProps {
  students: Student[];
  attendance: AttendanceRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, attendance }) => {
  const stats = useMemo(() => {
    const today = storage.getToday();
    const todayRecords = attendance.filter(r => r.date === today);
    
    const totalStudents = students.length;
    const presentToday = todayRecords.filter(r => r.status === 'present').length;
    const absentToday = todayRecords.filter(r => r.status === 'absent').length;
    const lateToday = todayRecords.filter(r => r.status === 'late').length;
    const notMarkedToday = totalStudents - todayRecords.length;

    return {
      totalStudents,
      presentToday,
      absentToday,
      lateToday,
      notMarkedToday,
      attendanceRate: totalStudents > 0 
        ? Math.round(((presentToday + lateToday) / totalStudents) * 100) 
        : 0,
    };
  }, [students, attendance]);

  const recentActivity = useMemo(() => {
    return attendance
      .sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime())
      .slice(0, 5)
      .map(record => {
        const student = students.find(s => s.id === record.studentId);
        return {
          ...record,
          studentName: student?.name || 'Unknown',
          rollNumber: student?.rollNumber || '-',
        };
      });
  }, [attendance, students]);

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalStudents}</h3>
            <p className="stat-label">Total Students</p>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.presentToday}</h3>
            <p className="stat-label">Present Today</p>
          </div>
        </div>
        
        <div className="stat-card danger">
          <div className="stat-icon">✗</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.absentToday}</h3>
            <p className="stat-label">Absent Today</p>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.lateToday}</h3>
            <p className="stat-label">Late Today</p>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="card attendance-overview">
          <h3>Today's Overview</h3>
          <div className="overview-content">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${stats.attendanceRate}%` }}
              />
            </div>
            <div className="overview-stats">
              <span className="overview-stat">
                <span className="dot present" />
                Present: {stats.presentToday}
              </span>
              <span className="overview-stat">
                <span className="dot late" />
                Late: {stats.lateToday}
              </span>
              <span className="overview-stat">
                <span className="dot absent" />
                Absent: {stats.absentToday}
              </span>
              <span className="overview-stat">
                <span className="dot pending" />
                Not Marked: {stats.notMarkedToday}
              </span>
            </div>
          </div>
        </div>

        <div className="card recent-activity">
          <h3>Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="empty-message">No recent activity</p>
          ) : (
            <ul className="activity-list">
              {recentActivity.map((record) => (
                <li key={record.id} className="activity-item">
                  <span className="activity-status">
                    <span className={`dot ${record.status}`} />
                  </span>
                  <span className="activity-info">
                    <strong>{record.studentName}</strong>
                    <span className="activity-roll">#{record.rollNumber}</span>
                  </span>
                  <span className="activity-date">
                    {new Date(record.markedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;