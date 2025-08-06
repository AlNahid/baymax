const API_BASE_URL = 'http://localhost:5000/api';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (options.auth !== false && token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Authentication API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
      auth: false,
    });
  },

  // Login user
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      auth: false,
    });
  },

  // Logout user and clear local storage
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Save user data and token to local storage
  saveUserData: (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  },
};

// Medicine API functions
export const medicineAPI = {
  // Get all medicines for the authenticated user
  getAllMedicines: async () => {
    return apiRequest('/medicines', {
      method: 'GET',
    });
  },

  // Add new medicine
  addMedicine: async (medicineData) => {
    return apiRequest('/medicines', {
      method: 'POST',
      body: JSON.stringify(medicineData),
    });
  },

  // Update existing medicine
  updateMedicine: async (medicineId, medicineData) => {
    return apiRequest(`/medicines/${medicineId}`, {
      method: 'PUT',
      body: JSON.stringify(medicineData),
    });
  },

  // Delete medicine
  deleteMedicine: async (medicineId) => {
    return apiRequest(`/medicines/${medicineId}`, {
      method: 'DELETE',
    });
  },

  // Record medicine intake
  recordIntake: async (medicineId, timeOfDay, taken, count) => {
    return apiRequest(`/medicines/${medicineId}/take`, {
      method: 'POST',
      body: JSON.stringify({
        timeOfDay,
        taken,
        count
      }),
    });
  },
};

export default { auth: authAPI, medicine: medicineAPI };
