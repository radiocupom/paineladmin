'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import clienteService, { Cliente } from '@/services/cliente';
import { useAuth } from '@/hooks/useAuth';

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);

  // Estados para os campos
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [genero, setGenero] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [pais, setPais] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [receberOfertas, setReceberOfertas] = useState(true);
  const [comoConheceu, setComoConheceu] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [ativo, setAtivo] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    const carregarCliente = async () => {
      try {
        setInitialLoading(true);
        const data = await clienteService.buscarPorId(id);
        setCliente(data);
        
        // Preencher estados
        setNome(data.nome);
        setEmail(data.email);
        setWhatsapp(data.whatsapp);
        setBairro(data.bairro);
        setCidade(data.cidade);
        setEstado(data.estado);
        setGenero(data.genero);
        setDataNascimento(data.dataNascimento.split('T')[0]);
        setPais(data.pais || '');
        setInstagram(data.instagram || '');
        setFacebook(data.facebook || '');
        setTiktok(data.tiktok || '');
        setReceberOfertas(data.receberOfertas);
        setComoConheceu(data.comoConheceu || '');
        setObservacoes(data.observacoes || '');
        setAtivo(data.ativo);
        
      } catch (error) {
        toast.error('Erro ao carregar cliente');
        router.push('/dashboard/clientes');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      carregarCliente();
    }
  }, [id, router]);

  const handleSalvar = async () => {
    const dadosAtualizar: any = {};
    
    if (nome !== cliente?.nome) dadosAtualizar.nome = nome;
    if (email !== cliente?.email) dadosAtualizar.email = email;
    if (whatsapp !== cliente?.whatsapp) dadosAtualizar.whatsapp = whatsapp;
    if (bairro !== cliente?.bairro) dadosAtualizar.bairro = bairro;
    if (cidade !== cliente?.cidade) dadosAtualizar.cidade = cidade;
    if (estado !== cliente?.estado) dadosAtualizar.estado = estado;
    if (genero !== cliente?.genero) dadosAtualizar.genero = genero;
    if (dataNascimento !== cliente?.dataNascimento.split('T')[0]) {
      dadosAtualizar.dataNascimento = dataNascimento;
    }
    if (pais !== cliente?.pais) dadosAtualizar.pais = pais;
    if (instagram !== cliente?.instagram) dadosAtualizar.instagram = instagram;
    if (facebook !== cliente?.facebook) dadosAtualizar.facebook = facebook;
    if (tiktok !== cliente?.tiktok) dadosAtualizar.tiktok = tiktok;
    if (receberOfertas !== cliente?.receberOfertas) {
      dadosAtualizar.receberOfertas = receberOfertas;
    }
    if (comoConheceu !== cliente?.comoConheceu) dadosAtualizar.comoConheceu = comoConheceu;
    if (observacoes !== cliente?.observacoes) dadosAtualizar.observacoes = observacoes;
    if (ativo !== cliente?.ativo) dadosAtualizar.ativo = ativo;

    if (Object.keys(dadosAtualizar).length === 0) {
      toast.info('Nenhuma alteração detectada');
      router.push('/dashboard/clientes');
      return;
    }

    try {
      setLoading(true);
      await clienteService.atualizar(id, dadosAtualizar);
      toast.success('Cliente atualizado com sucesso!');
      router.push('/dashboard/clientes');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar cliente');
    } finally {
      setLoading(false);
    }
  };

  const podeEditar = () => {
    return currentUser?.role === 'superadmin' || currentUser?.role === 'admin';
  };

  if (initialLoading) {
    return (
      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">Carregando cliente...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!cliente) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 sm:h-9 sm:w-9 self-start"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
              Editar Cliente
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
              Editando: {cliente.nome}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Informações do Cliente</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Altere os dados do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-4 sm:space-y-6">
              <Tabs defaultValue="dados" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                  <TabsTrigger value="dados" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
                    Dados Pessoais
                  </TabsTrigger>
                  <TabsTrigger value="endereco" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
                    Endereço
                  </TabsTrigger>
                  <TabsTrigger value="social" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
                    Redes Sociais
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dados" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Nome</Label>
                      <Input 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Email</Label>
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">WhatsApp</Label>
                      <Input 
                        value={whatsapp} 
                        onChange={(e) => setWhatsapp(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Gênero</Label>
                      <Select value={genero} onValueChange={setGenero}>
                        <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MASCULINO" className="text-xs sm:text-sm">Masculino</SelectItem>
                          <SelectItem value="FEMININO" className="text-xs sm:text-sm">Feminino</SelectItem>
                          <SelectItem value="OUTRO" className="text-xs sm:text-sm">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Data de Nascimento</Label>
                      <Input 
                        type="date" 
                        value={dataNascimento} 
                        onChange={(e) => setDataNascimento(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">País</Label>
                      <Input 
                        value={pais} 
                        onChange={(e) => setPais(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 space-y-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="receberOfertas"
                          checked={receberOfertas}
                          onCheckedChange={setReceberOfertas}
                          className="scale-75 sm:scale-100"
                        />
                        <Label htmlFor="receberOfertas" className="text-xs sm:text-sm">
                          Receber ofertas
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="ativo"
                          checked={ativo}
                          onCheckedChange={setAtivo}
                          className="scale-75 sm:scale-100"
                        />
                        <Label htmlFor="ativo" className="text-xs sm:text-sm">
                          Cliente ativo
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="endereco" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Bairro</Label>
                      <Input 
                        value={bairro} 
                        onChange={(e) => setBairro(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Cidade</Label>
                      <Input 
                        value={cidade} 
                        onChange={(e) => setCidade(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Estado</Label>
                      <Input 
                        value={estado} 
                        onChange={(e) => setEstado(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Instagram</Label>
                      <Input 
                        placeholder="@usuario" 
                        value={instagram} 
                        onChange={(e) => setInstagram(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Facebook</Label>
                      <Input 
                        value={facebook} 
                        onChange={(e) => setFacebook(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">TikTok</Label>
                      <Input 
                        placeholder="@usuario" 
                        value={tiktok} 
                        onChange={(e) => setTiktok(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Como conheceu?</Label>
                      <Input 
                        value={comoConheceu} 
                        onChange={(e) => setComoConheceu(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                      <Label className="text-xs sm:text-sm">Observações</Label>
                      <Input 
                        value={observacoes} 
                        onChange={(e) => setObservacoes(e.target.value)} 
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Botões de ação */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSalvar}
                  className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-purple-600"
                  disabled={loading || !podeEditar()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}