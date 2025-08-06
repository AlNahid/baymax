import React, { useState } from 'react';
import Navigation from '../components/Navigation/Navigation';
import '../styles/MedicineForm.css';
import { medicineAPI } from '../services/api';

const AddMedicine = ({ currentPage, setCurrentPage }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    dose: '',
    program: '',
    quantity: '',
    foodRelation: 'After food',
    morningCount: 0,
    noonCount: 0,
    nightCount: 0
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCountChange = (timeOfDay, increment) => {
    const fieldName = `${timeOfDay}Count`;
    const newValue = Math.max(0, formData[fieldName] + (increment ? 1 : -1));
    
    setFormData({
      ...formData,
      [fieldName]: newValue
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Medicine name is required';
    if (!formData.dose.trim()) return 'Dose is required';
    if (!formData.program || parseInt(formData.program) < 1) return 'Valid program duration is required';
    if (!formData.quantity || parseInt(formData.quantity) < 0) return 'Valid quantity is required';
    if (parseInt(formData.morningCount) + parseInt(formData.noonCount) + parseInt(formData.nightCount) === 0) {
      return 'At least one daily dosage count must be greater than 0';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const medicineData = {
        name: formData.name,
        dose: formData.dose,
        program: parseInt(formData.program),
        quantity: parseInt(formData.quantity),
        foodRelation: formData.foodRelation,
        dailyDosage: {
          morning: parseInt(formData.morningCount),
          noon: parseInt(formData.noonCount),
          night: parseInt(formData.nightCount)
        }
      };

      await medicineAPI.addMedicine(medicineData);
      
      setSuccess('Medicine added successfully!');
      setTimeout(() => {
        setCurrentPage('track');
      }, 2000);
      
    } catch (error) {
      setError(`Failed to add medicine: ${error.message}`);
    }
  };

  return (
    <div className="add-medicine-container">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="header">
        <div className="header-content">
          <button className="back-button" onClick={() => setCurrentPage('home')}>
            Back
          </button>
          <h1 className="page-title">💊 Add Medicine</h1>
        </div>
      </div>

      <div className="content">
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}

        <form className="add-form" onSubmit={handleSubmit}>
          {/* Medicine Name and Dose*/}
          <div className="form-group">
            <div className="form-row name-dose-row">
              <div className="name-field">
                <label>💊 Medicine Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter medicine name"
                  className="form-input"
                  required
                />
              </div>
              <div className="dose-field">
                <label>💉 Dose</label>
                <input
                  type="text"
                  name="dose"
                  value={formData.dose}
                  onChange={handleChange}
                  placeholder="e.g., 500mg"
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Program Duration and Quantity*/}
          <div className="form-group">
            <div className="form-row duration-quantity-row">
              <div>
                <label>📅 Program Duration (days)</label>
                <input
                  type="number"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  min="1"
                  placeholder="Number of days"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label>📦 Available Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  placeholder="Number of pills"
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Food Relation*/}
          <div className="form-group">
            <label>🍽️ Food Relation</label>
            <select
              name="foodRelation"
              value={formData.foodRelation}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="After food">After food</option>
              <option value="Before food">Before food</option>
            </select>
          </div>

          <div className="dosage-section">
            <h3>⏰ Daily Dosage</h3>
            <div className="dosage-grid">
              {[
                { time: 'morning', emoji: '🌅', label: 'Morning' },
                { time: 'noon', emoji: '☀️', label: 'Noon' },
                { time: 'night', emoji: '🌙', label: 'Night' }
              ].map(({ time, emoji, label }) => (
                <div key={time} className="dosage-item">
                  <label>{emoji} {label}</label>
                  <div className="count-control">
                    <button
                      type="button"
                      className="count-btn"
                      onClick={() => handleCountChange(time, false)}
                    >
                      -
                    </button>
                    <span className="count-display">
                      {formData[`${time}Count`]}
                    </span>
                    <button
                      type="button"
                      className="count-btn"
                      onClick={() => handleCountChange(time, true)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => setCurrentPage('home')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="confirm-button"
            >
              Add Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicine;
