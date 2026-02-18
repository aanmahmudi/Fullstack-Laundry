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
  try {
    const res = await fetch(`${API_BASE}${path}`, { headers: { ...getAuthHeaders() } });
    const data = await handleResponse(res);
    return data;
  } catch (e) {
    const alt = API_BASE.includes('8080') ? API_BASE.replace('8080', '8081') : API_BASE.replace('8081', '8080');
    try {
      const res2 = await fetch(`${alt}${path}`, { headers: { ...getAuthHeaders() } });
      const data2 = await handleResponse(res2);
      if (window.API) window.API.BASE_URL = alt;
      return data2;
    } catch (_) {
      throw e;
    }
  }
}

async function apiPost(path, body) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    const data = await handleResponse(res);
    return data;
  } catch (e) {
    const alt = API_BASE.includes('8080') ? API_BASE.replace('8080', '8081') : API_BASE.replace('8081', '8080');
    try {
      const res2 = await fetch(`${alt}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      const data2 = await handleResponse(res2);
      if (window.API) window.API.BASE_URL = alt;
      return data2;
    } catch (_) {
      throw e;
    }
  }
}

async function apiPut(path, body) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    const data = await handleResponse(res);
    return data;
  } catch (e) {
    const alt = API_BASE.includes('8080') ? API_BASE.replace('8080', '8081') : API_BASE.replace('8081', '8080');
    try {
      const res2 = await fetch(`${alt}${path}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(body),
      });
      const data2 = await handleResponse(res2);
      if (window.API) window.API.BASE_URL = alt;
      return data2;
    } catch (_) {
      throw e;
    }
  }
}

async function apiDelete(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    // Handle 204 No Content or empty body
    if (res.status === 204) return null;
    
    if (!res.ok) {
        // reuse error handling
        const text = await res.text();
        let msg = text;
        try {
          const json = JSON.parse(text);
          if (json.message) msg = json.message;
        } catch {}
        throw new Error(msg);
    }
    
    // Try parsing JSON, fallback to text/null
    try {
        return await res.json();
    } catch {
        return null;
    }
  } catch (e) {
     // Retry logic similar to others if needed, or just throw
     throw e;
  }
}

window.API = { apiGet, apiPost, apiPut, apiDelete, BASE_URL: API_BASE };
