import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation/Navigation';
import { useAuth } from '../context/AuthContext';
import { contactAPI } from '../services/api';
import '../styles/Contacts.css';

const Contacts = ({ currentPage, setCurrentPage }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState({ doctors: [], pharmacies: [] });
  const [formData, setFormData] = useState({ name: '', type: 'doctor', phone: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load contacts on component mount
  useEffect(() => { loadContacts(); }, []);

  const loadContacts = async () => {
    try {
      const response = await contactAPI.getContacts();
      if (response.status === 'success') {
        const { contacts: data } = response.data;
        setContacts({
          doctors: data.filter(contact => contact.type === 'doctor'),
          pharmacies: data.filter(contact => contact.type === 'pharmacy')
        });
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear messages when user starts typing
    setError('');
    setSuccess('');
  };

  const showMessage = (type, message) => {
    type === 'success' ? setSuccess(message) : setError(message);
    setTimeout(() => type === 'success' ? setSuccess('') : setError(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await contactAPI.addContact(formData);
      if (response.status === 'success') {
        showMessage('success', 'Contact added successfully!');
        setFormData({ name: '', type: 'doctor', phone: '' }); // Clear form
        await loadContacts(); // Reload contacts
      } else {
        setError(response.message || 'Failed to add contact');
      }
    } catch (error) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const response = await contactAPI.deleteContact(contactId);
      if (response.status === 'success') {
        showMessage('success', 'Contact deleted successfully!');
        await loadContacts();
      } else {
        setError('Failed to delete contact');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    }
  };

  // Render contact cards for both doctors and pharmacies
  const renderContactCards = (contactList, emoji) => (
    contactList.length === 0 ? (
      <p className="contacts-empty-message">No {contactList === contacts.doctors ? 'doctors' : 'pharmacies'} added yet</p>
    ) : (
      <div className="contacts-grid">
        {contactList.map(contact => (
          <div key={contact._id} className="contact-card">
            <div className="contact-info">
              <h4>{emoji} {contact.name}</h4>
              <p>📱 {contact.phone}</p>
            </div>
            <button 
              className="contacts-delete-button" 
              onClick={() => handleDeleteContact(contact._id)}
              title="Delete contact"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="contacts-container">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="contacts-header">
        <div className="contacts-header-content">
          <button className="contacts-back-button" onClick={() => setCurrentPage('profile')}>Back</button>
          <h1 className="contacts-page-title">📞 Contacts</h1>
        </div>
      </div>

      <div className="contacts-content">
        {error && <div className="contacts-error-message">❌ {error}</div>}
        {success && <div className="contacts-success-message">✅ {success}</div>}

        {/* Add Contact Form */}
        <form className="contacts-form" onSubmit={handleSubmit}>
          <div className="contacts-form-group">
            <h3 className="contacts-section-title">➕ Add New Contact</h3>
            <div className="contacts-form-row">
              <div className="contacts-name-field">
                <label className="contacts-label">👤 Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="contacts-input" placeholder="Enter contact name" required />
              </div>
              <div className="contacts-type-field">
                <label className="contacts-label">🏷️ Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange} className="contacts-select" required>
                  <option value="doctor">👨‍⚕️ Doctor</option>
                  <option value="pharmacy">🏥 Pharmacy</option>
                </select>
              </div>
            </div>
            <div className="contacts-phone-field">
              <label className="contacts-label">📱 Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="contacts-input" placeholder="Enter phone number" required />
            </div>
            <div className="contacts-form-actions">
              <button type="submit" disabled={loading} className="contacts-submit-button">
                {loading ? 'Adding...' : 'Add Contact'}
              </button>
            </div>
          </div>
        </form>

        {/* Doctors Section */}
        <div className="contacts-section">
          <h3 className="contacts-section-title">👨‍⚕️ Doctors ({contacts.doctors.length})</h3>
          {renderContactCards(contacts.doctors, '👨‍⚕️')}
        </div>

        {/* Pharmacies Section */}
        <div className="contacts-section">
          <h3 className="contacts-section-title">🏥 Pharmacies ({contacts.pharmacies.length})</h3>
          {renderContactCards(contacts.pharmacies, '🏥')}
        </div>
      </div>
    </div>
  );
};

export default Contacts;
