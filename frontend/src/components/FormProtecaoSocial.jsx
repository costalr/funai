import { useEffect, useState } from "react";
import { supabaseAssistencia } from "../lib/Supabase/supabaseAssistencia"
import { supabaseCestas } from "../lib/Supabase/supabaseCestas"
import * as exifr from 'exifr';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import {
  Grid,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Button,
  Autocomplete, 
  MenuItem
} from "@mui/material";




export default function FormularioProtecao() {
  const [servidor, setServidor] = useState("");
  function toTitleCase(str) {
  return (str || "")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

  function splitFullName(full) {
    const p = (full || "").trim().split(/\s+/);
    if (p.length === 0) return { nome: "", sobrenome: "" };
    if (p.length === 1) return { nome: p[0], sobrenome: "" };
    return { nome: p[0], sobrenome: p.slice(1).join(" ") };
  }

  function joinFullName(nome, sobrenome) {
    return [nome, sobrenome].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  }
  const [genero, setGenero] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [coordenadas, setCoordenadas] = useState({ latitude: null, longitude: null });
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [comunidades, setComunidades] = useState([]);
  const [usaFiltroNascimento, setUsaFiltroNascimento] = useState(false);
  const [comunidadeSelecionada, setComunidadeSelecionada] = useState(null);
  const [comunidadeManual, setComunidadeManual] = useState("");
  const [poloBaseManual, setPoloBaseManual] = useState("");
  const [polosBase, setPolosBase] = useState([]);
    useEffect(() => {
      const fetchPolosBase = async () => {
        const { data, error } = await supabaseCestas
          .from("subpolo")
          .select("id_subpolo, nome_subpolo")
          .order("nome_subpolo", { ascending: true });

        if (!error) {
          setPolosBase(data);
        } else {
          console.error("Erro ao buscar polos base:", error);
        }
      };

      fetchPolosBase();
    }, []);


  const [adultos, setAdultos] = useState(0);
  const [criancas, setCriancas] = useState(0);
  const [idosos, setIdosos] = useState(0);
  const [modalDeslocamento, setModalDeslocamento] = useState({
  terrestre: [],
  fluvial: [],
  aereo: [],
});
  const [orgaos, setOrgaos] = useState({ viatura: "", embarcacao: "", aereo: "" });
  const [opcaoOrgao, setOpcaoOrgao] = useState({ viatura: "", embarcacao: "", aereo: "" });
  const orgaosDisponiveis = ["DSEI-Y", "FUNAI", "Exército"];
  const [tempoDeslocamento, setTempoDeslocamento] = useState("");
  const [tipoAtendimento, setTipoAtendimento] = useState([]);
  const [assistenciaSelecionada, setAssistenciaSelecionada] = useState([]);
  const [precisaInterprete, setPrecisaInterprete] = useState(false);
  const [assistenciaDetalhes, setAssistenciaDetalhes] = useState({ baixa: {}, bpc: {}, alta: {}, outros: "" });
  const normalizeMunicipio = (nome) =>
  nome.normalize("NFD") // remove acentos
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const [previdenciaSelecionada, setPrevidenciaSelecionada] = useState([]);
  const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("usuario");
  window.location.href = "/login"; // força recarregamento limpo
  };
  const [previdenciaDetalhes, setPrevidenciaDetalhes] = useState({
    salario_maternidade: {},
    aposentadoria: {},
    pensao_morte: {},
    auxilio_incapacidade: {},
    auxilio_reclusao: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentacaoSelecionada, setDocumentacaoSelecionada] = useState([]);
  const [documentacaoDetalhes, setDocumentacaoDetalhes] = useState({});
  const [saudeSelecionada, setSaudeSelecionada] = useState([]);
  const [localUnidade, setLocalUnidade] = useState("");
  const [saudeDetalhes, setSaudeDetalhes] = useState({ outros: "" });
  const [segAlimentarSelecionada, setSegAlimentarSelecionada] = useState([]);
  const [segAlimentarDetalhes, setSegAlimentarDetalhes] = useState({ refeicao: 0, cesta: 0, outros: "", imagemEntrega: null  });
  const [avisoFoto, setAvisoFoto] = useState(null);
  const [previdenciaOutrosTexto, setPrevidenciaOutrosTexto] = useState("");
  const [dataAtendimento, setDataAtendimento] = useState("");
  const [outrosModais, setOutrosModais] = useState({
  terrestre: "",
  fluvial: "",
  aereo: ""
    });
  const handleSelectOrgao = (tipo, valor) => {
    setOpcaoOrgao((prev) => ({ ...prev, [tipo]: valor }));
    setOrgaos((prev) => ({ ...prev, [tipo]: valor }));
  };
  const [outrosDetalhes, setOutrosDetalhes] = useState({
    insumos: false,
    rede_dormir: false,
    rede_dormir_qtd: 0,
    outros: false,
    outros_qtd: 0,
    banco: false,
    comercio: false,
    delegacia: false,
    artesanato: false,
    apoio_logistico: false,
    combustivel: false,
    combustivel_qtd: 0,
    deslocamento_aereo: false,
    deslocamento_terrestre: false,
    deslocamento_fluvial: false
  });
  const [observacoes, setObservacoes] = useState("");
  const [erros, setErros] = useState([]);
 const validarFormulario = () => {
  const novosErros = [];

  if (!nome.trim()) {
  novosErros.push("O nome é obrigatório.");
  }
  if (!sobrenome.trim()) {
    novosErros.push("O sobrenome é obrigatório.");
  }

  if (!comunidadeSelecionada) {
    novosErros.push("A comunidade é obrigatória.");
  }

  if (
    ["Boa Vista", "São Gabriel da Cachoeira", "Santa Isabel do Rio Negro", "Barcelos"].includes(municipio) &&
    !localUnidade
  ) {
    novosErros.push("O campo 'Interno ou Externo' é obrigatório para esse município.");
  }

  const algumModalSelecionado = Object.values(modalDeslocamento).some((arr) => arr.length > 0);
  if (!algumModalSelecionado) {
    novosErros.push("Selecione pelo menos um modal de deslocamento.");
  }

  if (modalDeslocamento.terrestre.includes("Viatura Oficial") && !orgaos.viatura.trim()) {
    novosErros.push("Preencha o órgão responsável pela Viatura Oficial.");
  }

  if (modalDeslocamento.fluvial.includes("Embarcação Oficial") && !orgaos.embarcacao.trim()) {
    novosErros.push("Preencha o órgão responsável pela Embarcação Oficial.");
  }

  if (modalDeslocamento.aereo.includes("Frete aéreo Oficial") && !orgaos.aereo.trim()) {
    novosErros.push("Preencha o órgão responsável pelo Frete aéreo Oficial.");
  }

  if (!tempoDeslocamento) {
    novosErros.push("O tempo de deslocamento é obrigatório.");
  }

  if (tipoAtendimento.length === 0) {
    novosErros.push("Selecione pelo menos um tipo de atendimento.");
  }

  setErros(novosErros);
  return novosErros.length === 0;
};
const handleSubmit = async () => {
  if (!validarFormulario()) return;

  if (showSugestoes) {
    alert("Antes de salvar, escolha um cadastro sugerido ou clique em 'Criar novo cadastro mesmo assim'.");
    return;
  }
  if (isSubmitting) return;

  setIsSubmitting(true);

  try {
const nomeCompletoTitle = toTitleCase(joinFullName(nome, sobrenome));
let idPessoa = idPessoaSelecionada ?? null;


  if (!idPessoa) {
    let qbPessoa = supabaseAssistencia
   .from("pessoa_atendida")
   .select("id_pessoa")
   .eq("nome", nomeCompletoTitle)
  .limit(1);
  if (dataNascimento) qbPessoa = qbPessoa.eq("data_nascimento", dataNascimento);
  const { data: jaExiste, error: erroChecagem } = await qbPessoa.maybeSingle();

    if (erroChecagem) {
      alert("Falha ao checar pessoa: " + erroChecagem.message);
      setIsSubmitting(false);
      return;
    }

    if (jaExiste?.id_pessoa) {
      // ✅ Já existe: usa o id e NÃO cria de novo
      idPessoa = jaExiste.id_pessoa;
    } else {
      // ✅ Não existe: cria
      const { data: novaPessoa, error: erroNovaPessoa } = await supabaseAssistencia
        .from("pessoa_atendida")
        .insert([{
          nome: nomeCompletoTitle,
          genero: genero || null,
          data_nascimento: dataNascimento || null,
          id_comunidade: comunidadeSelecionada?.value === "outros"
            ? null
            : (comunidadeSelecionada?.value ? Number(comunidadeSelecionada.value) : null),
        }])
        .select("id_pessoa")
        .single();

      // Se outra pessoa criou "ao mesmo tempo", pode vir 23505: pega a já existente e segue.
      if (erroNovaPessoa) {
        // 23505 = unique_violation
        if (erroNovaPessoa.code === "23505") {
          const { data: again } = await supabaseAssistencia
            .from("pessoa_atendida")
            .select("id_pessoa")
            .eq("nome", nomeCompletoTitle)
            .maybeSingle();
          if (again?.id_pessoa) {
            idPessoa = again.id_pessoa;
          } else {
            alert("Erro ao salvar pessoa atendida: " + erroNovaPessoa.message);
            setIsSubmitting(false);
            return;
          }
        } else {
          alert("Erro ao salvar pessoa atendida: " + erroNovaPessoa.message);
          setIsSubmitting(false);
          return;
        }
      } else {
        idPessoa = novaPessoa.id_pessoa;
      }
    }
  }

  if (!idPessoa) {
    alert("Não foi possível obter o id da pessoa.");
    setIsSubmitting(false);
    return;
  }

      // coordenadas (normalizadas)
    const lat = Number.isFinite(+coordenadas?.latitude) ? +coordenadas.latitude : null;
    const lon = Number.isFinite(+coordenadas?.longitude) ? +coordenadas.longitude : null;

    // 3) informacoes_pessoais
    const { data: atendimentoData, error: atendimentoError } = await supabaseAssistencia
      .from("informacoes_pessoais")
      .insert([{
        id_pessoa: idPessoa,
        nome_servidor: servidor || null,
        data_hora: dataHora || null,
        nome_atendido: nomeCompletoTitle,
        comunidade: comunidadeSelecionada?.value === "outros"
          ? (comunidadeManual || null)
          : (comunidadeSelecionada?.label || null),
        polo_base: comunidadeSelecionada?.value === "outros"
          ? (poloBaseManual || null)
          : (comunidadeSelecionada?.subpolo?.nome_subpolo || null),
        polo: comunidadeSelecionada?.subpolo?.polo?.nome_polo || null,
        municipio: municipio || null,
        // 👇 aqui estava "tipoUnidade"; use o state correto
        tipo_unidade: localUnidade || null,
        data_atendimento: dataAtendimento || null,
        precisa_interprete: !!precisaInterprete,
        latitude: lat,
        longitude: lon,
        adultos: Number.isFinite(+adultos) ? +adultos : 0,
        criancas: Number.isFinite(+criancas) ? +criancas : 0,
        idosos: Number.isFinite(+idosos) ? +idosos : 0,
        observacoes: observacoes || null,
      }])
      .select()
      .single();

    if (atendimentoError) {
      alert("Erro ao salvar informações pessoais: " + atendimentoError.message);
      setIsSubmitting(false);
      return;
    }

    const id_atendimento = atendimentoData.id_atendimento;


 

    // 4) informacoes_deslocamento
    const deslocamentos = [];
    Object.entries(modalDeslocamento).forEach(([modal, meios]) => {
      meios.forEach((meio) => {
        deslocamentos.push({
          id_atendimento,
          tipo_modal: modal,
          meio,
          orgao:
            (modal === "terrestre" && meio === "Viatura Oficial") ? orgaos.viatura
            : (modal === "fluvial" && meio === "Embarcação Oficial") ? orgaos.embarcacao
            : (modal === "aereo" && meio === "Frete aéreo Oficial") ? orgaos.aereo
            : null,
          tempo_deslocamento: tempoDeslocamento
        });
      });
    });

    if (deslocamentos.length > 0) {
      await supabaseAssistencia.from("informacoes_deslocamento").insert(deslocamentos);
    }

    // 5) Assistência Social
    if (tipoAtendimento.includes("assistencia")) {
      const { baixa, alta, outros, bpc = {} } = assistenciaDetalhes;

      await supabaseAssistencia.from("atendimento_assistencia").insert([{
        id_atendimento,
        complexidade: assistenciaSelecionada.includes("baixa")
          ? "baixa"
          : (assistenciaSelecionada.includes("alta") ? "alta" : null),
        cadastro_unico: baixa?.cadastro_unico || false,
        pbf: baixa?.pbf || false,
        bpc: baixa?.bpc || false,
        bpc_meu_inss: bpc?.meuInss || false,
        bpc_requerimento: bpc?.requerimento || false,
        bpc_consulta: bpc?.consulta || false,
        bpc_exigencia: bpc?.exigencia || false,
        unidade_acolhimento: alta?.acolhimento || false,
        outros: outros || null
      }]);
    }

    // 6) Previdência
    if (tipoAtendimento.includes("previdencia")) {
      const previdencias = Object.entries(previdenciaDetalhes).map(([tipo, detalhes]) => ({
        id_atendimento,
        tipo,
        cear: detalhes?.cear || false,
        meu_inss: detalhes?.meuInss || false,
        requerimento: detalhes?.requerimento || false,
        consulta: detalhes?.consulta || false,
        exigencia: detalhes?.exigencia || false
      }));
      if (previdencias.length) {
        await supabaseAssistencia.from("atendimento_previdencia").insert(previdencias);
      }
    }

    // 7) Documentação
    if (tipoAtendimento.includes("documentacao")) {
      const documentacoes = Object.entries(documentacaoDetalhes)
        .filter(([tipo]) => tipo !== "outros")
        .map(([tipo, detalhes]) => ({
          id_atendimento,
          tipo,
          primeira_via: detalhes["Primeira Via"] || false,
          segunda_via: detalhes["Segunda Via"] || false,
          registro_tardio: detalhes["Registro Tardio"] || false,
          retificacao: detalhes["Retificação"] || false,
          boletim_ocorrencia: detalhes["Boletim de Ocorrência para Perda ou Roubo de Documentos"] || false
        }));
      if (documentacoes.length) {
        await supabaseAssistencia.from("atendimento_documentacao").insert(documentacoes);
      }
    }

    // 8) Saúde
    if (tipoAtendimento.includes("saude")) {
      await supabaseAssistencia.from("atendimento_saude").insert([{
        id_atendimento,
        ubs: saudeSelecionada.includes("ubs"),
        hospital: saudeSelecionada.includes("hospital"),
        dsei_y: saudeSelecionada.includes("dsei_y"),
        caps: saudeSelecionada.includes("caps"),
        outros: saudeDetalhes.outros || null
      }]);
    }

    // 9) Segurança Alimentar (com upload de foto se houver)
    if (tipoAtendimento.includes("alimentos")) {
      const { data, error } = await supabaseAssistencia
        .from("atendimento_seguranca_alimentar")
        .insert([{
          id_atendimento,
          cesta: segAlimentarSelecionada.includes("cesta"),
          quantidade_cesta: segAlimentarSelecionada.includes("cesta") ? segAlimentarDetalhes.cesta : null,
          refeicao: segAlimentarSelecionada.includes("refeicao"),
          quantidade_refeicao: segAlimentarSelecionada.includes("refeicao") ? segAlimentarDetalhes.refeicao : null,
          restaurante: segAlimentarSelecionada.includes("restaurante"),
          encaminhamento: segAlimentarSelecionada.includes("encaminhamento"),
          outros: segAlimentarDetalhes.outros || null
        }])
        .select("id")
        .single();

      if (error) throw new Error("Erro ao salvar segurança alimentar");

      const idAtendimentoSegAlimentar = data?.id;

      if (segAlimentarDetalhes.imagemEntrega && idAtendimentoSegAlimentar) {
        await uploadFotoEntrega(segAlimentarDetalhes.imagemEntrega, idAtendimentoSegAlimentar);
      }
    }

    // 10) Outros
    if (tipoAtendimento.includes("outros")) {
      await supabaseAssistencia.from("atendimento_outros").insert([{
        id_atendimento,
        entrega_insumos: outrosDetalhes.insumos,
        rede_dormir: outrosDetalhes.rede_dormir,
        quantidade_rede_dormir: outrosDetalhes.rede_dormir_qtd || null,
        outros_itens: outrosDetalhes.outros,
        descricao_outros: outrosDetalhes.outros_desc || null,
        quantidade_outros: outrosDetalhes.outros_qtd || null,
        acompanhamento: outrosDetalhes.acompanhamento,
        banco: outrosDetalhes.banco,
        comercio: outrosDetalhes.comercio,
        delegacia: outrosDetalhes.delegacia,
        artesanato: outrosDetalhes.artesanato,
        apoio_logistico: outrosDetalhes.apoio_logistico,
        combustivel: outrosDetalhes.combustivel,
        litros_combustivel: outrosDetalhes.combustivel_qtd || null,
        deslocamento_aereo: outrosDetalhes.deslocamento_aereo,
        deslocamento_terrestre: outrosDetalhes.deslocamento_terrestre,
        deslocamento_fluvial: outrosDetalhes.deslocamento_fluvial
      }]);
    }

    setErros([]);
    alert("Formulário enviado com sucesso!");
  } catch (err) {
    console.error("Erro ao enviar formulário", err);
    alert("Erro ao enviar formulário. Verifique os dados e tente novamente.");
  } finally {
    setIsSubmitting(false);
  }
};

const handleNomeChange = (e) => {
  const v = e.target.value;
  setNome(v);

  if (idPessoaSelecionada) {
    setIdPessoaSelecionada(null);
    setSobrenome("");
    setDataNascimento("");    
    setShowSugestoes(false);    
    setComunidadeSelecionada(null); 
  }

  if (v.trim() === "") {
    setSobrenome("");
    setDataNascimento("");      
    setSugestoesPessoa([]);
    setShowSugestoes(false);
    setComunidadeSelecionada(null);
  }
};

const handleClear = () => {
  setServidor("");
  setDataHora(new Date().toISOString().slice(0, 16));
  setCoordenadas({ latitude: null, longitude: null});
  setNome("");
  setComunidadeSelecionada(null);
  setAdultos(0);
  setCriancas(0);
  setIdosos(0);
  setMunicipio("");
  setModalDeslocamento({ terrestre: [], fluvial: [], aereo: [] });
  setOrgaos({ viatura: "", embarcacao: "", aereo: "" });
  setOpcaoOrgao({ viatura: "", embarcacao: "", aereo: "" });
  setTempoDeslocamento("");
  setTipoAtendimento([]);
  setAssistenciaSelecionada([]);
  setAssistenciaDetalhes({ baixa: {}, bpc: {}, alta: {}, outros: "" });
  setPrevidenciaSelecionada([]);
  setPrevidenciaDetalhes({
    salario_maternidade: {},
    aposentadoria: {},
    pensao_morte: {},
    auxilio_incapacidade: {},
    auxilio_reclusao: {},
  });
  setDocumentacaoSelecionada([]);
  setDocumentacaoDetalhes({});
  setSaudeSelecionada([]);
  setSaudeDetalhes({ outros: "" });
  setSegAlimentarSelecionada([]);
  setSegAlimentarDetalhes({ refeicao: 0, cesta: 0, outros: "" });
  setOutrosDetalhes({
    insumos: false,
    rede_dormir: false,
    rede_dormir_qtd: 0,
    outros: false,
    outros_qtd: 0,
    outros_desc: "",
    banco: false,
    comercio: false,
    delegacia: false,
    artesanato: false,
    apoio_logistico: false,
    combustivel: false,
    combustivel_qtd: 0,
    deslocamento_aereo: false,
    deslocamento_terrestre: false,
    deslocamento_fluvial: false,
  });
  setObservacoes("");
  setOutrosModais({ terrestre: "", fluvial: "", aereo: "" });
  setPrecisaInterprete(false);

  // Atualiza a data/hora novamente
  const agora = new Date();
  const offset = agora.getTimezoneOffset();
  const localDate = new Date(agora.getTime() - offset * 60000).toISOString().slice(0, 16);
  setDataHora(localDate);
  setDataAtendimento(localDate.slice(0, 10));
};
// Sugestões de possíveis duplicados
const [sugestoesPessoa, setSugestoesPessoa] = useState([]); // array de candidatos
const [showSugestoes, setShowSugestoes] = useState(false);
const [idPessoaSelecionada, setIdPessoaSelecionada] = useState(null);

// Controle de debounce da busca
const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);
let debounceTimer = null;

  const opcoesTempoDeslocamento = [
  { value: "ate_1", label: "Até 1 dia" },
  { value: "2_7", label: "Entre 2 e 7 dias" },
  { value: "8_15", label: "De 8 a 15 dias" },
  { value: "mais_15", label: "Mais de 15 dias" },
];

const toggleAssistencia = (id) => {
  setAssistenciaSelecionada((prev) =>
    prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
  );
};



const toggleAssistenciaSubopcao = (blocoId, subopcaoKey) => {
    setAssistenciaDetalhes((prev) => {
      const anterior = prev[blocoId] || {};
      return {
        ...prev,
        [blocoId]: {
          ...anterior,
          [subopcaoKey]: !anterior[subopcaoKey]
        }
      };
    });
};


const togglePrevidencia = (id) => {
      setPrevidenciaSelecionada((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
};

const toggleSubopcao = (blocoId, subopcaoKey) => {
    setPrevidenciaDetalhes((prev) => {
      const anterior = prev[blocoId] || {};
      return {
        ...prev,
        [blocoId]: {
          ...anterior,
          [subopcaoKey]: !anterior[subopcaoKey]
        }
      };
    });
};

  const toggleSubopcaoDocumentacao = (blocoId, subopcaoKey) => {
  setDocumentacaoDetalhes((prev) => {
    const anterior = prev[blocoId] || {};
    return {
      ...prev,
      [blocoId]: {
        ...anterior,
        [subopcaoKey]: !anterior[subopcaoKey]
      }
    };
  });
};


    const toggleDocumentacao = (id) => {
    setDocumentacaoSelecionada((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
};

  
  const toggleSaude = (id) => {
    setSaudeSelecionada((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
};

    const toggleSegAlimentar = (id) => {
    setSegAlimentarSelecionada((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
};

    const toggleOutros = (key) => {
    setOutrosDetalhes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
};
  const [municipio, setMunicipio] = useState("");

const toggleOption = (categoria, opcao) => {
  setModalDeslocamento((prev) => {
    const jaExiste = prev[categoria].includes(opcao);
    const atualizados = jaExiste
      ? prev[categoria].filter((item) => item !== opcao)
      : [...prev[categoria], opcao];

    return {
      ...prev,
      [categoria]: atualizados,
    };
  });
};

// desenha o texto (carimbo) na imagem e retorna um Blob JPEG
// /** @param {File} file @param {string} text @returns {Promise<Blob>} */
async function addTimestampToImage(file, text) {
  const img = new Image();
  img.src = URL.createObjectURL(file);

  await new Promise((res, rej) => {
    img.onload = () => res(null);
    img.onerror = (e) => rej(e);
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // mantém a resolução original da foto
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  // desenha a foto
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // estiliza e desenha o carimbo (canto inferior esquerdo)
  const padding = Math.round(canvas.width * 0.02); // 2% da largura
  const fontSize = Math.max(16, Math.round(canvas.width * 0.025)); // escala com a foto
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(0,0,0,0.55)';

  const lines = text.split('\n').map((s) => s.trim());
  const lineHeight = Math.round(fontSize * 1.25);
  const textWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const boxHeight = lineHeight * lines.length + padding * 2;
  const boxWidth = textWidth + padding * 2;

  const x = padding;
  const y = canvas.height - padding;

  // caixa de fundo para dar contraste
  ctx.fillRect(x - padding * 0.5, y - boxHeight, boxWidth, boxHeight);

  // texto
  ctx.fillStyle = '#fff';
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y - (lines.length - 1 - i) * lineHeight - padding);
  });

  // exporta como JPEG
  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
  });
}



// ✅ função utilitária para buscar sugestões
async function buscarSugestoesPessoa(nome, dataNascimento) {
  try {
    // 1) Pessoas
    let qb = supabaseAssistencia
      .from("pessoa_atendida")
      .select("id_pessoa,nome,data_nascimento,genero,id_comunidade")
      .ilike("nome", `%${(nome || "").trim()}%`)
      .order("nome", { ascending: true })
      .limit(5);

    if (usaFiltroNascimento && dataNascimento) {   // 👈 mudou aqui
        qb = qb.eq("data_nascimento", dataNascimento);
      }

    const { data: pessoas, error: errPessoas } = await qb;
    if (errPessoas) {
      return { data: [], error: errPessoas };
    }

    // 2) Comunidades (se tiver id)
    const ids = [...new Set((pessoas || []).map(p => p.id_comunidade).filter(Boolean))];
    let mapaComunidade = {};
    if (ids.length) {
      const { data: comus, error: errComu } = await supabaseCestas
        .from("comunidade")
        .select(`
          id_comunidade,
          nome_comunidade,
          comunidade_id_subpolo_fkey (
            nome_subpolo,
            polo (nome_polo)
          )
        `)
        .in("id_comunidade", ids);

      if (!errComu && comus) {
        comus.forEach(c => { mapaComunidade[c.id_comunidade] = c; });
      }
    }

    // 3) Monta resultado final com label amigável
    const resultado = (pessoas || []).map(p => {
      const c = p.id_comunidade ? mapaComunidade[p.id_comunidade] : null;
      const sub = c?.comunidade_id_subpolo_fkey?.nome_subpolo || "";
      const polo = c?.comunidade_id_subpolo_fkey?.polo?.nome_polo || "";
      const comuLabel = c
        ? `${c.nome_comunidade}${sub || polo ? ` — ${sub}${polo ? ` / ${polo}` : ""}` : ""}`
        : "Comunidade não informada";

      return {
        id_pessoa: p.id_pessoa,
        nome: p.nome,
        data_nascimento: p.data_nascimento,
        genero: p.genero,
        id_comunidade: p.id_comunidade,
        comunidade_label: comuLabel,
      };
    });

    return { data: resultado, error: null };
  } catch (e) {
    return { data: [], error: e };
  }
}




useEffect(() => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario) setServidor(usuario.nome_completo);

  const agora = new Date();
  const offset = agora.getTimezoneOffset();
  const localDate = new Date(agora.getTime() - offset * 60000).toISOString().slice(0, 16);
  setDataHora(localDate);
  setDataAtendimento(localDate.slice(0, 10));


  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = Number(position.coords.latitude.toFixed(5));
      const lon = Number(position.coords.longitude.toFixed(5));
      setCoordenadas({ latitude: lat, longitude: lon });

      // Busca o município usando Nominatim
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await response.json();
        const municipio = data?.address?.city || data?.address?.town || data?.address?.village || "";
        setMunicipio(municipio);
      } catch (err) {
        console.error("Erro ao buscar município:", err);
      }
    });
  }


    fetchComunidades();
  }, []);

