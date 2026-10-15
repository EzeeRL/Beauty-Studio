// Cliente HTTP del panel admin: manda el token en cada petición, guarda el
// token renovado que devuelve el back (X-Refresh-Token) y si recibe un 401
// cierra la sesión de admin para volver a pedir la contraseña.
import axios from "axios";

export const API = "https://eve-back.vercel.app";

const TOKEN_KEY = "adminToken";
const REFRESH_HEADER = "x-refresh-token";
export const ADMIN_LOGOUT_EVENT = "admin-logout";

export const getAdminToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const setAdminToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // localStorage puede no estar disponible (modo privado, etc.)
  }
};

export const logoutAdmin = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // idem
  }
  window.dispatchEvent(new Event(ADMIN_LOGOUT_EVENT));
};

const saveRefreshedToken = (token) => {
  if (token) setAdminToken(token);
};

const adminApi = axios.create();

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => {
    saveRefreshedToken(res.headers[REFRESH_HEADER]);
    return res;
  },
  (error) => {
    if (error.response?.status === 401) logoutAdmin();
    return Promise.reject(error);
  },
);

// Igual que fetch(), pero con el token de admin (para componentes que usan fetch)
export const adminFetch = async (url, options = {}) => {
  const token = getAdminToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  saveRefreshedToken(res.headers.get(REFRESH_HEADER));
  if (res.status === 401) logoutAdmin();
  return res;
};

export const loginAdmin = async (email, password) => {
  const res = await axios.post(`${API}/auth/admin/login`, { email, password });
  setAdminToken(res.data.token);
};

// Confirma que el token guardado sigue vivo (y lo renueva)
export const verifyAdmin = async () => {
  const res = await adminApi.get(`${API}/auth/admin/verify`);
  saveRefreshedToken(res.data.token);
};

export default adminApi;
