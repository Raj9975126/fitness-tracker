import { api } from './api';

export async function fetchProfile() {
  const res = await api.get('/users/profile');
  return res.data;
}

// Partial update: only send the fields that changed. Weights/heights are metric (kg, cm).
export async function updateProfile(changes) {
  const res = await api.put('/users/profile', changes);
  return res.data;
}
