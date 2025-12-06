import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Library,
  ArrowRight,
  BarChart3,
  Sparkles,
  MessageSquare,
  PenTool,
  X,
  Loader2,
  Copy,
  Camera
} from 'lucide-react';

// --- API Helper for Gemini ---
const callGemini = async (prompt: string, systemContext: string = '') => {
  const apiKey = ""; // Injected at runtime
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    systemInstruction: {
      parts: [{ text: systemContext }]
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Falha na API Gemini');

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível gerar uma resposta.";
  } catch (error) {
    console.error(error);
    return "Ocorreu um erro ao consultar o oráculo digital. Tente novamente.";
  }
};

// --- Interfaces ---
interface VerificationLink {
  label: string;
  url: string;
  type: 'google' | 'market';
}

interface CollectionData {
  id: string;
  author: string;
  editionName: string;
  publisher: string;
  probability: number;
  period: string;
  visualCues: string[];
  verificationTip: string;
  links: VerificationLink[];
  spineColor: string;
  spineTextColor: string;
  spineAccent: string;
}

// --- Main Component ---
const BiblioAuthDashboard = () => {
  const [selectedId, setSelectedId] = useState<string>('jackson_machado');
  const [aiMode, setAiMode] = useState<'chat' | 'sales' | null>(null);

  // AI States
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sales Gen States
  const [conditions, setConditions] = useState<string[]>([]);

  // Dados Correlacionados (Atualizados sem a coleção branca)
  const collections: Record<string, CollectionData> = {
    jackson_machado: {
      id: 'jackson_machado',
      author: 'Machado de Assis',
      editionName: 'Obras Completas (31 Volumes)',
      publisher: 'W.M. Jackson Inc.',
      probability: 98,
      period: 'Décadas de 1940-1960',
      visualCues: [
        'Lombada verde-escura (quase preta)',
        'Linhas horizontais douradas',
        'Muitos volumes (31 no total)',
        'Papel amarelado grosso'
      ],
      verificationTip: 'Clássico absoluto. Procure "W.M. Jackson" na folha de rosto. Se tiver todos os 31 volumes, o valor triplica.',
      links: [
        { label: 'Ver capas originais no Google', url: 'https://www.google.com/search?tbm=isch&q=coleção+machado+de+assis+wm+jackson+lombada+verde', type: 'google' },
        { label: 'Consultar valor na Estante Virtual', url: 'https://www.estantevirtual.com.br/busca?q=colecao+machado+de+assis+jackson+31+volumes', type: 'market' }
      ],
      spineColor: 'bg-emerald-950',
      spineTextColor: 'text-yellow-600',
      spineAccent: 'border-yellow-700'
    },
    jackson_alencar: {
      id: 'jackson_alencar',
      author: 'José de Alencar',
      editionName: 'Obras Completas (Edição Jackson)',
      publisher: 'W.M. Jackson Inc.',
      probability: 80,
      period: 'Décadas de 1950-1960',
      visualCues: [
        'Lombada Vermelha / Vinho escuro',
        'Estilo idêntico à do Machado (linhas douradas)',
        'Cerca de 14 a 16 volumes',
        'Geralmente vizinha de estante da coleção Machado'
      ],
      verificationTip: 'Frequentemente confundida com outras encadernações vermelhas. Verifique se o logo na base da lombada é igual ao da coleção verde.',
      links: [
        { label: 'Comparar com fotos reais', url: 'https://www.google.com/search?tbm=isch&q=coleção+josé+de+alencar+wm+jackson+vermelha', type: 'google' },
        { label: 'Verificar preços de mercado', url: 'https://www.estantevirtual.com.br/busca?q=colecao+jose+de+alencar+jackson+completa', type: 'market' }
      ],
      spineColor: 'bg-red-900',
      spineTextColor: 'text-yellow-500',
      spineAccent: 'border-red-950'
    },
    aguilar: {
      id: 'aguilar',
      author: 'Edição de Luxo (Vários)',
      editionName: 'Biblioteca Luso-Brasileira',
      publisher: 'Editora Nova Aguilar',
      probability: 75,
      period: '1960 - Presente',
      visualCues: [
        'Aspeto de "Bíblia" ou dicionário',
        'Capa flexível ou dura imitando couro',
        'Cores: Marrom (Machado), Verde (Alencar), Azul (Poesia)',
        'Papel bíblia (extremamente fino)'
      ],
      verificationTip: 'O papel é a chave. Se for fino como papel de bíblia e tiver fitilho marcador, é Aguilar. São os livros mais valiosos individualmente.',
      links: [
        { label: 'Ver fotos da Edição Aguilar', url: 'https://www.google.com/search?tbm=isch&q=machado+de+assis+obra+completa+aguilar+couro', type: 'google' },
        { label: 'Preço de colecionador', url: 'https://www.estantevirtual.com.br/busca?q=machado+de+assis+obra+completa+aguilar', type: 'market' }
      ],
      spineColor: 'bg-amber-900',
      spineTextColor: 'text-yellow-500',
      spineAccent: 'border-amber-950'
    }
  };

  const current = collections[selectedId];

  // --- AI Handlers ---

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setIsLoading(true);
    const userQ = aiInput;
    setAiInput(''); // Clear input immediately

    // Initial placeholder
    setAiResponse("Consultando a biblioteca virtual...");

    const systemPrompt = `Você é um especialista em livros raros brasileiros e bibliófilo experiente. O usuário está examinando a coleção "${current.editionName}" de ${current.author}, publicada pela ${current.publisher} (${current.period}).
    Responda em Português do Brasil. Seja culto mas acessível. Dê detalhes históricos sobre essa edição específica se souber.
    Se perguntarem sobre valor, dê uma estimativa genérica de mercado para livros usados, mas avise que varia conforme o estado (oxidação, traças, lombada).`;

    const result = await callGemini(userQ, systemPrompt);
    setAiResponse(result);
    setIsLoading(false);
  };

  const handleSalesGenerator = async () => {
    setIsLoading(true);
    setAiResponse("Redigindo anúncio vendedor...");

    const conditionText = conditions.length > 0 ? conditions.join(', ') : "Estado geral bom, com sinais naturais do tempo";

    const prompt = `Crie uma descrição de venda atraente e profissional para o site 'Estante Virtual' ou 'Mercado Livre'.
    Livro/Coleção: ${current.editionName} de ${current.author}.
    Editora: ${current.publisher}.
    Período: ${current.period}.
    Estado de Conservação: ${conditionText}.

    Estrutura da resposta:
    1. Título do Anúncio (Chamativo - use Caps Lock em palavras chaves)
    2. Descrição Bibliográfica (Destaque o valor histórico da edição ${current.publisher})
    3. Checklist do Estado (Baseado em: ${conditionText})
    4. "Call to Action" para colecionador

    Use emojis de livros/antiguidades moderadamente.`;

    const result = await callGemini(prompt, "");
    setAiResponse(result);
    setIsLoading(false);
  };

  const toggleCondition = (cond: string) => {
    setConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  // --- Components ---

  const SpinePreview = ({ type }: { type: string }) => {
    // MACHADO (JACKSON) - VERDE
    if (type === 'jackson_machado') {
      return (
        <div className="w-14 h-64 bg-emerald-950 rounded-sm border-r-2 border-emerald-900 flex flex-col items-center py-4 shadow-2xl relative mx-auto transform hover:scale-105 transition-transform duration-300">
          <div className="w-full h-px bg-yellow-600/60 mb-1"></div>
          <div className="w-full h-px bg-yellow-600/60 mb-8"></div>
          <div className="w-10 h-16 border border-yellow-600/40 flex items-center justify-center bg-black/20">
             <span className="text-[8px] text-yellow-600 font-serif text-center uppercase leading-tight">Machado<br/>de<br/>Assis</span>
          </div>
          <div className="mt-auto w-full h-px bg-yellow-600/60 mb-1"></div>
          <div className="w-full h-px bg-yellow-600/60 mb-4"></div>
          <span className="text-[7px] text-yellow-600 mb-2 font-serif tracking-widest">JACKSON</span>
        </div>
      );
    }
    // ALENCAR (JACKSON) - VERMELHA
    if (type === 'jackson_alencar') {
      return (
        <div className="w-14 h-64 bg-red-900 rounded-sm border-r-2 border-red-950 flex flex-col items-center py-4 shadow-2xl relative mx-auto transform hover:scale-105 transition-transform duration-300">
          <div className="w-full h-px bg-yellow-500/60 mb-1"></div>
          <div className="w-full h-px bg-yellow-500/60 mb-8"></div>
          <div className="w-10 h-16 border border-yellow-500/40 flex items-center justify-center bg-black/10">
             <span className="text-[8px] text-yellow-500 font-serif text-center uppercase leading-tight">José<br/>de<br/>Alencar</span>
          </div>
          <div className="mt-auto w-full h-px bg-yellow-500/60 mb-1"></div>
          <div className="w-full h-px bg-yellow-500/60 mb-4"></div>
          <span className="text-[7px] text-yellow-500 mb-2 font-serif tracking-widest">JACKSON</span>
        </div>
      );
    }
    // AGUILAR - COURO
    return (
      <div className="w-16 h-64 bg-amber-900 rounded-l-md rounded-r-sm border-r-4 border-amber-950 flex flex-col items-center py-4 shadow-2xl relative mx-auto transform hover:scale-105 transition-transform duration-300">
        <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
        <div className="w-12 h-px bg-yellow-500/50 mt-2"></div>
        <div className="w-12 h-10 border border-yellow-500/30 mt-2 flex items-center justify-center">
            <span className="text-[6px] text-yellow-500 font-bold text-center">OBRA<br/>COMPLETA</span>
        </div>
        <span className="mt-12 text-[8px] text-yellow-400 font-serif text-center uppercase tracking-widest px-2">Machado<br/>Alencar<br/>Outros</span>
        <span className="mt-auto mb-4 text-[8px] text-yellow-600 font-bold">AGUILAR</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">

      {/* Cabeçalho */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Library className="w-8 h-8 text-indigo-700" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Identificador de Coleções Raras</h1>
        </div>
        <p className="text-slate-600 ml-11">Análise ajustada: Focando em encadernações clássicas (Jackson e Aguilar).</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Painel Esquerdo: Seleção da Coleção */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Hipóteses Visuais</h3>

          {Object.values(collections).map((item) => (
            <button
              key={item.id}
              onClick={() => { setSelectedId(item.id); setAiMode(null); setAiResponse(''); }}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden ${
                selectedId === item.id
                  ? 'border-indigo-600 bg-white shadow-lg ring-1 ring-indigo-100'
                  : 'border-white bg-white/60 hover:border-indigo-200 hover:bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${selectedId === item.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                  {item.probability}% Confiança
                </span>
                {selectedId === item.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
              </div>
              <h4 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700 transition-colors">
                {item.author}
              </h4>
              <p className="text-sm text-slate-500">{item.publisher}</p>

              {/* Barra de cor indicativa */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.spineColor}`}></div>
            </button>
          ))}
        </div>

        {/* Painel Central: Dossier Detalhado */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">

            {/* Header do Dossier */}
            <div className={`text-white p-6 md:p-8 relative overflow-hidden flex-shrink-0 transition-colors duration-500 ${
              selectedId === 'jackson_machado' ? 'bg-emerald-900' :
              selectedId === 'jackson_alencar' ? 'bg-red-900' : 'bg-amber-900'
            }`}>
              <div className="absolute top-0 right-0 p-32 bg-white rounded-full blur-3xl opacity-10 -mr-16 -mt-16"></div>

              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0 hidden md:block">
                  <SpinePreview type={current.id} />
                </div>

                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 text-white/70 mb-1 font-mono text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>Dossier #{current.id.toUpperCase()}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight text-white">{current.editionName}</h2>
                  <p className="text-lg md:text-xl text-white/90 font-light">{current.author}</p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {/* Botões de Ação IA */}
                    <button
                      onClick={() => setAiMode('chat')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="flex items-center gap-1">Bibliotecário IA <Sparkles className="w-3 h-3 text-yellow-400" /></span>
                    </button>

                    <button
                      onClick={() => setAiMode('sales')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white text-slate-900 hover:bg-indigo-50`}
                    >
                      <PenTool className="w-4 h-4" />
                      <span className="flex items-center gap-1">Gerar Anúncio de Venda</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo Variável: Dossier Normal ou IA */}
            <div className="flex-1 relative">

              {/* Overlay da IA */}
              {aiMode && (
                 <div className="absolute inset-0 bg-slate-50 z-20 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between p-4 border-b bg-white">
                      <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                        {aiMode === 'chat' ? (
                          <> <MessageSquare className="w-5 h-5" /> Chat com Especialista (Gemini) </>
                        ) : (
                          <> <PenTool className="w-5 h-5" /> Assistente de Vendas (Gemini) </>
                        )}
                      </h3>
                      <button onClick={() => setAiMode(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">

                      {/* Modo Vendas: Seletores */}
                      {aiMode === 'sales' && !aiResponse && !isLoading && (
                        <div className="space-y-6 max-w-2xl mx-auto">
                          <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Selecione as condições dos livros:</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {['Páginas Amareladas (Oxidação)', 'Lombada Solta', 'Sem Grifos', 'Capa com Desgaste', 'Coleção Completa', 'Volume Avulso', 'Assinatura de Posse', 'Papel Quebradiço', 'Livre de Traças'].map(cond => (
                                <button
                                  key={cond}
                                  onClick={() => toggleCondition(cond)}
                                  className={`text-sm p-2 rounded border text-left transition-colors ${conditions.includes(cond) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                >
                                  {cond}
                                </button>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={handleSalesGenerator}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" /> Escrever Anúncio Otimizado
                          </button>
                        </div>
                      )}

                      {/* Modo Chat: Input Inicial */}
                      {aiMode === 'chat' && !aiResponse && !isLoading && (
                        <div className="max-w-2xl mx-auto text-center mt-12">
                          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-indigo-600" />
                          </div>
                          <h4 className="text-xl font-bold text-slate-800 mb-2">Consultar Especialista</h4>
                          <p className="text-slate-500 mb-6">Tire dúvidas sobre a raridade, história ou conteúdo da coleção {current.author}.</p>

                          <form onSubmit={handleChatSubmit} className="relative">
                            <input
                              type="text"
                              value={aiInput}
                              onChange={(e) => setAiInput(e.target.value)}
                              placeholder={`Ex: Esta edição da ${current.publisher} é considerada rara?`}
                              className="w-full p-4 pr-12 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                              autoFocus
                            />
                            <button type="submit" className="absolute right-3 top-3 p-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                              <ArrowRight className="w-5 h-5" />
                            </button>
                          </form>
                        </div>
                      )}

                      {/* Loading State */}
                      {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-600" />
                          <p>O Gemini está analisando os dados bibliográficos...</p>
                        </div>
                      )}

                      {/* Response State */}
                      {aiResponse && !isLoading && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
                           <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line">
                             {aiResponse}
                           </div>
                           <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                             <button
                               onClick={() => {navigator.clipboard.writeText(aiResponse)}}
                               className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 px-3 py-1 rounded hover:bg-slate-50"
                             >
                               <Copy className="w-4 h-4" /> Copiar Texto
                             </button>
                             <button
                               onClick={() => {setAiResponse(''); setAiInput('');}}
                               className="text-sm px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                             >
                               Nova Consulta
                             </button>
                           </div>
                        </div>
                      )}

                    </div>
                 </div>
              )}

              {/* Dossier Normal (Sem IA) */}
              <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 h-full overflow-y-auto">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-indigo-600" />
                    Características Visuais
                  </h3>
                  <ul className="space-y-3">
                    {current.visualCues.map((cue, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                          selectedId === 'jackson_machado' ? 'bg-emerald-600' :
                          selectedId === 'jackson_alencar' ? 'bg-red-600' : 'bg-amber-600'
                        }`}></div>
                        <span className="text-sm">{cue}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-yellow-800 text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Ponto de Atenção
                    </h4>
                    <p className="text-sm text-yellow-800/80 leading-relaxed">
                      {current.verificationTip}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      Índice de Confiança
                    </h3>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                            Match Visual
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-indigo-600">
                            {current.probability}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
                        <div style={{ width: `${current.probability}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-1000 ease-out"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Verificação Externa</h4>
                    {current.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-indigo-300 hover:shadow-md transition-all group"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          {link.type === 'google' ? <Camera className="w-4 h-4 text-blue-500" /> : <BookOpen className="w-4 h-4 text-green-600" />}
                          {link.label}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiblioAuthDashboard;
