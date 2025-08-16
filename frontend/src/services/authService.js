import axios from 'axios';

const API_URL = "http://localhost:5000/api/auth/";

export const register = (name, email, password) => {
    return axios.post(API_URL + "register", { name, email, password });
};

export const login = (email, password) => {
    return axios.post(API_URL + "login", { email, password });
};
