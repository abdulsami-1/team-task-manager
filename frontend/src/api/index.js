// In dev this points to localhost. In production, set VITE_API_URL to your
// deployed backend URL (e.g. https://your-app.onrender.com)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Small helper so we don't repeat the same fetch options everywhere
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // always send the session cookie
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

// ---- Auth ----
export function registerUser(username, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export function loginUser(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function logoutUser() {
  return request('/auth/logout', { method: 'POST' });
}

export function getCurrentUser() {
  return request('/auth/me');
}

// ---- Teams ----
export function getTeams() {
  return request('/teams');
}

export function createTeam(name) {
  return request('/teams', { method: 'POST', body: JSON.stringify({ name }) });
}

export function getTeamMembers(teamId) {
  return request(`/teams/${teamId}/members`);
}

export function addTeamMember(teamId, userId) {
  return request(`/teams/${teamId}/members`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

// ---- Tasks ----
export function getTasks(filters = {}) {
  // drop empty filters so the URL stays clean
  const clean = {};
  Object.keys(filters).forEach((key) => {
    if (filters[key]) clean[key] = filters[key];
  });
  const params = new URLSearchParams(clean).toString();
  return request(`/tasks${params ? `?${params}` : ''}`);
}

export function createTask(task) {
  return request('/tasks', { method: 'POST', body: JSON.stringify(task) });
}

export function updateTask(id, updates) {
  // Useful for debugging: ensure `assigned_to` is sent as number or null.
  return request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
}


export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' });
}