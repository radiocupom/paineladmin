export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Candidate {
  inscricao: string;
  nome: string;
  nota: number;
  posicao?: number;
}

export interface DashboardStats {
  totalCandidates: number;
  approvedCandidates: number;
  failedCandidates: number;
  absentCandidates: number;
  averageScore: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}