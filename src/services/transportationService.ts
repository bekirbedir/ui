import api from './api';
import type { Transportation, TransportationRequest } from '../types';

export const transportationService = {
  getAll: async (): Promise<Transportation[]> => {
    try {
      const response = await api.get('/transportations');
      return response.data;
    } catch (error) {
      console.error('Get all transportations error:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Transportation> => {
    try {
      const response = await api.get(`/transportations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get transportation by id error:', error);
      throw error;
    }
  },

  create: async (transportation: TransportationRequest): Promise<Transportation> => {
    try {
      console.log('Creating transportation:', transportation); // Debug için
      const response = await api.post('/transportations', transportation);
      console.log('Create response:', response.data); // Debug için
      return response.data;
    } catch (error: any) {
      console.error('Create transportation error:', error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id: number, data: Partial<TransportationRequest>): Promise<Transportation> => {
    try {
      console.log('Updating transportation:', id, data); // Debug için
      const response = await api.put(`/transportations/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Update transportation error:', error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/transportations/${id}`);
    } catch (error: any) {
      console.error('Delete transportation error:', error.response?.data || error.message);
      throw error;
    }
  },
};