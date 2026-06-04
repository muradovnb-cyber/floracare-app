// API Client for FloraCare

const API_BASE = '/api';

// Helper to get auth header
function getHeaders() {
  const token = localStorage.getItem('floracare_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Helper to handle response
async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Произошла ошибка при выполнении запроса');
  }
  return data;
}

export const api = {
  // Auth API
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('floracare_token', data.token);
    }
    return data;
  },

  async register(email, password, name, phone) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, name, phone }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('floracare_token', data.token);
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return await handleResponse(res);
  },

  logout() {
    localStorage.removeItem('floracare_token');
  },

  // Visits API
  async getVisits() {
    const res = await fetch(`${API_BASE}/visits`, {
      headers: getHeaders(),
    });
    return await handleResponse(res);
  },

  async createVisit(client_id, gardener_id, date, time, service_type) {
    const res = await fetch(`${API_BASE}/visits`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ client_id, gardener_id, date, time, service_type }),
    });
    return await handleResponse(res);
  },

  async updateVisit(visitId, updateData) {
    const res = await fetch(`${API_BASE}/visits/${visitId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });
    return await handleResponse(res);
  },

  // Reports API
  async getReports() {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: getHeaders(),
    });
    return await handleResponse(res);
  },

  async submitReport(visit_id, text, recommendations, photos, plants) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ visit_id, text, recommendations, photos, plants }),
    });
    return await handleResponse(res);
  },

  // Payments API
  async getPayments() {
    const res = await fetch(`${API_BASE}/payments`, {
      headers: getHeaders(),
    });
    return await handleResponse(res);
  },

  async payPayment(paymentId) {
    const res = await fetch(`${API_BASE}/payments/${paymentId}/pay`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return await handleResponse(res);
  },

  // Admin APIs
  async getUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders(),
    });
    return await handleResponse(res);
  }
};