useEffect(() => {
  if (idPessoaSelecionada) {
    setSugestoesPessoa([]);
    setShowSugestoes(false);
    return;
  }

  const first = (nome || "").trim();
  const last  = (sobrenome || "").trim();

  // Continua não sugerindo com < 3 letras no NOME
  if (first.length < 3) {
    setSugestoesPessoa([]);
    setShowSugestoes(false);
    return;
  }

  // 2) Só usa nome completo se o SOBRENOME tiver 3+ letras
  const termo = last.length >= 3 ? `${first} ${last}` : first;

  let cancelado = false;
  const t = setTimeout(async () => {
    setBuscandoSugestoes(true);
    try {
      const { data, error } = await buscarSugestoesPessoa(termo, dataNascimento);
      if (cancelado) return;

      if (error) {
        console.error("Erro ao buscar sugestões:", error);
        setSugestoesPessoa([]);
        setShowSugestoes(false);
      } else {
        setSugestoesPessoa(data ?? []);
        setShowSugestoes((data ?? []).length > 0);
      }
    } catch (e) {
      if (!cancelado) {
        console.error("Falha inesperada:", e);
        setSugestoesPessoa([]);
        setShowSugestoes(false);
      }
    } finally {
      if (!cancelado) setBuscandoSugestoes(false);
    }
  }, 400);

  return () => { cancelado = true; clearTimeout(t); };
}, [nome, sobrenome, dataNascimento, idPessoaSelecionada]);




