import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation/Navigation';
import '../styles/TrackMedicine.css';
import { medicineAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TrackMedicine = ({ currentPage, setCurrentPage, setSelectedMedicineId }) => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  // fetches medicines whenever the user navigates to this page
  useEffect(() => {
    if (currentPage === 'track') {
      fetchMedicines();
    }
  }, [currentPage]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await medicineAPI.getAllMedicines();
      const medicinesData = response.data?.medicines || [];
      
      setMedicines(medicinesData);
    } catch (error) {
      setError(`Failed to load medicines: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (medicine) => {
    const dailyPills = (medicine.dailyDosage?.morning || 0) + (medicine.dailyDosage?.noon || 0) + (medicine.dailyDosage?.night || 0);
    const totalPillsNeeded = dailyPills * medicine.program;
    
    // Calculate pill consumption from intake history
    let actualPillsConsumed = 0;
    if (medicine.intakeHistory && medicine.intakeHistory.length > 0) {
      medicine.intakeHistory.forEach(intake => {
        if (intake.morning?.taken) actualPillsConsumed += (medicine.dailyDosage?.morning || 0);
        if (intake.noon?.taken) actualPillsConsumed += (medicine.dailyDosage?.noon || 0);
        if (intake.night?.taken) actualPillsConsumed += (medicine.dailyDosage?.night || 0);
      });
    }
    
    // Calculate progress based consumption and total needed
    const progressPercentage = totalPillsNeeded > 0 ? 
      Math.max(0, Math.min(100, (actualPillsConsumed / totalPillsNeeded) * 100)) : 0;
    
    return {
      percentage: Math.round(progressPercentage),
      pillsUsed: actualPillsConsumed,
      totalPillsNeeded,
      dailyPills
    };
  };

  const getStatusInfo = (medicine, progress) => {
    const pillsLeftToTake = progress.totalPillsNeeded - progress.pillsUsed;
    const daysLeft = Math.floor(pillsLeftToTake / progress.dailyPills);
    
    if (daysLeft == 0) {
      return { text: 'Program completed', color: '#4caf50' };
    }
    return { text: `${daysLeft} days remaining`};
  };

  const handleUpdate = (medicineId) => {
    if (setSelectedMedicineId) {
      setSelectedMedicineId(medicineId);
    }
    if (setCurrentPage) {
      setCurrentPage('update');
    }
  };

  const handleDelete = async (medicineId) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicineAPI.deleteMedicine(medicineId);
        fetchMedicines();
      } catch (error) {
        setError('Failed to delete medicine. Please try again.');
      }
    }
  };

  return (
    <div className="track-medicine-container">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="header">
        <div className="header-content">
          <button className="back-button" onClick={() => setCurrentPage('home')}>
            Back
          </button>
          <h1 className="page-title">📊 Track Medicines</h1>
        </div>
      </div>

      <div className="content">
        {loading && (
          <div className="loading-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div>Loading your medicines...</div>
          </div>
        )}

        {error && !loading && (
          <div className="error-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <div style={{ marginBottom: '20px' }}>{error}</div>
            <button onClick={fetchMedicines}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && medicines.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💊</div>
            <h3>No medicines to track</h3>
            <p>Add some medicines to start tracking your medication progress.</p>
            <button onClick={() => setCurrentPage('add')}>
              ➕ Add Medicine
            </button>
          </div>
        )}

        {!loading && !error && medicines.length > 0 && (
          <div className="medicines-grid">
            {medicines.map((medicine) => {
              const progress = calculateProgress(medicine);
              const statusInfo = getStatusInfo(medicine, progress);

              return (
                <div key={medicine._id} className="medicine-card">
                  <div className="medicine-actions">
                    <button onClick={() => handleUpdate(medicine._id)}>
                      ✏️ Update
                    </button>
                    <button onClick={() => handleDelete(medicine._id)}>
                      🗑️ Delete
                    </button>
                  </div>

                  <div className="medicine-content">
                    <div className="medicine-name-section">
                      <h3>{medicine.name}</h3>
                      <span>{medicine.dose}</span>
                      
                      <div className="progress-section">
                        <span>Program progress</span>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${progress.percentage}%`,
                              backgroundColor: progress.percentage >= 100 ? '#4caf50' : '#ff6b6b'
                            }}
                          ></div>
                        </div>
                        <div>{Math.round(progress.percentage)}% complete</div>
                      </div>
                    </div>

                    <div className="medicine-details">
                      <div>💊 Pills Available: {medicine.quantity}</div>
                      <div>📅 Pills per Day: {progress.dailyPills}</div>
                      <div>🍽️ Food Relation: {medicine.foodRelation}</div>
                      <div>📊 Status: <span style={{ color: statusInfo.color }}>{statusInfo.text}</span></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackMedicine;
