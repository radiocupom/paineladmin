'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { useAuth } from '@/hooks/useAuth';
import cupomService from '@/services/cupom';
import clienteService from '@/services/cliente';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Components
import { CabecalhoCliente } from '../components/CabecalhoCliente';
 
import { MetricasCliente } from '../components/MetricasCliente';
import { TabelaResgatesCliente } from '../components/TabelaResgatesCliente';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';

// Types
import { Cliente, Resgate, CupomInfo, MetricasCliente as MetricasType } from '../types/cliente.types';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  loja?: {
    id: string;
    nome: string;
  };
  lojaId?: string;
}

export default function DetalheClientePage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth() as { user: Usuario | null; loading: boolean };
  
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [resgates, setResgates] = useState<Resgate[]>([]);
  const [cupons, setCupons] = useState<CupomInfo[]>([]);
  const [metricas, setMetricas] = useState<MetricasType>({
    totalResgates: 0,
    totalGasto: 0,
    totalEconomia: 0,
    cuponsUnicos: 0,
    mediaPorResgate: 0
  });

  useEffect(() => {
    if (!authLoading && params.id) {
      carregarDados();
    }
  }, [params.id, authLoading, user]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Usuário atual:', user);
      
      const lojaId = user?.loja?.id || user?.lojaId;
      
      if (!lojaId) {
        console.error('❌ Usuário sem loja associada:', user);
        toast.error('ID da loja não encontrado');
        setLoading(false);
        return;
      }

      console.log('🔍 Buscando cupons da loja...');
      const cuponsData = await cupomService.listarMeusCupons();
      setCupons(cuponsData);

      console.log('🔍 Buscando cliente da loja:', { lojaId, clienteId: params.id });
      
      const clienteData = await clienteService.buscarClienteDaLoja(lojaId, params.id as string);
      console.log('✅ Cliente com resgates:', clienteData);
      
      setCliente(clienteData);
      setResgates(clienteData.resgates || []);

      // Calcular métricas
      const cuponsUtilizados = new Set();
      let totalGasto = 0;
      let totalEconomia = 0;
      let totalResgates = 0;

      clienteData.resgates?.forEach(r => {
        const cupom = cuponsData.find(c => c.id === r.cupomId);
        cuponsUtilizados.add(r.cupom?.codigo || r.cupomId);
        totalResgates += r.quantidade;
        
        if (cupom) {
          const valorOriginal = (cupom.precoOriginal || 0) * r.quantidade;
          const valorPago = (cupom.precoComDesconto || cupom.precoOriginal || 0) * r.quantidade;
          totalGasto += valorPago;
          totalEconomia += valorOriginal - valorPago;
        }
      });

      setMetricas({
        totalResgates,
        totalGasto,
        totalEconomia,
        cuponsUnicos: cuponsUtilizados.size,
        mediaPorResgate: totalResgates > 0 ? totalGasto / totalResgates : 0,
        primeiroResgate: clienteData.resgates?.[0]?.resgatadoEm,
        ultimoResgate: clienteData.resgates?.[clienteData.resgates.length - 1]?.resgatadoEm
      });

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (authLoading || loading) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <LoadingState />
      </ProtectedRoute>
    );
  }

  if (!cliente) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <EmptyState />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        {/* 🔥 PASSANDO A PROP cliente CORRETAMENTE */}
        <CabecalhoCliente 
  cliente={cliente}
  totalResgates={resgates.length}
/>
        
       
        <MetricasCliente metricas={metricas} formatarMoeda={formatarMoeda} />
        <TabelaResgatesCliente 
          resgates={resgates} 
          cupons={cupons} 
          formatarMoeda={formatarMoeda} 
          formatarData={formatarData} 
        />
      </div>
    </ProtectedRoute>
  );
}