import axios from "axios";

const DEFAULT_LOCAL_API = "http://localhost:5000/api";
const DEFAULT_PROD_API = "https://frameza-backend.onrender.com/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? DEFAULT_PROD_API : DEFAULT_LOCAL_API);

const API = axios.create({
  baseURL: API_BASE_URL,
});

// attach token (for login later)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;