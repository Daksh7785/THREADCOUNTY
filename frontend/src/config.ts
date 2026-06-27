export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return origin;
  }
  return 'http://localhost:5000';
};

export const API = getApiBaseUrl();
export const API_URL = `${API}/api`;

export const getImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = API.endsWith('/api') ? API.slice(0, -4) : API;
  return `${base}/${path}`;
};