async function fetchComunidades(forcar = false) {
  const cache = localStorage.getItem("comunidades_cache");
  const cacheTimestamp = localStorage.getItem("comunidades_cache_time");
  const agora = new Date().getTime();
  const validade = 1000 * 60 * 60 * 24; // 24h

  if (!forcar && cache && cacheTimestamp && agora - cacheTimestamp < validade) {
    setComunidades(JSON.parse(cache));
    return;
  }

  const { data, error } = await supabaseCestas
    .from("comunidade")
    .select(`
      id_comunidade,
      nome_comunidade,
      comunidade_id_subpolo_fkey (
        nome_subpolo,
        polo (nome_polo)
      )
    `)
    .order("nome_comunidade", { ascending: true });

  if (error) {
    console.error("Erro ao buscar comunidades:", error);
    return;
  }



  // Mapa para contar duplicados com base na combinação nome + subpolo + polo
  const chaveComunidade = (c) => {
    const sub = c.comunidade_id_subpolo_fkey?.nome_subpolo || "";
    const pol = c.comunidade_id_subpolo_fkey?.polo?.nome_polo || "";
    return `${c.nome_comunidade}__${sub}__${pol}`;
  };

  const contadorChaves = {};
  for (const c of data) {
    const chave = chaveComunidade(c);
    contadorChaves[chave] = (contadorChaves[chave] || 0) + 1;
  }

  // Segunda contagem só por nome para verificar se existe ambiguidade
  const contadorPorNome = {};
  for (const c of data) {
    contadorPorNome[c.nome_comunidade] = (contadorPorNome[c.nome_comunidade] || 0) + 1;
  }

  
  const formatadas = data.map((c) => {
    const nome = c.nome_comunidade;
    const subpolo = c.comunidade_id_subpolo_fkey?.nome_subpolo || "";
    const polo = c.comunidade_id_subpolo_fkey?.polo?.nome_polo || "";
    const nomeAmbiguo = contadorPorNome[nome] > 1;
    const label = nomeAmbiguo
      ? `${nome} — ${subpolo} / ${polo}`
      : nome;

    return {
      value: c.id_comunidade,
      label,
      nome_comunidade: nome,
      subpolo: c.comunidade_id_subpolo_fkey || null,
    };
  });

  // Remove duplicados baseados na combinação nome + subpolo + polo
  const vistos = new Set();
  const unicos = formatadas.filter((c) => {
    const chave = `${c.nome_comunidade}__${c.subpolo?.nome_subpolo || ""}__${c.subpolo?.polo?.nome_polo || ""}`;
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });

  setComunidades(unicos);
  localStorage.setItem("comunidades_cache", JSON.stringify(unicos));
  localStorage.setItem("comunidades_cache_time", agora.toString());
}


  async function uploadFotoEntrega(imagemFile, idAtendimento) {
  if (!imagemFile || !idAtendimento) {
    console.error("❌ Falta imagem ou ID:", { imagemFile, idAtendimento });
    return null;
  }

  const fileName = `entrega_${idAtendimento}_${Date.now()}.jpg`;
  console.log("📦 Iniciando upload da imagem:", fileName);

  // 1. Upload da imagem
  const { error: uploadError } = await supabaseAssistencia.storage
    .from('fotos-entregas')
    .upload(fileName, imagemFile, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    console.error("🛑 Erro no upload para o bucket:", uploadError.message, uploadError);
    return null;
  }

  console.log("✅ Upload realizado com sucesso");

  // 2. Obter a URL pública
  const { data: publicUrlData } = supabaseAssistencia
    .storage
    .from('fotos-entregas')
    .getPublicUrl(fileName);

  const urlFoto = publicUrlData?.publicUrl;

  if (!urlFoto) {
    console.error("❌ Não foi possível obter a URL pública");
    return null;
  }

  console.log("🌐 URL gerada:", urlFoto);

  // 3. Atualizar a tabela
  const { error: updateError } = await supabaseAssistencia
    .from('atendimento_seguranca_alimentar')
    .update({ url_foto_entrega: urlFoto })
    .eq('id', idAtendimento);

  if (updateError) {
    console.error("🛑 Erro ao atualizar o banco:", updateError.message, updateError);
    return null;
  }

  console.log("📌 URL salva no banco com sucesso");
  return urlFoto;
}


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Formulário de Proteção Social</h2>
        {erros.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <ul className="list-disc pl-5">
            {erros.map((erro, i) => (
              <li key={i}>{erro}</li>
            ))}
          </ul>
        </div>
      )}


