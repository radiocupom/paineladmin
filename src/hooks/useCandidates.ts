import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Candidate } from '@/types';

export function useCandidates(params?: { search?: string; filter?: string; page?: number }) {
  return useQuery<Candidate[]>({
    queryKey: ['candidates', params],
    queryFn: async () => {
      const response = await api.get('/candidatos', { params });
      return response.data;
    },
  });
}

export function useTopCandidates(limit: number = 10) {
  return useQuery<Candidate[]>({
    queryKey: ['top-candidates', limit],
    queryFn: async () => {
      const response = await api.get(`/candidatos/top?limit=${limit}`);
      return response.data;
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
  });
}