import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import adminService from '../services/adminService';
import MainLayout from '../components/common/MainLayout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import './UserManagementPage.css';

const UserManagementPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CANDIDATE',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { name, email, password, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await adminService.getAllUsers(token);
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setError('Failed to fetch users.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await authService.register(formData, token);
      setSuccess(`User ${name} created successfully as a ${role}.`);
      // Reset form
      setFormData({ name: '', email: '', password: '', role: 'CANDIDATE' });
      fetchUsers(); // Refresh the list
    } catch (err) {
      const message = err.response?.data?.msg || 'Failed to create user.';
      setError(message);
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <h1>User Management</h1>
        <Link to="/admin/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
      <div className="user-management-content">
        <div className="user-list">
          <Card>
            <h2>All Users</h2>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><StatusBadge status={user.role} /></td>
                      <td><StatusBadge status={user.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
        <div className="user-create">
          <Card>
            <h2>Create New User</h2>
            <form onSubmit={onSubmit} className="user-form">
              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <Input id="name" name="name" value={name} onChange={onChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <Input id="email" type="email" name="email" value={email} onChange={onChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Input id="password" type="password" name="password" value={password} onChange={onChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={role} onChange={onChange} className="role-select">
                  <option value="CANDIDATE">Candidate</option>
                  <option value="PROCTOR">Proctor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <Button type="submit" variant="primary">Create User</Button>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserManagementPage;