<Box
  sx={{
    borderRadius: 2,
    border: "1px solid #E0E0E0",
    backgroundColor: "#fff",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    p: 3,
    mt: 2,
  }}
>
  <Typography
    variant="subtitle1"
    fontWeight="bold"
    gutterBottom
    sx={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: 1 }}
  >
    📋 Dados do Atendimento
  </Typography>

  <Grid container spacing={2}>
    <Grid item xs={12} sm={4}>
      <Typography
        variant="caption"
        fontWeight="medium"
        color="text.secondary"
        sx={{ mb: 0.5 }}
      >
        Nome do Servidor
      </Typography>
      <TextField
        value={servidor}
        variant="outlined"
        size="small"
        fullWidth
        disabled
        InputProps={{ readOnly: true }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
          "& input": {
            padding: "8px 10px",
          },
        }}
      />
    </Grid>

    <Grid item xs={12} sm={4}>
      <Typography
        variant="caption"
        fontWeight="medium"
        color="text.secondary"
        sx={{ mb: 0.5 }}
      >
        Horário e Data
      </Typography>
      <TextField
        value={dataHora}
        fullWidth
        size="small"
        disabled
        InputProps={{ readOnly: true }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
          "& input": {
            padding: "8px 10px",
          },
        }}
      />
    </Grid>

    <Grid item xs={12} sm={4}>
      <Typography
        variant="caption"
        fontWeight="medium"
        color="text.secondary"
        sx={{ mb: 0.5 }}
      >
        Coordenadas
      </Typography>
      <TextField
        value={`Lat: ${coordenadas.latitude ?? "—"}, Lon: ${coordenadas.longitude ?? "—"}`}        fullWidth
        size="small"
        disabled
        InputProps={{ readOnly: true }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
          "& input": {
            padding: "8px 10px",
          },
        }}
      />
    </Grid>

    <Grid item xs={12} sm={4}>
      <Typography
        variant="caption"
        fontWeight="medium"
        color="text.secondary"
        sx={{ mb: 0.5 }}
      >
        Município
      </Typography>
      <TextField
        value={municipio}
        fullWidth
        size="small"
        disabled
        InputProps={{ readOnly: true }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
          "& input": {
            padding: "8px 10px",
          },
        }}
      />
    </Grid>

    {["boa vista", "sao gabriel da cachoeira", "santa isabel do rio negro", "barcelos"].includes(normalizeMunicipio(municipio)) && (
  <Grid item xs={12} sm={4}>
    <Typography
      variant="caption"
      fontWeight="medium"
      color="text.secondary"
      sx={{ mb: 0.5 }}
    >
      Interno ou Externo?
    </Typography>
    <TextField
      select
      fullWidth
      size="small"
      value={localUnidade}
      onChange={(e) => setLocalUnidade(e.target.value)}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          fontSize: "0.85rem",
        },
      }}
    >
      <MenuItem value="">Selecione</MenuItem>
      <MenuItem value="sede">Sede</MenuItem>
      <MenuItem value="desconcentrada">Unidade Desconcentrada</MenuItem>
    </TextField>
  </Grid>
)}


    <Grid item xs={12} sm={4}>
      <Typography
        variant="caption"
        fontWeight="medium"
        color="text.secondary"
        sx={{ mb: 0.5 }}
      >
        Data do Atendimento
      </Typography>
      <TextField
        type="date"
        value={dataAtendimento}
        onChange={(e) => setDataAtendimento(e.target.value)}
        fullWidth
        size="small"
        InputLabelProps={{ shrink: true }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
          "& input": {
            padding: "8px 10px",
          },
        }}
      />
    </Grid>

   <Grid item xs={12} sm={4} sx={{ display: "flex", alignItems: "center" }}>
  <FormControlLabel
    control={
      <Checkbox
        size="small"
        checked={precisaInterprete}
        onChange={(e) => setPrecisaInterprete(e.target.checked)}
        sx={{
          color: "#2E7D32",
          '&.Mui-checked': {
            color: "#2E7D32",
          },
        }}
      />
    }
    label={
      <Typography variant="caption" sx={{ fontSize: "0.9rem" }}>
        Necessita de intérprete
      </Typography>
    }
    sx={{ mt: 3 }}
  />
</Grid>

  </Grid>
</Box>

<Box
  sx={{
    backgroundColor: "#ffffff",
    borderRadius: 2,
    border: "1px solid #E0E0E0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    p: 3,
    mt: 2,
  }}
>
  <Typography
    variant="subtitle1"
    fontWeight="bold"
    gutterBottom
    sx={{
      fontSize: "1rem",
      display: "flex",
      alignItems: "center",
      gap: 1,
    }}
  >
    <span role="img" aria-label="user">👤</span> Pessoa Atendida
  </Typography>

    <Grid container spacing={2}>
      {/* Nome */}
     <Grid item xs={12} sm={6}>
    <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
      Nome
    </Typography>
    <TextField
      placeholder="Digite o primeiro nome"
      value={nome}
      onChange={handleNomeChange}
      fullWidth
      size="small"
      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.85rem" } }}
    />

        {/* Abaixo do <TextField> do nome */}
{(showSugestoes || buscandoSugestoes) && (
  <Box sx={{ mt: 1, p: 1.5, border: "1px solid #eee", borderRadius: 2, background: "#fafafa" }}>
    {buscandoSugestoes && (
      <Typography variant="body2" color="text.secondary">Buscando sugestões…</Typography>
    )}

    {!buscandoSugestoes && sugestoesPessoa.length > 0 && (
      <>
        <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
          Encontramos possíveis cadastros. Selecione um para vincular:
        </Typography>

        {sugestoesPessoa.map((p) => (
          <Box
            key={p.id_pessoa}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              p: 1,
              mb: 1,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              background: "#fff",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                {p.nome}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem" }} color="text.secondary">
                {p.data_nascimento ? `Nasc.: ${new Date(p.data_nascimento).toLocaleDateString("pt-BR")}` : "Data nasc. não informada"}
                {p.id_comunidade ? ` • ${p.comunidade_label}` : ""}
              </Typography>
            </Box>

              <Button
                size="small"
                variant={idPessoaSelecionada === p.id_pessoa ? "contained" : "outlined"}
                onClick={() => {
                  setIdPessoaSelecionada(p.id_pessoa);
                  const { nome: n, sobrenome: s } = splitFullName(p.nome || "");
                  setNome(n || "");
                  setSobrenome(s || "");
                  setShowSugestoes(false);
                  if (p.genero && !genero) setGenero(p.genero);
                  if (p.data_nascimento) {
                      setDataNascimento(p.data_nascimento.slice(0,10));
                      setUsaFiltroNascimento(false); // 👈 veio de auto-preenchimento
                    }
                  if (p.id_comunidade && comunidades?.length) {
                    const opt = comunidades.find(c => c.value === p.id_comunidade);
                    if (opt) setComunidadeSelecionada(opt);
                  }
                }}

              >
                {idPessoaSelecionada === p.id_pessoa ? "Selecionado" : "Usar este"}
              </Button>

          </Box>
        ))}

        

        <Button
          size="small"
          onClick={() => {
            // usuário quer ignorar sugestões e criar novo
            setIdPessoaSelecionada(null);
            setShowSugestoes(false);
          }}
        >
          Criar novo cadastro mesmo assim
        </Button>
      </>
    )}

      {!buscandoSugestoes && sugestoesPessoa.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Nenhuma sugestão encontrada.
        </Typography>
      )}
    </Box>
  )}

