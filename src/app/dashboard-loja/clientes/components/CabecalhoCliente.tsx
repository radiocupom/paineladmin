'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Gift,
  Heart,
  Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface CabecalhoClienteProps {
  cliente: {
    id: string;
    nome: string;
    email: string;
    whatsapp: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    pais: string;
    genero?: string;
    dataNascimento?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    receberOfertas: boolean;
    comoConheceu?: string;
    observacoes?: string;
    ativo: boolean;
    createdAt: string;
    updatedAt: string;
    ultimoLogin?: string;
  };
  totalResgates?: number;
}

export function CabecalhoCliente({ cliente, totalResgates = 0 }: CabecalhoClienteProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('resumo');

  // Pega as iniciais do nome para o avatar
  const iniciais = cliente.nome
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatarData = (data?: string) => {
    if (!data) return 'Não informado';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarDataNascimento = (data?: string) => {
    if (!data) return 'Não informado';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarTelefone = (telefone: string) => {
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
    }
    return telefone;
  };

  const calcularIdade = (dataNascimento?: string) => {
    if (!dataNascimento) return null;
    const nasc = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  const idade = calcularIdade(cliente.dataNascimento);

  return (
    <div className="space-y-4">
      {/* Cabeçalho superior com botão voltar */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8 sm:h-9 sm:w-9"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Detalhes do Cliente
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Histórico completo de resgates
          </p>
        </div>
      </div>

      {/* Card principal com avatar e informações básicas */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
          {/* Avatar com iniciais e status */}
          <div className="relative">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl sm:text-3xl font-semibold">
                {iniciais}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              {cliente.ativo ? (
                <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 bg-white rounded-full" />
              )}
            </div>
          </div>

          {/* Informações rápidas */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {cliente.nome}
              </h2>
              <div className="flex gap-2">
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                  {totalResgates} {totalResgates === 1 ? 'resgate' : 'resgates'}
                </Badge>
                {idade && (
                  <Badge variant="outline" className="text-gray-600">
                    {idade} anos
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${cliente.email}`} className="hover:text-orange-600 hover:underline">
                  {cliente.email}
                </a>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Phone className="h-4 w-4" />
                <a 
                  href={`https://wa.me/${cliente.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-600 hover:underline"
                >
                  {formatarTelefone(cliente.whatsapp)}
                </a>
              </div>
              {(cliente.cidade && cliente.estado) && (
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{cliente.cidade}/{cliente.estado}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Abas com informações detalhadas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="pessoal">Pessoal</TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="localizacao">Localização</TabsTrigger>
          <TabsTrigger value="social" className="hidden lg:block">Social</TabsTrigger>
          <TabsTrigger value="sistema" className="hidden lg:block">Sistema</TabsTrigger>
        </TabsList>

        {/* Aba Resumo */}
        <TabsContent value="resumo">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" /> Dados Pessoais
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Gênero:</span> {cliente.genero || 'Não informado'}</p>
                    <p><span className="text-gray-500">Nascimento:</span> {formatarDataNascimento(cliente.dataNascimento)} {idade && `(${idade} anos)`}</p>
                    <p><span className="text-gray-500">Como conheceu:</span> {cliente.comoConheceu || 'Não informado'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Gift className="h-4 w-4" /> Preferências
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">Receber ofertas:</span>{' '}
                      <Badge variant={cliente.receberOfertas ? "default" : "secondary"} className="ml-2">
                        {cliente.receberOfertas ? 'Sim' : 'Não'}
                      </Badge>
                    </p>
                    <p><span className="text-gray-500">Status:</span>{' '}
                      <Badge variant={cliente.ativo ? "default" : "destructive"} className="ml-2">
                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </p>
                  </div>
                </div>

                {cliente.observacoes && (
                  <div className="col-span-2 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Observações
                    </h3>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{cliente.observacoes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Pessoal */}
        <TabsContent value="pessoal">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Informações Pessoais</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Nome completo:</span> {cliente.nome}</p>
                    <p><span className="text-gray-500">Gênero:</span> {cliente.genero || 'Não informado'}</p>
                    <p><span className="text-gray-500">Data de nascimento:</span> {formatarDataNascimento(cliente.dataNascimento)}</p>
                    <p><span className="text-gray-500">Idade:</span> {idade ? `${idade} anos` : 'Não informado'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Como conheceu</h3>
                  <p className="text-sm">{cliente.comoConheceu || 'Não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Contato */}
        <TabsContent value="contato">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </h3>
                  <a href={`mailto:${cliente.email}`} className="text-sm hover:text-orange-600 hover:underline">
                    {cliente.email}
                  </a>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" /> WhatsApp
                  </h3>
                  <a 
                    href={`https://wa.me/${cliente.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-orange-600 hover:underline"
                  >
                    {formatarTelefone(cliente.whatsapp)}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Localização */}
        <TabsContent value="localizacao">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Endereço</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Bairro:</span> {cliente.bairro || 'Não informado'}</p>
                    <p><span className="text-gray-500">Cidade:</span> {cliente.cidade || 'Não informado'}</p>
                    <p><span className="text-gray-500">Estado:</span> {cliente.estado || 'Não informado'}</p>
                    <p><span className="text-gray-500">País:</span> {cliente.pais}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Social */}
        <TabsContent value="social">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cliente.instagram && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Instagram className="h-4 w-4" /> Instagram
                    </h3>
                    <a 
                      href={`https://instagram.com/${cliente.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-orange-600 hover:underline"
                    >
                      {cliente.instagram}
                    </a>
                  </div>
                )}

                {cliente.facebook && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Facebook className="h-4 w-4" /> Facebook
                    </h3>
                    <a 
                      href={`https://facebook.com/${cliente.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-orange-600 hover:underline"
                    >
                      {cliente.facebook}
                    </a>
                  </div>
                )}

                {cliente.tiktok && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Twitter className="h-4 w-4" /> TikTok
                    </h3>
                    <a 
                      href={`https://tiktok.com/@${cliente.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-orange-600 hover:underline"
                    >
                      {cliente.tiktok}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Sistema */}
        <TabsContent value="sistema">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Datas
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Cadastrado em:</span> {formatarData(cliente.createdAt)}</p>
                    <p><span className="text-gray-500">Atualizado em:</span> {formatarData(cliente.updatedAt)}</p>
                    {cliente.ultimoLogin && (
                      <p><span className="text-gray-500">Último login:</span> {formatarData(cliente.ultimoLogin)}</p>
                    )}
                  </div>
                </div> 
               
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}