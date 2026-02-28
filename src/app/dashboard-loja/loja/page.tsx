'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Store, Mail, Calendar, Tag, Pencil, Save, X, Upload, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import lojaService from '@/services/loja';
import { cn } from '@/lib/utils';

interface LojaData {
  id: string;
  nome: string;
  email: string;
  logo?: string;
  payment: boolean;
  categoria: string;
  descricao?: string;
  createdAt: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
    role: string;
  };
}

export default function DadosLojaPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loja, setLoja] = useState<LojaData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Estados para o formulário de edição
  const [formData, setFormData] = useState({
    nomeLoja: '',
    categoria: '',
    descricao: '',
    logoFile: null as File | null,
    nomeUsuario: '',
    emailUsuario: '',
    senhaUsuario: '',
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const carregarLoja = async () => {
      try {
        setLoading(true);
        
        const lojaId = (user as any)?.loja?.id || (user as any)?.lojaId;
        
        if (!lojaId) {
          setMessage({ type: 'error', text: 'ID da loja não encontrado' });
          return;
        }

        const response = await api.get(`/lojas/${lojaId}`);
        
        setLoja(response.data);
        
        setFormData({
          nomeLoja: response.data.nome || '',
          categoria: response.data.categoria || '',
          descricao: response.data.descricao || '',
          logoFile: null,
          nomeUsuario: response.data.usuario?.nome || '',
          emailUsuario: response.data.usuario?.email || '',
          senhaUsuario: '',
        });
        
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro ao carregar dados da loja' });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      carregarLoja();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Arquivo muito grande. Máximo 2MB' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Arquivo deve ser uma imagem' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      setFormData(prev => ({ ...prev, logoFile: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!loja) return;
    
    try {
      setSaving(true);
      setMessage(null);
      
      const updateData: any = {
        nomeLoja: formData.nomeLoja,
        categoria: formData.categoria,
        descricao: formData.descricao,
        nomeUsuario: formData.nomeUsuario,
        emailUsuario: formData.emailUsuario,
      };
      
      if (formData.senhaUsuario) {
        updateData.senhaUsuario = formData.senhaUsuario;
      }
      
      if (formData.logoFile) {
        updateData.logo = formData.logoFile;
      }
      
      const lojaAtualizada = await lojaService.atualizarMinhaLoja(updateData);
      
      setLoja(lojaAtualizada);
      setLogoPreview(null);
      setFormData(prev => ({
        ...prev,
        senhaUsuario: '',
        logoFile: null,
      }));
      setEditMode(false);
      setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
      
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Erro ao atualizar os dados' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (loja) {
      setFormData({
        nomeLoja: loja.nome || '',
        categoria: loja.categoria || '',
        descricao: loja.descricao || '',
        logoFile: null,
        nomeUsuario: loja.usuario?.nome || '',
        emailUsuario: loja.usuario?.email || '',
        senhaUsuario: '',
      });
      setLogoPreview(null);
    }
    setEditMode(false);
    setMessage(null);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando dados da loja...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!loja) {
    return (
      <ProtectedRoute allowedRoles={['loja']}>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Nenhum dado da loja encontrado</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-3xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Dados da Loja
          </h1>
          
          {!editMode ? (
            <Button 
              onClick={() => setEditMode(true)}
              className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
            >
              <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Editar Dados
            </Button>
          ) : (
            <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={handleCancel}
                variant="outline"
                disabled={saving}
                className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 w-full xs:w-auto"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={saving}
                className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 bg-green-600 hover:bg-green-700 w-full xs:w-auto"
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          )}
        </div>

        {/* Mensagens de feedback */}
        {message && (
          <div className={cn(
            "p-3 sm:p-4 rounded text-xs sm:text-sm",
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          )}>
            {message.text}
          </div>
        )}
        
        {/* Card principal da loja */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-4">
              <div className="relative self-center xs:self-auto">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  {(logoPreview || loja.logo) ? (
                    <img 
                      src={logoPreview || `https://api.radiocupom.online/${loja.logo?.replace('uploads\\', 'uploads/')}`} 
                      alt={loja.nome} 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-xl sm:text-2xl">
                      {loja.nome?.charAt(0) || 'L'}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                {editMode && (
                  <label 
                    htmlFor="logo-upload"
                    className="absolute -bottom-2 -right-2 bg-orange-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-orange-700 transition-colors"
                  >
                    <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                      disabled={saving}
                    />
                  </label>
                )}
              </div>
              
              <div className="flex-1 min-w-0 w-full xs:w-auto">
                {editMode ? (
                  <Input
                    name="nomeLoja"
                    value={formData.nomeLoja}
                    onChange={handleInputChange}
                    placeholder="Nome da loja"
                    className="text-lg sm:text-2xl font-bold mb-2 h-8 sm:h-10"
                    disabled={saving}
                  />
                ) : (
                  <CardTitle className="text-xl sm:text-2xl truncate">{loja.nome}</CardTitle>
                )}
                
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {editMode ? (
                    <Input
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleInputChange}
                      placeholder="Categoria"
                      className="w-28 sm:w-32 text-xs sm:text-sm h-7 sm:h-8"
                      disabled={saving}
                    />
                  ) : (
                    <Badge variant="outline" className="bg-orange-50 text-xs sm:text-sm">
                      {loja.categoria}
                    </Badge>
                  )}
                  <Badge className={cn(
                    "text-xs sm:text-sm",
                    loja.payment ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  )}>
                    {loja.payment ? 'Ativo' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Grid de informações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Dados da Loja */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Store className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                Informações da Loja
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-2 sm:space-y-3">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                  <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Email
                </p>
                <p className="text-xs sm:text-sm font-medium break-all">{loja.email}</p>
                <p className="text-[8px] sm:text-xs text-gray-400 mt-1">
                  (Não é possível alterar o email da loja)
                </p>
              </div>
              
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500">Descrição</p>
                {editMode ? (
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    placeholder="Descrição da loja"
                    className="mt-1 w-full min-h-[60px] sm:min-h-[80px] rounded-md border border-gray-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    rows={3}
                    disabled={saving}
                  />
                ) : (
                  <p className="text-xs sm:text-sm break-words">{loja.descricao || '-'}</p>
                )}
              </div>
              
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Cadastro
                </p>
                <p className="text-xs sm:text-sm font-medium">{formatarData(loja.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Lojista */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                Dados do Lojista
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-2 sm:space-y-3">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500">Nome</p>
                {editMode ? (
                  <Input
                    name="nomeUsuario"
                    value={formData.nomeUsuario}
                    onChange={handleInputChange}
                    placeholder="Seu nome"
                    disabled={saving}
                    className="h-7 sm:h-8 text-xs sm:text-sm"
                  />
                ) : (
                  <p className="text-xs sm:text-sm font-medium break-all">
                    {loja.usuario?.nome || '-'}
                  </p>
                )}
              </div>
              
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                  <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Email
                </p>
                {editMode ? (
                  <Input
                    name="emailUsuario"
                    type="email"
                    value={formData.emailUsuario}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    disabled={saving}
                    className="h-7 sm:h-8 text-xs sm:text-sm"
                  />
                ) : (
                  <p className="text-xs sm:text-sm font-medium break-all">
                    {loja.usuario?.email || '-'}
                  </p>
                )}
              </div>

              {editMode && (
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Nova Senha</p>
                  <Input
                    name="senhaUsuario"
                    type="password"
                    value={formData.senhaUsuario}
                    onChange={handleInputChange}
                    placeholder="Deixe em branco para não alterar"
                    disabled={saving}
                    className="h-7 sm:h-8 text-xs sm:text-sm"
                  />
                  <p className="text-[8px] sm:text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
                </div>
              )}
              
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500">Role</p>
                <Badge variant="outline" className="capitalize text-[10px] sm:text-xs">
                  {loja.usuario?.role || 'loja'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {editMode && (
          <div className="text-[10px] sm:text-xs text-gray-500 text-center">
            * As alterações serão aplicadas imediatamente após salvar
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}