</Grid>
      
       <Grid item xs={12} sm={6}>
    <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
      Sobrenome
    </Typography>
    <TextField
      placeholder="Digite o(s) sobrenome(s)"
      value={sobrenome}
      onChange={(e) => { 
      setSobrenome(e.target.value); 
      setIdPessoaSelecionada(null);
      setUsaFiltroNascimento(false); 
    }}

      fullWidth
      size="small"
      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.85rem" } }}
    />
  </Grid>

    <Grid item xs={12} sm={3}>
  <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
    Gênero
  </Typography>
  <TextField
    select
    value={genero}
    onChange={(e) => setGenero(e.target.value)}
    fullWidth
    size="small"
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        fontSize: "0.85rem",
      },
    }}
  >
    <MenuItem value="">Não informado</MenuItem>
    <MenuItem value="feminino">Feminino</MenuItem>
    <MenuItem value="masculino">Masculino</MenuItem>
    <MenuItem value="outro">Outro</MenuItem>
  </TextField>
</Grid>

<Grid item xs={12} sm={3}>
  <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
    Data de Nascimento
  </Typography>
  <TextField
    type="date"
    value={dataNascimento}
    onChange={(e) => { setDataNascimento(e.target.value); 
      setUsaFiltroNascimento(!!e.target.value);
      setIdPessoaSelecionada(null)}}
    fullWidth
    size="small"
    InputLabelProps={{ shrink: true }}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        fontSize: "0.85rem",
      },
      "& input": {
        padding: "8px 10px",
      },
    }}
  />
</Grid>


{/* Comunidade */}
<Grid item xs={12}>
  <Typography
    variant="caption"
    fontWeight="medium"
    color="text.secondary"
    sx={{ mb: 0.5 }}
  >
    Comunidade
  </Typography>

  <Autocomplete
   sx={{ width: "100%", minWidth: 250 }} 
    options={[...comunidades, { value: "outros", label: "Outros" }]}
    getOptionLabel={(option) => option.label}
    isOptionEqualToValue={(option, value) => option.value === value.value}
    value={comunidadeSelecionada}
    onChange={(event, newValue) => {
      setComunidadeSelecionada(newValue);
      if (newValue?.value !== "outros") {
        setComunidadeManual("");
        setPoloBaseManual("");
      }
    }}
    renderOption={(props, option) => (
      <li {...props} key={option.value}>
        {option.label}
      </li>
    )}
    renderInput={(params) => (
      <TextField
         {...params}
          label=""
          size="small"
          placeholder="Nome da comunidade"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.85rem",
            },
          }}
        variant="outlined"
      />
    )}
  />

  {/* Campos manuais se "Outros" for selecionado */}
  {comunidadeSelecionada?.value === "outros" && (
    <Box mt={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="caption"
            fontWeight="medium"
            color="text.secondary"
            sx={{ mb: 0.5 }}
          >
            Nome da Comunidade 
          </Typography>
          <TextField
            value={comunidadeManual}
            onChange={(e) => setComunidadeManual(e.target.value)}
            placeholder="Digite o nome da comunidade"
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: "0.85rem",
              },
              "& input": {
                padding: "8px 10px",
              },
            }}
          />
        </Grid>

          
          <Grid item xs={12} sm={6}>
      <Typography
        variant="caption"
        fontWeight="medium"
        color="text.secondary"
        sx={{ mb: 0.5 }}
      >
        Polo Base
      </Typography>
        <Autocomplete
         sx={{ width: "100%", minWidth: 250 }} 
      options={polosBase}
      getOptionLabel={(option) => option.nome_subpolo}
      isOptionEqualToValue={(option, value) => option.nome_subpolo === value}
      value={
        polosBase.find((p) => p.nome_subpolo === poloBaseManual) || null
      }
      onChange={(event, newValue) => {
        setPoloBaseManual(newValue ? newValue.nome_subpolo : "");
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label=""
          size="small"
          placeholder="Selecione o polo base"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.85rem",
            },
          }}
        />
      )}
      ListboxProps={{
        style: {
          maxHeight: 200, 
        },
      }}
    />

    </Grid>
      </Grid>
    </Box>
  )}

  {/* Campo automático se comunidade foi selecionada do banco */}
  {comunidadeSelecionada?.value !== "outros" && comunidadeSelecionada?.subpolo && (
    <Box mt={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="caption"
            fontWeight="medium"
            color="text.secondary"
            sx={{ mb: 0.5 }}
          >
            Polo Base
          </Typography>
          <TextField
            value={comunidadeSelecionada.subpolo?.nome_subpolo || "—"}
            fullWidth
            size="small"
            disabled
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: "0.85rem",
              },
              "& input": {
                padding: "8px 10px",
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  )}

  <Button
    onClick={() => fetchComunidades(true)}
    size="small"
    variant="outlined"
    sx={{ mt: 1 }}
  >
    🔄 Recarregar
  </Button>
</Grid>



    {/* Número de acompanhantes */}
<Grid item xs={12}>
  <Typography
    variant="caption"
    fontWeight="medium"
    color="text.secondary"
    sx={{ mb: 2}} 
  >
  </Typography>

  <Grid container spacing={2} sx={{ mt: 3 }}> 
    <Grid item xs={12} sm={4}>
      <TextField
        label="Adultos"
        type="number"
        inputProps={{ min: 0 }}
        value={adultos}
        onChange={(e) => setAdultos(parseInt(e.target.value))}
        fullWidth
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
        }}
      />
    </Grid>

    <Grid item xs={12} sm={4}>
      <TextField
        label="Crianças"
        type="number"
        inputProps={{ min: 0 }}
        value={criancas}
        onChange={(e) => setCriancas(parseInt(e.target.value))}
        fullWidth
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
        }}
      />
    </Grid>

    <Grid item xs={12} sm={4}>
      <TextField
        label="Idosos"
        type="number"
        inputProps={{ min: 0 }}
        value={idosos}
        onChange={(e) => setIdosos(parseInt(e.target.value))}
        fullWidth
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
        }}
      />
    </Grid>
  </Grid>
</Grid>

  </Grid>
</Box>

<Box
  sx={{
    backgroundColor: "#ffffff",
    borderRadius: 2,
    border: "1px solid #E0E0E0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    p: 3,
    mt: 2,
  }}
>
  {/* Bloco II: Informações de Deslocamento */}
  <Typography
    variant="subtitle1"
    fontWeight="bold"
    gutterBottom
    sx={{
      fontSize: "1.0rem",
      display: "flex",
      alignItems: "center",
      gap: 1,
    }}
  >
    <Box fontSize="1.4rem">🚗</Box>
     Modal de Deslocamento
  </Typography>

  <Typography
    variant="caption"
    fontWeight="medium"
    color="text.secondary"
    sx={{ mt: 2, mb: 1 }}
  >
    Selecione os Modais de Deslocamento:
  </Typography>

  {/* Modal Terrestre */}
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
      Modal Terrestre
    </Typography>

    <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
      {["A pé", "Carona", "Viatura Oficial", "Veículo Fretado", "Outros"].map((opcao) => (
        <FormControlLabel
          key={opcao}
          control={
            <Checkbox
              checked={modalDeslocamento.terrestre.includes(opcao)}
              onChange={() => toggleOption("terrestre", opcao)}
              size="small"
              sx={{
                color: "#2E7D32",
                '&.Mui-checked': {
                  color: "#2E7D32",
                },
              }}
            />
          }
          label={<Typography sx={{ fontSize: "0.85rem" }}>{opcao}</Typography>}
        />
      ))}
    </FormGroup>

