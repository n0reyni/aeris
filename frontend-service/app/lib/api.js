import axios from "axios";

const API_AUTH = "http://localhost:8081/api/auth";
const API_AI = "http://localhost:8085/api/ai";

// Sauvegarde le token dans localStorage
export const saveToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const removeToken = () => localStorage.removeItem("token");

// Inscription
export const register = async (data) => {
  const response = await axios.post(`${API_AUTH}/register`, data);
  return response.data;
};

// Connexion
export const login = async (data) => {
  const response = await axios.post(`${API_AUTH}/login`, data);
  if (response.data.token) {
    saveToken(response.data.token);
  }
  return response.data;
};

// Chat IA
export const chat = async (message) => {
  const token = getToken();
  const response = await axios.post(
    `${API_AI}/chat`,
    { message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};