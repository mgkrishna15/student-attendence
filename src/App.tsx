import { useState, useEffect } from 'react';
import type { Student, AttendanceRecord } from './types';
import { storage } from './utils/storage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import AttendanceMarking from './components/AttendanceMarking';
import AttendanceHistory from './components/AttendanceHistory';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    setStudents(storage.getStudents());
    setAttendance(storage.getAttendance());
  }, []);

  const handleStudentsChange = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
  };

  const handleAttendanceChange = (updatedAttendance: AttendanceRecord[]) => {
    setAttendance(updatedAttendance);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'students':
        return 'Student Management';
      case 'attendance':
        return 'Mark Attendance';
      case 'history':
        return 'Attendance History';
      default:
        return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard students={students} attendance={attendance} />;
      case 'students':
        return (
          <StudentList
            students={students}
            onStudentsChange={handleStudentsChange}
          />
        );
      case 'attendance':
        return (
          <AttendanceMarking
            students={students}
            attendance={attendance}
            onAttendanceChange={handleAttendanceChange}
          />
        );
      case 'history':
        return (
          <AttendanceHistory
            students={students}
            attendance={attendance}
          />
        );
      default:
        return <Dashboard students={students} attendance={attendance} />;
    }
  };

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        <Header title={getPageTitle()} />
        <div className="content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;