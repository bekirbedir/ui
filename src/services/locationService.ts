import api from './api';
import type { Location } from '../types';

export const locationService = {
  getAll: async (): Promise<Location[]> => {
    try {
      const response = await api.get('/locations');
      return response.data;
    } catch (error) {
      console.error('Get all locations error:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Location> => {
    try {
      const response = await api.get(`/locations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get location by id error:', error);
      throw error;
    }
  },

  create: async (location: Omit<Location, 'id'>): Promise<Location> => {
    try {
      const response = await api.post('/locations', location);
      return response.data;
    } catch (error) {
      console.error('Create location error:', error);
      throw error;
    }
  },

  update: async (id: number, data: Partial<Location>): Promise<Location> => {
    try {
      const response = await api.put(`/locations/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update location error:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/locations/${id}`);
    } catch (error) {
      console.error('Delete location error:', error);
      throw error;
    }
  },
};