{modalDeslocamento.terrestre.includes("Viatura Oficial") && (
  <Box mt={2} display="flex" gap={2} alignItems="center">
    <Box fontSize="1.4rem">🏛️</Box>

    <TextField
      select
      fullWidth
      size="small"
      value={opcaoOrgao.viatura}
      onChange={(e) => {
        const valor = e.target.value;
        handleSelectOrgao("viatura", valor === "Outros" ? "" : valor);
        setOpcaoOrgao((prev) => ({ ...prev, viatura: valor }));
      }}
      displayEmpty
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          fontSize: "0.85rem",
        },
        "& .MuiSelect-select": {
          padding: "8px 10px",
        },
      }}
      inputProps={{
        displayEmpty: true,
      }}
    >
      <MenuItem value="">
        <span style={{ fontSize: "0.85rem", color: "#B8B8B8" }}>
          Selecione o órgão responsável
        </span>
      </MenuItem>
      {[...orgaosDisponiveis, "Outros"].map((opcao) => (
        <MenuItem key={opcao} value={opcao}>
          {opcao}
        </MenuItem>
      ))}
    </TextField>
  </Box>
)}



    {modalDeslocamento.terrestre.includes("Outros") && (
        <Box  mt={2} display="flex" gap={2}>
        <Box fontSize="1.4rem">🚙</Box>
        <TextField
          fullWidth
          size="small"
          placeholder="Descreva o modal terrestre"
          value={outrosModais.terrestre}
          onChange={(e) =>
            setOutrosModais((prev) => ({ ...prev, terrestre: e.target.value }))
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.85rem",
            },
            "& input": {
              padding: "8px 10px",
            },
          }}
        />
      </Box>
    )}
  </Box>

  {/* Modal Fluvial */}
  <Box sx={{ mt: 4 }}>
    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
      Modal Fluvial
    </Typography>

    <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
      {["Motor Rabeta", "Motor de Popa", "Embarcação Oficial", "Outros"].map((opcao) => (
        <FormControlLabel
          key={opcao}
          control={
            <Checkbox
              checked={modalDeslocamento.fluvial.includes(opcao)}
              onChange={() => toggleOption("fluvial", opcao)}
              size="small"
              sx={{
                color: "#2E7D32",
                '&.Mui-checked': {
                  color: "#2E7D32",
                },
              }}
            />
          }
          label={<Typography sx={{ fontSize: "0.85rem" }}>{opcao}</Typography>}
        />
      ))}
    </FormGroup>

  {modalDeslocamento.fluvial.includes("Embarcação Oficial") && (
   <Box  mt={2} display="flex" gap={2}>
        <Box fontSize="1.4rem">🏛️</Box>

    <TextField
      select
      fullWidth
      size="small"
      value={opcaoOrgao.embarcacao}
      onChange={(e) => {
        const valor = e.target.value;
        handleSelectOrgao("embarcacao", valor === "Outros" ? "" : valor);
        setOpcaoOrgao((prev) => ({ ...prev, embarcacao: valor }));
      }}
      displayEmpty
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          fontSize: "0.85rem",
        },
        "& .MuiSelect-select": {
          padding: "8px 10px",
        },
      }}
      inputProps={{
        displayEmpty: true,
      }}
    >
      <MenuItem value="" disabled>
        <Typography
          variant="caption"
          color="#B8B8B8"
          sx={{ fontSize: "0.85rem" }}
        >
          Selecione o órgão responsável
        </Typography>
      </MenuItem>
      {[...orgaosDisponiveis, "Outros"].map((opcao) => (
        <MenuItem key={opcao} value={opcao}>
          {opcao}
        </MenuItem>
      ))}
    </TextField>
  </Box>
)}
    {modalDeslocamento.fluvial.includes("Outros") && (
       <Box  mt={2} display="flex" gap={2}>
        <Box fontSize="1.4rem">🚤</Box>
        <TextField
          fullWidth
          size="small"
          placeholder="Descreva o modal fluvial"
          value={outrosModais.fluvial}
          onChange={(e) =>
            setOutrosModais((prev) => ({ ...prev, fluvial: e.target.value }))
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.85rem",
            },
            "& input": {
              padding: "8px 10px",
            },
          }}
        />
      </Box>
    )}
  </Box>

  {/* Modal Aéreo */}
  <Box sx={{ mt: 4 }}>
    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
      Modal Aéreo
    </Typography>

    <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
      {["Frete aéreo particular", "Frete aéreo Oficial", "Outros"].map((opcao) => (
        <FormControlLabel
          key={opcao}
          control={
            <Checkbox
              checked={modalDeslocamento.aereo.includes(opcao)}
              onChange={() => toggleOption("aereo", opcao)}
              size="small"
              sx={{
                color: "#2E7D32",
                '&.Mui-checked': {
                  color: "#2E7D32",
                },
              }}
            />
          }
          label={<Typography sx={{ fontSize: "0.85rem" }}>{opcao}</Typography>}
        />
      ))}
    </FormGroup>

{modalDeslocamento.aereo.includes("Frete aéreo Oficial") && (
  <Box mt={2} display="flex" gap={2}>
    <Box fontSize="1.4rem">🏛️</Box>

    <TextField
      select
      fullWidth
      size="small"
      value={opcaoOrgao.aereo}
      onChange={(e) => {
        const valor = e.target.value;
        handleSelectOrgao("aereo", valor === "Outros" ? "" : valor);
        setOpcaoOrgao((prev) => ({ ...prev, aereo: valor }));
      }}
      displayEmpty
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          fontSize: "0.85rem",
        },
        "& .MuiSelect-select": {
          padding: "8px 10px",
        },
      }}
      inputProps={{ displayEmpty: true }}
    >
      <MenuItem value="">
        <Typography
          variant="caption"
          color="#B8B8B8"
          sx={{ fontSize: "0.85rem" }}
        >
          Selecione o órgão responsável
        </Typography>
      </MenuItem>

      {[...orgaosDisponiveis, "Outros"].map((opcao) => (
        <MenuItem key={opcao} value={opcao}>
          {opcao}
        </MenuItem>
      ))}
    </TextField>
  </Box>
)}





    {modalDeslocamento.aereo.includes("Outros") && (
      <Box  mt={2} display="flex" gap={2}>
        <Box fontSize="1.4rem">🛩️</Box>
        <TextField
          fullWidth
          size="small"
          placeholder="Descreva o modal aéreo"
          value={outrosModais.aereo}
          onChange={(e) =>
            setOutrosModais((prev) => ({ ...prev, aereo: e.target.value }))
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.85rem",
            },
            "& input": {
              padding: "8px 10px",
            },
          }}
        />
      </Box>
    )}
  </Box>

  {/* Tempo de Deslocamento */}
  <Box sx={{ mt: 4 }}>
    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
      Tempo de Deslocamento (em períodos)
    </Typography>

    <Autocomplete
      options={opcoesTempoDeslocamento}
      getOptionLabel={(option) => option.label}
      value={opcoesTempoDeslocamento.find((opt) => opt.value === tempoDeslocamento)}
      onChange={(event, newValue) => setTempoDeslocamento(newValue?.value || "")}
      size="small"
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Selecione o tempo de deslocamento"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.85rem",
            },
            "& input": {
              padding: "8px 10px",
            },
          }}
        />
      )}
    />
  </Box>
</Box>


<Box
  sx={{
    backgroundColor: "#ffffff",
    borderRadius: 2,
    border: "1px solid #E0E0E0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    p: 3,
    mt: 2,
  }}
