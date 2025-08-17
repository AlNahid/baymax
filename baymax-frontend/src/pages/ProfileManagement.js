import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation/Navigation';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import '../styles/MedicineForm.css';

const ProfileManagement = ({ currentPage, setCurrentPage }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Initialize form with current user data
  useEffect(() => {
    if (user) setFormData({ ...formData, firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear messages when user starts typing
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords if provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const updateData = { firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone };
      // Add password if provided
      if (formData.password) updateData.password = formData.password;

      const response = await authAPI.updateProfile(updateData);
      
      if (response.status === 'success') {
        // Update user data in context and localStorage
        updateUser({ firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone });
        setSuccess('Profile updated successfully!');
        // Clear password fields
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (user) setFormData({ firstName: user.firstName || '', 
        lastName: user.lastName || '', 
        phone: user.phone || '', 
        password: '', 
        confirmPassword: '' });
        
    setError('');
    setSuccess('');
    setCurrentPage('profile');
  };

  return (
    <div className="add-medicine-container">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="header">
        <div className="header-content">
          <button className="back-button" onClick={() => setCurrentPage('profile')}>Back</button>
          <h1 className="page-title">👤 Profile Management</h1>
        </div>
      </div>

      <div className="content">
        {error && <div className="error-message">❌ {error}</div>}
        {success && <div className="success-message">✅ {success}</div>}

        <form className="add-form" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="form-group">
            <h3 className="section-title">📝 Personal Information</h3>
            <div className="name-dose-row">
              <div className="name-field">
                <label>👤 First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="form-input" placeholder="Enter your first name" required />
              </div>
              <div className="dose-field">
                <label>👤 Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="form-input" placeholder="Enter your last name" required />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-group">
            <h3 className="section-title">📞 Contact Information</h3>
            <div style={{ marginBottom: '20px' }}>
              <label>📧 Email</label>
              <input type="email" value={user?.email || ''} className="form-input" disabled style={{ backgroundColor: '#f5f5f5', color: '#888', cursor: 'not-allowed' }} />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>Email cannot be changed</small>
            </div>
            <div>
              <label>📱 Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" placeholder="Enter your phone number" required />
            </div>
          </div>

          {/* Password Update */}
          <div className="form-group">
            <h3 className="section-title">🔒 Change Password (Optional)</h3>
            <div className="name-dose-row">
              <div className="name-field">
                <label>🔐 New Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="form-input" placeholder="Enter new password (optional)" />
              </div>
              <div className="dose-field">
                <label>🔐 Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="form-input" placeholder="Confirm new password" />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-button">Cancel</button>
            <button type="submit" disabled={loading} className="submit-button">{loading ? 'Updating...' : 'Update Profile'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileManagement;
