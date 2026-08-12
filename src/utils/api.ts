const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${cleanBase}${cleanPath}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('sigil_auth_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('X-Role')) {
    const method = options.method ? options.method.toUpperCase() : 'GET';
    if (method !== 'GET') {
      headers.set('X-Role', 'HOST');
    } else {
      headers.set('X-Role', 'GUEST');
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (err: any) {
    if (err.name === 'TypeError' && (err.message === 'Failed to fetch' || err.message.includes('fetch'))) {
      throw new Error(`Unable to connect to backend server at ${BASE_URL}. Ensure server is running on port 5001.`);
    }
    throw err;
  }
}
