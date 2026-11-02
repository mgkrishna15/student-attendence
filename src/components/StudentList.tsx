import React, { useState } from 'react';
import type { Student } from '../types';
import { storage } from '../utils/storage';

interface StudentListProps {
  students: Student[];
  onStudentsChange: (students: Student[]) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onStudentsChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    class: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: '', email: '', rollNumber: '', class: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const updated = storage.updateStudent(editingId, formData);
      if (updated) {
        onStudentsChange(storage.getStudents());
      }
    } else {
      storage.addStudent(formData);
      onStudentsChange(storage.getStudents());
    }
    
    resetForm();
  };

  const handleEdit = (student: Student) => {
    setFormData({
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      class: student.class,
    });
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      storage.deleteStudent(id);
      onStudentsChange(storage.getStudents());
    }
  };

  return (
    <div className="student-list">
      <div className="list-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add Student
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingId ? 'Edit Student' : 'Add New Student'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Student name"
                />
              </div>
              <div className="form-group">
                <label>Roll Number *</label>
                <input
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="Roll number"
                />
              </div>
              <div className="form-group">
                <label>Class *</label>
                <input
                  type="text"
                  required
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="Class (e.g., 10-A)"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email (optional)"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Add'} Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          <p>{students.length === 0 ? 'No students added yet.' : 'No students match your search.'}</p>
          {students.length === 0 && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Add Your First Student
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Name</th>
                <th>Class</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="roll-number">#{student.rollNumber}</td>
                  <td className="student-name">{student.name}</td>
                  <td>{student.class}</td>
                  <td className="email">{student.email || '-'}</td>
                  <td className="actions">
                    <button 
                      className="btn-icon edit"
                      onClick={() => handleEdit(student)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon delete"
                      onClick={() => handleDelete(student.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentList;