// Gunakan API_BASE dari window jika tersedia, default ke port 8080 (Local BE)
const API_BASE = window.API_BASE || "http://localhost:8081";

function getAuthHeaders() {
  try {
    const u = JSON.parse(localStorage.getItem('remon_user') || 'null');
    if (u && u.token) return { Authorization: `Bearer ${u.token}` };
  } catch {}
  return {};
}

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const json = JSON.parse(text);
      if (json.message) msg = json.message;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...getAuthHeaders() } });
  return handleResponse(res);
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

window.API = { apiGet, apiPost, apiPut, BASE_URL: API_BASE };