>
  <Typography
    variant="subtitle1"
    fontWeight="bold"
    gutterBottom
    sx={{
      fontSize: "1rem",
      display: "flex",
      alignItems: "center",
      gap: 1,
    }}
  >
    📝 Tipo de Atendimento
  </Typography>

  <Autocomplete
    multiple
    options={[
      { value: "assistencia", label: "Assistência Social" },
      { value: "previdencia", label: "Previdência Social" },
      { value: "documentacao", label: "Documentação Civil" },
      { value: "saude", label: "Atenção à Saúde" },
      { value: "alimentos", label: "Segurança Alimentar" },
      { value: "outros", label: "Outros Atendimentos" },
    ].filter((opt) => !tipoAtendimento.includes(opt.value))}
    getOptionLabel={(option) => option.label}
    value={tipoAtendimento.map((tipo) => ({
      value: tipo,
      label:
        {
          assistencia: "Assistência Social",
          previdencia: "Previdência Social",
          documentacao: "Documentação Civil",
          saude: "Atenção à Saúde",
          alimentos: "Segurança Alimentar",
          outros: "Outros Atendimentos",
        }[tipo] || tipo,
    }))}
    onChange={(event, newValue) => {
      setTipoAtendimento(newValue.map((opt) => opt.value));
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        placeholder="Selecione os tipos de atendimento"
        variant="outlined"
        size="small"
        fullWidth
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
          "& input": {
            padding: "8px 10px",
          },
        }}
      />
    )}
  />


  {/* Assistência Social */}
{tipoAtendimento.includes("assistencia") && (
  <Box mt={3}>
    <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ fontSize: "0.95rem" }}>
    🤝 3.1 Assistência Social
    </Typography>

    {[
      {
        id: "baixa",
        titulo: "Baixa Complexidade",
        opcoes: [
          { key: "cadastro_unico", label: "Cadastro Único" },
          { key: "pbf", label: "Programa Bolsa Família (PBF)" },
          { key: "bpc", label: "Benefício de Prestação Continuada (BPC/LOAS)" },
        ],
      },
      {
        id: "media",
        titulo: "Média Complexidade",
        opcoes: [],
      },
      {
        id: "alta",
        titulo: "Alta Complexidade",
        opcoes: [
          { key: "acolhimento", label: "Unidade de Acolhimento Social" },
        ],
      },
    ].map(({ id, titulo, opcoes }) => (
      <Box
        key={id}
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: 3,
          p: 1,
          mb: 1.5,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={assistenciaSelecionada.includes(id)}
              onChange={() => toggleAssistencia(id)}
              size="small"
              sx={{
                color: "#2E7D32",
                '&.Mui-checked': {
                  color: "#2E7D32",
                },
              }}
            />
          }
          label={<Typography sx={{ fontSize: "0.9rem" }}>{titulo}</Typography>}
        />

        {/* Subopções */}
        {assistenciaSelecionada.includes(id) && opcoes.length > 0 && (
          <Box ml={4} mt={1}>
            <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
              {opcoes.map(({ key, label }) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={assistenciaDetalhes?.[id]?.[key] || false}
                      onChange={() => toggleAssistenciaSubopcao(id, key)}
                      size="small"
                      sx={{
                        color: "#2E7D32",
                        '&.Mui-checked': {
                          color: "#2E7D32",
                        },
                      }}
                    />
                  }
                  label={<Typography sx={{ fontSize: "0.85rem" }}>{label}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>
        )}

        {/* Sub-subopções do BPC */}
        {id === "baixa" && assistenciaDetalhes?.baixa?.bpc && (
          <Box ml={6} mt={1}>
            <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
              {["meuInss", "requerimento", "consulta", "exigencia"].map((key) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={assistenciaDetalhes?.bpc?.[key] || false}
                      onChange={() => toggleAssistenciaSubopcao("bpc", key)}
                      size="small"
                      sx={{
                        color: "#2E7D32",
                        '&.Mui-checked': {
                          color: "#2E7D32",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.8rem" }}>
                      {{
                        meuInss: "Cadastro Meu INSS",
                        requerimento: "Abertura de requerimento",
                        consulta: "Consulta",
                        exigencia: "Cumprimento de Exigência",
                      }[key]}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </Box>
        )}
      </Box>
    ))}

    {/* Campo de texto "Outros" */}
    <Box>
      <Typography variant="body2" fontWeight="bold" gutterBottom>
        Outros:
      </Typography>
      <TextField
        fullWidth
        value={assistenciaDetalhes.outros}
        onChange={(e) =>
          setAssistenciaDetalhes((prev) => ({ ...prev, outros: e.target.value }))
        }
        placeholder="Especificar"
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
          "& input": {
            padding: "8px 10px",
          },
        }}
      />
    </Box>
  </Box>
)}


{tipoAtendimento.includes("previdencia") && (
 <Box sx={{ mt: 4 }}>
  <Typography
    variant="subtitle1"
    fontWeight="bold"
    gutterBottom
    sx={{ fontSize: "1.0rem" }}
  >
    🏫 3.2 Previdência Social
  </Typography>

  {["salario_maternidade", "aposentadoria", "pensao_morte", "auxilio_incapacidade", "auxilio_reclusao"].map((id) => (
    <Box
      key={id}
      sx={{
        border: "1px solid #E0E0E0",
        borderRadius: 3,
        p: 1,
        mb: 1.5,
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={previdenciaSelecionada.includes(id)}
            onChange={() => togglePrevidencia(id)}
            sx={{
              color: "#2E7D32",
              '&.Mui-checked': { color: "#2E7D32" },
            }}
          />
        }
        label={
          <Typography sx={{ fontSize: "0.9rem" }}>
            {id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Typography>
        }
      />

      {previdenciaSelecionada.includes(id) && (
        <Box sx={{ ml: 3, mt: 1 }}>
          <FormGroup sx={{ gap: 1 }}>
            {[
              { key: "cear", label: "Preenchimento de Certidão de Exercício de Atividade Rural (CEAR)" },
              { key: "meuInss", label: "Cadastro Meu INSS" },
              { key: "requerimento", label: "Abertura de requerimento" },
              { key: "consulta", label: "Consulta" },
              { key: "exigencia", label: "Cumprimento de Exigência" }
            ].map(({ key, label }) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={previdenciaDetalhes?.[id]?.[key] || false}
                    onChange={() => toggleSubopcao(id, key)}
                    size="small"
                    sx={{
                      color: "#2E7D32",
                      '&.Mui-checked': { color: "#2E7D32" },
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: "0.85rem" }}>{label}</Typography>}
              />
            ))}
          </FormGroup>
        </Box>
      )}
    </Box>
  ))}

  {/* Campo "Outros" fixo */}
  <Box sx={{ mt: 2 }}>
    <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#000" }}>Outros:</span>
    <TextField
      fullWidth
      size="small"
      placeholder="Descreva aqui"
      value={previdenciaOutrosTexto}
      onChange={(e) => setPrevidenciaOutrosTexto(e.target.value)}
      sx={{
        mt: 1,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          fontSize: "0.85rem",
        },
        '& input': {
          padding: "8px 10px",
        },
      }}
    />
  </Box>
</Box>

)}

{tipoAtendimento.includes("documentacao") && (
  <Box sx={{ mt: 4 }}>
    <Typography
      variant="subtitle1"
      fontWeight="bold"
      gutterBottom
      sx={{ fontSize: "1rem" }}
    >
      📄 3.3 Documentação Civil
    </Typography>

    {["nascido_vivo", "registro_nascimento", "registro_obito", "cpf", "cin", "titulo_eleitor", "reservista"].map((id) => (
    <Box
        key={id}
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: 3,
          p: 1,
          mb: 1.5,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={documentacaoSelecionada.includes(id)}
              onChange={() => toggleDocumentacao(id)}
              sx={{
                color: "#2E7D32",
                '&.Mui-checked': {
                  color: "#2E7D32",
                },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: "0.9rem" }}>
              {{
                nascido_vivo: "Declaração de Nascido Vivo",
                registro_nascimento: "Registro Civil Nascimento",
                registro_obito: "Registro Civil de Óbito",
                cpf: "Cadastro de Pessoa Física (CPF)",
                cin: "Carteira de Identidade Nacional (CIN)",
                titulo_eleitor: "Título de Eleitor",
                reservista: "Certificado de Reservista ou Dispensa de Incorporação (CDI)"
              }[id]}
            </Typography>
          }
        />

        {documentacaoSelecionada.includes(id) && (
          <Box sx={{ ml: 3, mt: 1 }}>
            <FormGroup sx={{ gap: 1 }}>
              {["Primeira Via", "Segunda Via", ...(id === "registro_nascimento" || id === "registro_obito" ? ["Registro Tardio"] : []), "Retificação", "Boletim de Ocorrência para Perda ou Roubo de Documentos"].map((sub, idx) => (
                <FormControlLabel
                  key={idx}
                  control={
                    <Checkbox
                      checked={documentacaoDetalhes?.[id]?.[sub] || false}
                      onChange={() => toggleSubopcaoDocumentacao(id, sub)}
                      size="small"
                      sx={{
                        color: "#2E7D32",
                        '&.Mui-checked': {
                          color: "#2E7D32",
                        },
                      }}
                    />
                  }
                  label={<Typography sx={{ fontSize: "0.85rem" }}>{sub}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>
        )}
      </Box>
    ))}

    <Box>
      <Typography variant="body2" fontWeight="bold" gutterBottom>
        Outros:
      </Typography>
      <TextField
        fullWidth
        value={documentacaoDetalhes.outros || ""}
        onChange={(e) =>
          setDocumentacaoDetalhes((prev) => ({ ...prev, outros: e.target.value }))
        }
        placeholder="Descreva aqui"
        size="small"
        sx={{
          mt: 1,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
          "& input": {
            padding: "8px 10px",
          },
        }}
      />
    </Box>
  </Box>
)}



{tipoAtendimento.includes("saude") && (
  <Box sx={{ mt: 4 }}>
    <Typography
      variant="subtitle1"
      fontWeight="bold"
      gutterBottom
      sx={{ fontSize: "1rem" }}
    >
      🏥 3.4 Atenção à Saúde
    </Typography>

    <FormGroup sx={{ gap: 1 }}>
    {["ubs", "hospital", "dsei_y", "caps"].map((id) => (
  <Box
    key={id}
    sx={{
      border: "1px solid #E0E0E0",
      borderRadius: 3,
      p: 1,
      mb: 1.5,
    }}
  >
    <FormControlLabel
      control={
        <Checkbox
          checked={saudeSelecionada.includes(id)}
          onChange={() => toggleSaude(id)}
          sx={{
            color: "#2E7D32",
            '&.Mui-checked': {
              color: "#2E7D32",
            },
          }}
        />
      }
      label={
        <Typography sx={{ fontSize: "0.85rem" }}>
          {{
            ubs: "Unidade Básica de Saúde (UBS)",
            hospital: "Hospital",
            dsei_y: "Distrito Sanitário Especial Indígena Yanomami (DSEI-Y)",
            caps: "Centro de Atenção Psicossocial (CAPS)",
          }[id]}
        </Typography>
      }
    />
  </Box>
))}

    </FormGroup>

    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" fontWeight="bold" gutterBottom>
        Outros:
      </Typography>
      <TextField
        fullWidth
        size="small"
        value={saudeDetalhes.outros || ""}
        onChange={(e) =>
          setSaudeDetalhes((prev) => ({ ...prev, outros: e.target.value }))
        }
        placeholder="Descreva aqui"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
        }}
      />
    </Box>
  </Box>
)}

{tipoAtendimento.includes("alimentos") && (
  <Box sx={{ mt: 4 }}>
    <Typography
      variant="subtitle1"
      fontWeight="bold"
      gutterBottom
      sx={{ fontSize: "1rem" }}
    >
      🍽️ 3.5 Segurança Alimentar
    </Typography>

      <FormGroup sx={{ gap: 1 }}>
      {["cesta", "refeicao", "restaurante", "encaminhamento"].map((id) => (
        <Box
          key={id}
          sx={{
            border: "1px solid #E0E0E0",
            borderRadius: 3,
            p: 1,
            mb: 1.5,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={segAlimentarSelecionada.includes(id)}
                onChange={() => toggleSegAlimentar(id)}
                sx={{
                  color: "#2E7D32",
                  '&.Mui-checked': {
                    color: "#2E7D32",
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: "0.85rem" }}>
                {{
                  cesta: "Distribuição de Cesta de Alimentos",
                  refeicao: "Oferta de Refeição Pronta",
                  restaurante: "Encaminhamento a Restaurante Popular",
                  encaminhamento: "Encaminhamento para Assistência Alimentar",
                }[id]}
              </Typography>
            }
          />
        </Box>
      ))}
    </FormGroup>

 
     {(segAlimentarSelecionada.includes("cesta")) && (
        <>
          {/* Campo: Quantidade de Cestas */}
          <Grid item xs={12}>
            <TextField
              label="Quantidade de Cestas"
              type="number"
              inputProps={{ min: 0 }}
              value={segAlimentarDetalhes.cesta}
              onChange={(e) =>
                setSegAlimentarDetalhes((prev) => ({
                  ...prev,
                  cesta: parseInt(e.target.value),
                }))
              }
              fullWidth
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: "0.85rem",
                },
              }}
            />
          </Grid>

          {/* Campo: Upload da Imagem */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography
                variant="caption"
                fontWeight="medium"
                color="text.secondary"
                sx={{ fontSize: "0.75rem", mt: 2 }}
              >
                Registro Fotográfico da Entrega
              </Typography>

                <Button
                variant="outlined"
                component="label"
                fullWidth
                size="small"
                startIcon={<PhotoCamera />}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontSize: "0.85rem",
                  justifyContent: "flex-start",
                  padding: "8px 10px",
                }}
              >
                {segAlimentarDetalhes.imagemEntrega
                  ? segAlimentarDetalhes.imagemEntrega.name
                  : "Tirar ou escolher foto"}

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    console.log("📸 Arquivo capturado:", e.target.files);
                    const file = e.target.files?.[0];
                    if (!file) {
                      alert("⚠️ Nenhuma foto foi capturada ou selecionada.");
                      return;
                    }

                    let exifData = null;
                    try {
                      exifData = await exifr.parse(file, { gps: true });
                    } catch (err) {
                      console.warn("Erro ao ler EXIF:", err);
                    }

                    const temGPS = !!exifData?.latitude && !!exifData?.longitude;
                    const temData = !!exifData?.DateTimeOriginal;

                    if (!temGPS || !temData) {
                      setAvisoFoto("⚠️ A imagem não contém dados de localização e/ou data. Ela será enviada sem carimbo.");
                      setSegAlimentarDetalhes((prev) => ({
                        ...prev,
                        imagemEntrega: file,
                      }));
                      return;
                    }

                    const nomeProjeto = "Missão Proteção Social Yanomami";
                    const nomeComunidade =
                      comunidadeSelecionada?.value === "outros"
                        ? comunidadeManual
                        : comunidadeSelecionada?.label || "Comunidade não informada";

                    const latitude = exifData.latitude;
                    const longitude = exifData.longitude;
                    const data = exifData.DateTimeOriginal;

                    const opcoesData = {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    };
                    const dataFormatada = new Intl.DateTimeFormat("pt-BR", opcoesData).format(data);
                    const hora = new Date(data).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const textoCarimbo = `${nomeProjeto}
              ${nomeComunidade}
              Coordenadas: ${latitude}, ${longitude}
              ${dataFormatada} às ${hora}`;

                    const blob = await addTimestampToImage(file, textoCarimbo);
                    const imagemFinal = new File([blob], `entrega_${Date.now()}.jpg`, {
                      type: "image/jpeg",
                    });

                    setAvisoFoto(null); // limpa o aviso
                    setSegAlimentarDetalhes((prev) => ({
                      ...prev,
                      imagemEntrega: imagemFinal,
                    }));
                  }}
                />
              </Button>

              {/* Aviso caso não tenha EXIF */}
              {avisoFoto && (
                <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                  {avisoFoto}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Pré-visualização da imagem */}
          {segAlimentarDetalhes.imagemEntrega && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Pré-visualização da imagem:
              </Typography>
              <img
                src={URL.createObjectURL(segAlimentarDetalhes.imagemEntrega)}
                alt="Imagem da entrega"
                style={{
                  maxWidth: "100%",
                  border: "1px solid #ccc",
                  marginTop: "0.5rem",
                }}
              />
            </Grid>
          )}
        </>
      )}
      
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" fontWeight="bold" gutterBottom>
        Outros:
      </Typography>
      <TextField
        fullWidth
        size="small"
        value={segAlimentarDetalhes.outros || ""}
        onChange={(e) =>
          setSegAlimentarDetalhes((prev) => ({
            ...prev,
            outros: e.target.value,
          }))
        }
        placeholder="Descreva aqui"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontSize: "0.85rem",
          },
        }}
      />
    </Box>
  </Box>
)}

