import axios from 'axios';
import { API_URL } from '../utils/constants';

// In a real application, this would call the backend API
export const loginUser = async (username: string, password: string) => {
  try {
    // For demo purposes, using mock data
    // In production, this would be an actual API call
    // const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    // return response.data;
    
    // Mock implementation
    if (username === 'admin' && password === 'password123') {
      return {
        id: '1',
        name: 'Admin User',
        username: 'admin',
        role: 'admin',
        token: 'mock-jwt-token'
      };
    } else if (username === 'employee' && password === 'password123') {
      return {
        id: '2',
        name: 'Test Employee',
        username: 'employee',
        role: 'employee',
        token: 'mock-jwt-token'
      };
    } else {
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    throw error;
  }
};

export const checkAuthStatus = async () => {
  try {
    // In a real app, this would verify the JWT token with the server
    // const response = await axios.get(`${API_URL}/auth/status`);
    // return response.data;
    
    // Mock implementation using localStorage
    const storedUser = localStorage.getItem('infinity_user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    throw new Error('Not authenticated');
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // In a real app, this would invalidate the JWT token on the server
    // await axios.post(`${API_URL}/auth/logout`);
    
    // Mock implementation
    localStorage.removeItem('infinity_user');
    return true;
  } catch (error) {
    throw error;
  }
};