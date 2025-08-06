import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation/Navigation';
import { medicineAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = ({ currentPage, setCurrentPage }) => {
  const [currentDate] = useState(new Date());
  const { user } = useAuth();
  const [medications, setMedications] = useState({
    morning: [],
    noon: [],
    night: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch medicines from backend
  useEffect(() => {
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await medicineAPI.getAllMedicines();
      const medicines = response.data?.medicines || [];
      
      const groupedMeds = {
        morning: [],
        noon: [],
        night: []
      };
      
      medicines.forEach(med => {
        const today = new Date().toISOString().split('T')[0];
        const todayIntake = med.intakeHistory?.find(intake => 
          new Date(intake.date).toISOString().split('T')[0] === today
        ) || { morning: { taken: false }, noon: { taken: false }, night: { taken: false } };
        
        // Calculate if program is completed
        const dailyPills = (med.dailyDosage?.morning || 0) + (med.dailyDosage?.noon || 0) + (med.dailyDosage?.night || 0);
        const totalPillsNeeded = dailyPills * med.program;
        
        let actualPillsConsumed = 0;
        if (med.intakeHistory && med.intakeHistory.length > 0) {
          med.intakeHistory.forEach(intake => {
            if (intake.morning?.taken) actualPillsConsumed += (med.dailyDosage?.morning || 0);
            if (intake.noon?.taken) actualPillsConsumed += (med.dailyDosage?.noon || 0);
            if (intake.night?.taken) actualPillsConsumed += (med.dailyDosage?.night || 0);
          });
        }
        
        const progressPercentage = totalPillsNeeded > 0 ? 
          Math.max(0, Math.min(100, (actualPillsConsumed / totalPillsNeeded) * 100)) : 0;
        const isCompleted = progressPercentage >= 100;
        
        const medicineData = {
          id: med._id,
          name: med.name,
          dose: `${med.dose}mg`,
          foodRelation: med.foodRelation,
          remaining: med.quantity,
          isCompleted
        };
        
        if (med.dailyDosage.morning > 0) {
          groupedMeds.morning.push({
            ...medicineData,
            count: med.dailyDosage.morning,
            taken: todayIntake.morning?.taken || false
          });
        }
        if (med.dailyDosage.noon > 0) {
          groupedMeds.noon.push({
            ...medicineData,
            count: med.dailyDosage.noon,
            taken: todayIntake.noon?.taken || false
          });
        }
        if (med.dailyDosage.night > 0) {
          groupedMeds.night.push({
            ...medicineData,
            count: med.dailyDosage.night,
            taken: todayIntake.night?.taken || false
          });
        }
      });
      
      setMedications(groupedMeds);
    } catch (error) {
      setError(`Failed to load medicines: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    fetchMedicines();
  } else {
    setLoading(false);
  }
}, [user]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTakeMedicine = async (timeOfDay, medicineId) => {
    try {
      const currentMed = medications[timeOfDay].find(med => med.id === medicineId);
      if (!currentMed) return;

      const newTakenStatus = !currentMed.taken;
      const count = currentMed.count;

      // Check if medicine is out of stock when trying to take it
      if (newTakenStatus && currentMed.remaining < count) {
        setError(`Cannot take ${currentMed.name}: Not enough pills remaining (${currentMed.remaining} available, ${count} needed)`);
        return;
      }

      // Calculate new remaining count
      const newRemainingCount = newTakenStatus 
        ? currentMed.remaining - count 
        : currentMed.remaining + count;

      // Update UI immediately - update remaining count for ALL instances of this medicine
      setMedications(prev => {
        const updated = { ...prev };
        
        // Update all time slots for this medicine
        ['morning', 'noon', 'night'].forEach(slot => {
          updated[slot] = prev[slot].map(med => {
            if (med.id === medicineId) {
              return {
                ...med,
                taken: slot === timeOfDay ? newTakenStatus : med.taken,
                remaining: newRemainingCount
              };
            }
            return med;
          });
        });
        
        return updated;
      });

      // Record the intake in backend
      await medicineAPI.recordIntake(medicineId, timeOfDay, newTakenStatus, count);

    } catch (error) {
      setError(`Failed to record medicine intake: ${error.message}`);
    }
  };

  const renderMedicineSection = (timeOfDay, title, icon) => {
    const meds = medications[timeOfDay];
    
    return (
      <div className="medicine-section">
        <div className="section-header">
          <span className="section-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
        
        {meds.length === 0 ? (
          <div className="no-medicines">
            <p>No medicines scheduled for {title.toLowerCase()}</p>
          </div>
        ) : (
          <div className="medicine-list">
            {meds.map(med => {
              const isOutOfStock = !med.taken && med.remaining < med.count;
              const isCompleted = med.isCompleted;
              
              return (
                <div key={med.id} className={`medicine-card ${med.taken ? 'taken' : ''} ${isOutOfStock ? 'out-of-stock' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <div className="medicine-info">
                    <h4 className={med.taken ? 'strikethrough' : ''}>{med.name}</h4>
                    <p className="medicine-dose">{med.dose}</p>
                    {isCompleted ? (
                      <p className="medicine-details completed-text">
                        ✅ Program completed
                      </p>
                    ) : (
                      <p className="medicine-details">
                        Take {med.count} pill{med.count > 1 ? 's' : ''} • {med.foodRelation}
                      </p>
                    )}
                    <p className="medicine-remaining">
                      {med.remaining} pills remaining
                      {med.remaining <= 7 && med.remaining > 0 && !isCompleted && <span className="low-stock"> ⚠️ Low stock</span>}
                      {isOutOfStock && !isCompleted && <span className="out-of-stock-warning"> ❌ Out of stock</span>}
                    </p>
                  </div>
                  {isCompleted ? (
                    <div className="completed-indicator">
                      <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Completed</span>
                    </div>
                  ) : (
                    <button 
                      className={`take-button ${med.taken ? 'undo' : 'take'} ${isOutOfStock ? 'disabled' : ''}`}
                      onClick={() => handleTakeMedicine(timeOfDay, med.id)}
                      disabled={isOutOfStock}
                    >
                      {isOutOfStock ? 'Out of Stock' : (med.taken ? 'Undo' : 'Take')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="home-container">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="home-content">
        <div className="date-header">
          <h1>Today's Medications</h1>
          <p className="current-date">{formatDate(currentDate)}</p>
        </div>

        <div className="week-view">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
            const dayDate = new Date();
            dayDate.setDate(currentDate.getDate() - currentDate.getDay() + index);
            const isToday = dayDate.toDateString() === currentDate.toDateString();
            
            return (
              <div key={day} className={`day-pill ${isToday ? 'today' : ''}`}>
                <span className="day-name">{day}</span>
                <span className="day-number">{dayDate.getDate()}</span>
              </div>
            );
          })}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading your medicines...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#d32f2f', background: '#ffebee', borderRadius: '8px', margin: '20px 0' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="medicine-sections">
            {renderMedicineSection('morning', 'Morning', '🌅')}
            {renderMedicineSection('noon', 'Noon', '☀️')}
            {renderMedicineSection('night', 'Night', '🌙')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
