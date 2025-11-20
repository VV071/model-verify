const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message || data?.error || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export const api = {
  signIn(payload) {
    return request('/user/sign_in', { method: 'POST', body: payload });
  },
  signUp(payload) {
    return request('/user/sign_up', { method: 'POST', body: payload });
  },
  profile(token) {
    return request('/user/profile', { token });
  },
  registerPalm(token, palmdata) {
    return request('/main/register', { method: 'POST', token, body: { palmdata } });
  },
  verifyPalm(token, palmdata) {
    return request('/main/verify', { method: 'POST', token, body: { palmdata } });
  },
  deletePalm(token) {
    return request('/main/register', { method: 'DELETE', token });
  },
};

