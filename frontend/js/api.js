// Gunakan API_BASE dari window jika tersedia, default ke port 8081 (Docker BE)
const API_BASE = window.API_BASE || "http://localhost:8081";

function getAuthHeaders() {
  try {
    const u = JSON.parse(localStorage.getItem('laundry_user') || 'null');
    if (u && u.token) return { Authorization: `Bearer ${u.token}` };
  } catch {}
  return {};
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

window.API = { apiGet, apiPost, apiPut };