{tipoAtendimento.includes("outros") && (
  <Box>
    <Typography
      variant="subtitle1"
      fontWeight="bold"
      sx={{ fontSize: "1rem", mb: 2, mt: 4, display: "flex", alignItems: "center", gap: 1 }}
    >
      🧰 3.6 Outros Atendimentos
    </Typography>

    <FormGroup sx={{ flexDirection: "column", gap: 2 }}>
      {/* Entrega de Insumos */}
      <Box sx={{ border: "1px solid #E0E0E0", borderRadius: 3, p: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Checkbox
            checked={outrosDetalhes.insumos}
            onChange={() => toggleOutros("insumos")}
            sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
            size="small"
          />
          <span style={{ fontSize: "0.85rem" }}>Entrega de Insumos</span>
        </Box>

        {outrosDetalhes.insumos && (
          <Box ml={4} mt={1}>
            <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Checkbox
                  checked={outrosDetalhes.rede_dormir}
                  onChange={() => toggleOutros("rede_dormir")}
                  sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
                  size="small"
                />
                <span style={{ fontSize: "0.85rem" }}>Rede de Dormir</span>
              </Box>

              {outrosDetalhes.rede_dormir && (
                <Box>
                  <span style={{ fontSize: "0.85rem", color: "#555", display: "inline-block", marginBottom: 4, marginLeft: 2 }}>
                    Quantidade de Redes
                  </span>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    placeholder="Digite a quantidade"
                    value={outrosDetalhes.rede_dormir_qtd || ""}
                    onChange={(e) =>
                      setOutrosDetalhes((prev) => ({ ...prev, rede_dormir_qtd: parseInt(e.target.value) }))
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: "0.85rem" },
                      '& input': { padding: "8px 10px" },
                    }}
                  />
                </Box>
              )}
            </FormGroup>
          </Box>
        )}
      </Box>

      {/* Acompanhamento */}
      <Box sx={{ border: "1px solid #E0E0E0", borderRadius: 3, p: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Checkbox
            checked={outrosDetalhes.acompanhamento}
            onChange={() => toggleOutros("acompanhamento")}
            sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
            size="small"
          />
          <span style={{ fontSize: "0.85rem" }}>Acompanhamento</span>
        </Box>

        {outrosDetalhes.acompanhamento && (
          <Box ml={4} mt={1}>
            <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
              {["banco", "comercio", "delegacia"].map((key) => (
                <Box key={key} display="flex" alignItems="center" gap={1}>
                  <Checkbox
                    checked={outrosDetalhes[key] || false}
                    onChange={() => toggleOutros(key)}
                    sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
                    size="small"
                  />
                  <span style={{ fontSize: "0.85rem" }}>
                    {{
                      banco: "Banco / Agência",
                      comercio: "Comércio Local",
                      delegacia: "Delegacia",
                    }[key]}
                  </span>
                </Box>
              ))}
            </FormGroup>
          </Box>
        )}
      </Box>

      {/* Artesanato */}
      <Box sx={{ border: "1px solid #E0E0E0", borderRadius: 3, p: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Checkbox
            checked={outrosDetalhes.artesanato}
            onChange={() => toggleOutros("artesanato")}
            sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
            size="small"
          />
          <span style={{ fontSize: "0.85rem" }}>Atividade com Artesanato</span>
        </Box>
      </Box>

      {/* Apoio Logístico */}
      <Box sx={{ border: "1px solid #E0E0E0", borderRadius: 3, p: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Checkbox
            checked={outrosDetalhes.apoio_logistico}
            onChange={() => toggleOutros("apoio_logistico")}
            sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
            size="small"
          />
          <span style={{ fontSize: "0.85rem" }}>Apoio Logístico</span>
        </Box>

        {outrosDetalhes.apoio_logistico && (
          <Box ml={4} mt={1}>
            <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Checkbox
                  checked={outrosDetalhes.combustivel || false}
                  onChange={() => toggleOutros("combustivel")}
                  sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
                  size="small"
                />
                <span style={{ fontSize: "0.85rem" }}>Combustível</span>
              </Box>

              {outrosDetalhes.combustivel && (
                <Box>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "#555",
                      display: "inline-block",
                      marginBottom: 4,
                      marginLeft: 2,
                    }}
                  >
                    Quantidade de litros
                  </span>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    placeholder="Digite a quantidade"
                    value={outrosDetalhes.combustivel_qtd || ""}
                    onChange={(e) =>
                      setOutrosDetalhes((prev) => ({ ...prev, combustivel_qtd: parseInt(e.target.value) }))
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: "0.85rem",
                      },
                      '& input': {
                        padding: "8px 10px",
                      },
                    }}
                  />
                </Box>
              )}

              {["deslocamento_aereo", "deslocamento_terrestre", "deslocamento_fluvial"].map((key) => (
                <Box key={key} display="flex" alignItems="center" gap={1}>
                  <Checkbox
                    checked={outrosDetalhes[key] || false}
                    onChange={() => toggleOutros(key)}
                    sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
                    size="small"
                  />
                  <span style={{ fontSize: "0.85rem" }}>
                    {{
                      deslocamento_aereo: "Deslocamento Aéreo",
                      deslocamento_terrestre: "Deslocamento Terrestre",
                      deslocamento_fluvial: "Deslocamento Fluvial",
                    }[key]}
                  </span>
                </Box>
              ))}
            </FormGroup>
          </Box>
        )}
      </Box>

      <Box>
        <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#000" }}>Outros:</span>
        <TextField
          fullWidth
          size="small"
          placeholder="Descreva aqui"
          value={outrosDetalhes.outros_geral || ""}
          onChange={(e) => setOutrosDetalhes((prev) => ({ ...prev, outros_geral: e.target.value }))}
          sx={{
            mt: 1,
            '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: "0.85rem" },
            '& input': { padding: "8px 10px" },
          }}
        />
      </Box>
    </FormGroup>
  </Box>
)}

</Box>

 <Box
  sx={{
    backgroundColor: "#ffffff",
    borderRadius: 2,
    border: "1px solid #E0E0E0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    p: 3,
    mt: 4,
  }}
>
  <Typography
    variant="subtitle1"
    fontWeight="bold"
    gutterBottom
    sx={{ fontSize: "1rem", mb: 2 }}
  >
    📑 Observações
  </Typography>

  <TextField
    multiline
    fullWidth
    rows={4}
    placeholder="Escreva aqui observações adicionais..."
    value={observacoes}
    onChange={(e) => setObservacoes(e.target.value)}
    variant="outlined"
    size="small"
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        fontSize: "0.85rem",
      },
      "& textarea": {
        padding: "10px",
      },
    }}
  />
</Box>


<Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} mt={4}>
  {/* Botão Limpar Formulário */}
 <Button
  onClick={handleClear}
  variant="outlined"
  sx={{
    px: 3,
    py: 1,
    fontWeight: 600,
    borderRadius: 2,
    textTransform: "none",
    color: "#2E7D32",         
    borderColor: "#2E7D32",  
    "&:hover": {
      backgroundColor: "#E8F5E9", 
      borderColor: "#1B5E20",     
      color: "#1B5E20",          
    },
  }}
>
  Limpar Formulário
</Button>


  {/* Botão Salvar Atendimento */}
  <Button
    onClick={handleSubmit}
    disabled={isSubmitting}
    variant="contained"
    sx={{
      px: 3,
      py: 1,
      fontWeight: 600,
      borderRadius: 2,
      backgroundColor: isSubmitting ? "#9e9e9e" : "#2E7D32",
      color: "#fff",
      textTransform: "none",
      "&:hover": {
        backgroundColor: isSubmitting ? "#9e9e9e" : "#1666c1",
      },
    }}
  >
    {isSubmitting ? "Enviando..." : "Salvar Atendimento"}
  </Button>

  <Button
    onClick={handleLogout}
    variant="text"
    sx={{
      color: "#d32f2f",
      fontSize: "0.875rem",
      textDecoration: "underline",
      textTransform: "none",
      "&:hover": {
        color: "#9a0007",
      },
    }}
  >
    Sair
  </Button>
</Box>


    </div>
  );
}