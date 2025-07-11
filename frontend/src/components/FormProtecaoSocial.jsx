import { useEffect, useState } from "react";
import { supabaseAssistencia } from "../lib/supabaseAssistencia";
import { supabaseCestas } from "../lib/supabaseCestas";
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
  const [dataHora, setDataHora] = useState("");
  const [coordenadas, setCoordenadas] = useState({ latitude: "", longitude: "" });
  const [nome, setNome] = useState("");
  const [comunidades, setComunidades] = useState([]);
  const [comunidadeSelecionada, setComunidadeSelecionada] = useState(null);
  const [comunidadeManual] = useState("");
  const [adultos, setAdultos] = useState(0);
  const [criancas, setCriancas] = useState(0);
  const [idosos, setIdosos] = useState(0);
  const [modalDeslocamento, setModalDeslocamento] = useState({
  terrestre: [],
  fluvial: [],
  aereo: [],
});
  const [orgaos, setOrgaos] = useState({ viatura: "", embarcacao: "", freteOficial: "" });
  const [opcaoOrgao, setOpcaoOrgao] = useState({ viatura: "", embarcacao: "", freteOficial: "" });
  const orgaosDisponiveis = ["DSEI-Y", "FUNAI", "Exército"];
  const [tempoDeslocamento, setTempoDeslocamento] = useState("");
  const [tipoAtendimento, setTipoAtendimento] = useState([]);
  const [assistenciaSelecionada, setAssistenciaSelecionada] = useState([]);
  const [setCarregandoComunidades] = useState(false);
  const [precisaInterprete, setPrecisaInterprete] = useState(false);
  const [assistenciaDetalhes, setAssistenciaDetalhes] = useState({ baixa: {}, bpc: {}, alta: {}, outros: "" });
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
  const [localUnidade] = useState("");
  const [saudeDetalhes, setSaudeDetalhes] = useState({ outros: "" });
  const [segAlimentarSelecionada, setSegAlimentarSelecionada] = useState([]);
  const [segAlimentarDetalhes, setSegAlimentarDetalhes] = useState({ refeicao: 0, cesta: 0, outros: "" });
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
    novosErros.push("O nome da pessoa atendida é obrigatório.");
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

  if (modalDeslocamento.aereo.includes("Frete aéreo Oficial") && !orgaos.freteOficial.trim()) {
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
  if (isSubmitting) return; 

  setIsSubmitting(true); // Ativa bloqueio de envio imediatamente

  try {
    // ✅ 1. Inserção em informacoes_pessoais
    const { data: atendimentoData, error: atendimentoError } = await supabaseAssistencia
      .from("informacoes_pessoais")
      .insert([{
        nome_servidor: servidor,
        data_hora: dataHora,
        nome_atendido: nome,
        comunidade: comunidadeSelecionada?.label || comunidadeManual,
        subpolo: comunidadeSelecionada?.subpolo?.nome_subpolo || null,
        polo: comunidadeSelecionada?.subpolo?.polo?.nome_polo || null,
        municipio,
        tipo_unidade: localUnidade,
        data_atendimento: dataAtendimento,
        precisa_interprete: precisaInterprete,
        latitude: coordenadas.latitude,
        longitude: coordenadas.longitude,
        adultos,
        criancas,
        idosos,
        observacoes
      }])
      .select()
      .single();

    if (atendimentoError) {
      alert("Erro ao salvar informações pessoais: " + atendimentoError.message);
      return;
    }


    const id_atendimento = atendimentoData.id_atendimento;

    // ✅ 2. Inserção em informacoes_deslocamento
    const deslocamentos = [];
    Object.entries(modalDeslocamento).forEach(([modal, meios]) => {
      meios.forEach((meio) => {
        deslocamentos.push({
          id_atendimento,
          tipo_modal: modal,
          meio,
          orgao:
            modal === "terrestre" && meio === "Viatura Oficial"
              ? orgaos.viatura
              : modal === "fluvial" && meio === "Embarcação Oficial"
              ? orgaos.embarcacao
              : modal === "aereo" && meio === "Frete aéreo Oficial"
              ? orgaos.freteOficial
              : null,
          tempo_deslocamento: tempoDeslocamento
        });
      });
    });

    if (deslocamentos.length > 0) {
      await supabaseAssistencia.from("informacoes_deslocamento").insert(deslocamentos);
    }

    // ✅ 3. Atendimento: Assistência Social
    if (tipoAtendimento.includes("assistencia")) {
      const { baixa, alta, outros, bpc = {} } = assistenciaDetalhes;

      await supabaseAssistencia.from("atendimento_assistencia").insert([{
        id_atendimento,
        complexidade: assistenciaSelecionada.includes("baixa")
          ? "baixa"
          : assistenciaSelecionada.includes("alta")
          ? "alta"
          : null,
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

    // ✅ 4. Atendimento: Previdência
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

      await supabaseAssistencia.from("atendimento_previdencia").insert(previdencias);
    }

    // ✅ 5. Atendimento: Documentação
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

      await supabaseAssistencia.from("atendimento_documentacao").insert(documentacoes);
    }

    // ✅ 6. Atendimento: Saúde
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

    // ✅ 7. Atendimento: Segurança Alimentar
    if (tipoAtendimento.includes("alimentos")) {
      await supabaseAssistencia.from("atendimento_seguranca_alimentar").insert([{
        id_atendimento,
        cesta: segAlimentarSelecionada.includes("cesta"),
        quantidade_cesta: segAlimentarSelecionada.includes("cesta") ? segAlimentarDetalhes.cesta : null,
        refeicao: segAlimentarSelecionada.includes("refeicao"),
        quantidade_refeicao: segAlimentarSelecionada.includes("refeicao") ? segAlimentarDetalhes.refeicao : null,
        restaurante: segAlimentarSelecionada.includes("restaurante"),
        encaminhamento: segAlimentarSelecionada.includes("encaminhamento"),
        outros: segAlimentarDetalhes.outros || null
      }]);
    }

    // ✅ 8. Atendimento: Outros
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

    setErros([]); // limpa a caixa de erros, se houver
    alert("Formulário enviado com sucesso!");

  } catch (err) {
    console.error("Erro ao enviar formulário", err);
    alert("Erro ao enviar formulário. Verifique os dados e tente novamente.");
  } finally {
    setIsSubmitting(false);
  }
};

const handleClear = () => {
  setServidor("");
  setDataHora(new Date().toISOString().slice(0, 16));
  setCoordenadas({ latitude: "", longitude: "" });
  setNome("");
  setComunidadeSelecionada(null);
  setAdultos(0);
  setCriancas(0);
  setIdosos(0);
  setMunicipio("");
  setModalDeslocamento({ terrestre: [], fluvial: [], aereo: [] });
  setOrgaos({ viatura: "", embarcacao: "", freteOficial: "" });
  setOpcaoOrgao({ viatura: "", embarcacao: "", freteOficial: "" });
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



  const subopcoesPadrao = [
    { key: "cear", label: "Preenchimento de Certidão de Exercício de Atividade Rural (CEAR)" },
    { key: "meuInss", label: "Cadastro Meu INSS" },
    { key: "requerimento", label: "Abertura de requerimento" },
    { key: "consulta", label: "Consulta" },
    { key: "exigencia", label: "Cumprimento de Exigência" }
  ];

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
      const lat = position.coords.latitude.toFixed(5);
      const lon = position.coords.longitude.toFixed(5);

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

    const chave = chaveComunidade(c);
    const chaveDuplicada = contadorChaves[chave] > 1;
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
        value={`Lat: ${coordenadas.latitude}, Lon: ${coordenadas.longitude}`}
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
        Nome da Pessoa Atendida
      </Typography>
      <TextField
        placeholder="Digite o nome completo"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
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

    {/* Comunidade */}
 
    {/* Comunidade */}
    <Grid item xs={12}>
      <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
        Comunidade
      </Typography>
<Autocomplete
  options={comunidades}
  getOptionLabel={(option) => option.label}
  isOptionEqualToValue={(option, value) => option.value === value.value}
  value={comunidadeSelecionada}
  onChange={(event, newValue) => setComunidadeSelecionada(newValue)}
  renderOption={(props, option) => (
    <li {...props} key={option.value}>
      {option.label}
    </li>
  )}
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Nome da comunidade"
      variant="outlined"
      size="small"
    />
  )}
/>



      {comunidadeSelecionada && (
        <Box mt={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
                Subpolo
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

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
                Polo
              </Typography>
              <TextField
                value={comunidadeSelecionada.subpolo?.polo?.nome_polo || "—"}
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
      <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
        Número de Acompanhantes
      </Typography>
      <Grid container spacing={2}>
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
      fontSize: "1rem",
      display: "flex",
      alignItems: "center",
      gap: 1,
    }}
  >
    🚗 Modal de Deslocamento
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
      <Box ml={4} mt={2}>
        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
          Órgão responsável:
        </Typography>

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
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.85rem",
            },
          }}
        >
          <MenuItem value="">Selecione o órgão</MenuItem>
          {[...orgaosDisponiveis, "Outros"].map((opcao) => (
            <MenuItem key={opcao} value={opcao}>
              {opcao}
            </MenuItem>
          ))}
        </TextField>

        {opcaoOrgao.viatura === "Outros" && (
          <TextField
            fullWidth
            size="small"
            placeholder="Órgão"
            value={orgaos.viatura}
            onChange={(e) =>
              setOrgaos((prev) => ({ ...prev, viatura: e.target.value }))
            }
            sx={{
              mt: 2,
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
      </Box>
    )}

    {modalDeslocamento.terrestre.includes("Outros") && (
      <Box ml={4} mt={2}>
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
      <Box ml={4} mt={2}>
        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
          Órgão responsável:
        </Typography>

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
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.85rem",
            },
          }}
        >
          <MenuItem value="">Selecione o órgão</MenuItem>
          {[...orgaosDisponiveis, "Outros"].map((opcao) => (
            <MenuItem key={opcao} value={opcao}>
              {opcao}
            </MenuItem>
          ))}
        </TextField>

        {opcaoOrgao.embarcacao === "Outros" && (
          <TextField
            fullWidth
            size="small"
            placeholder="Órgão"
            value={orgaos.embarcacao}
            onChange={(e) =>
              setOrgaos((prev) => ({ ...prev, embarcacao: e.target.value }))
            }
            sx={{
              mt: 2,
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
      </Box>
    )}

    {modalDeslocamento.fluvial.includes("Outros") && (
      <Box ml={4} mt={2}>
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
      <Box ml={4} mt={2}>
        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
          Órgão responsável:
        </Typography>

        <TextField
          select
          fullWidth
          size="small"
          value={opcaoOrgao.freteOficial}
          onChange={(e) => {
            const valor = e.target.value;
            handleSelectOrgao("freteOficial", valor === "Outros" ? "" : valor);
            setOpcaoOrgao((prev) => ({ ...prev, freteOficial: valor }));
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.85rem",
            },
          }}
        >
          <MenuItem value="">Selecione o órgão</MenuItem>
          {[...orgaosDisponiveis, "Outros"].map((opcao) => (
            <MenuItem key={opcao} value={opcao}>
              {opcao}
            </MenuItem>
          ))}
        </TextField>

        {opcaoOrgao.freteOficial === "Outros" && (
          <TextField
            fullWidth
            size="small"
            placeholder="Órgão"
            value={orgaos.freteOficial}
            onChange={(e) =>
              setOrgaos((prev) => ({ ...prev, freteOficial: e.target.value }))
            }
            sx={{
              mt: 2,
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
      </Box>
    )}

    {modalDeslocamento.aereo.includes("Outros") && (
      <Box ml={4} mt={2}>
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
          borderRadius: 2,
          p: 2,
          mb: 2,
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
      sx={{ fontSize: "1rem" }}
    >
      🏫 3.2 Previdência Social
    </Typography>

    {["salario_maternidade", "aposentadoria", "pensao_morte", "auxilio_incapacidade", "auxilio_reclusao"].map((id) => (
      <Box
        key={id}
        sx={{
          border: "1px solid #ccc",
          borderRadius: 2,
          p: 2,
          mb: 2,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={previdenciaSelecionada.includes(id)}
              onChange={() => togglePrevidencia(id)}
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
              {id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Typography>
          }
        />

        {previdenciaSelecionada.includes(id) && (
          <Box sx={{ ml: 3, mt: 1 }}>
            <FormGroup sx={{ gap: 1 }}>
              {[
                {
                  key: "cear",
                  label:
                    "Preenchimento de Certidão de Exercício de Atividade Rural (CEAR)",
                },
                { key: "meuInss", label: "Cadastro Meu INSS" },
                { key: "requerimento", label: "Abertura de requerimento" },
                { key: "consulta", label: "Consulta" },
                { key: "exigencia", label: "Cumprimento de Exigência" },
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
      </Box>
    ))}
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
          border: "1px solid #ccc",
          borderRadius: 2,
          p: 2,
          mb: 2,
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
        <FormControlLabel
          key={id}
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
        <FormControlLabel
          key={id}
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
      ))}
    </FormGroup>

    {(segAlimentarSelecionada.includes("cesta") ||
      segAlimentarSelecionada.includes("refeicao")) && (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {segAlimentarSelecionada.includes("cesta") && (
          <Grid item xs={12} sm={6}>
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
        )}
        {segAlimentarSelecionada.includes("refeicao") && (
          <Grid item xs={12} sm={6}>
            <TextField
              label="Quantidade de Refeições"
              type="number"
              inputProps={{ min: 0 }}
              value={segAlimentarDetalhes.refeicao}
              onChange={(e) =>
                setSegAlimentarDetalhes((prev) => ({
                  ...prev,
                  refeicao: parseInt(e.target.value),
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
        )}
      </Grid>
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
      sx={{ fontSize: "1rem", mb: 2, mt: 4 }}
    >
      🧰 3.6 Outros Atendimentos
    </Typography>

    <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={outrosDetalhes.insumos}
            onChange={() => toggleOutros("insumos")}
            sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
            size="small"
          />
        }
        label={<Typography sx={{ fontSize: "0.85rem" }}>Entrega de Insumos</Typography>}
      />
      {outrosDetalhes.insumos && (
        <Box ml={4}>
          <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={outrosDetalhes.rede_dormir}
                  onChange={() => toggleOutros("rede_dormir")}
                  sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
                  size="small"
                />
              }
              label={<Typography sx={{ fontSize: "0.85rem" }}>Rede de Dormir</Typography>}
            />
            {outrosDetalhes.rede_dormir && (
              <TextField
                fullWidth
                type="number"
                size="small"
                label="Quantidade de Redes"
                value={outrosDetalhes.rede_dormir_qtd || ""}
                onChange={(e) => setOutrosDetalhes((prev) => ({ ...prev, rede_dormir_qtd: parseInt(e.target.value) }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: "0.85rem" } }}
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={outrosDetalhes.outros}
                  onChange={() => toggleOutros("outros")}
                  sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
                  size="small"
                />
              }
              label={<Typography sx={{ fontSize: "0.85rem" }}>Outros Itens</Typography>}
            />
            {outrosDetalhes.outros && (
              <Box>
                <TextField
                  fullWidth
                  size="small"
                  label="Descrição"
                  value={outrosDetalhes.outros_desc || ""}
                  onChange={(e) => setOutrosDetalhes((prev) => ({ ...prev, outros_desc: e.target.value }))}
                  sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: "0.85rem" } }}
                />
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label="Quantidade"
                  value={outrosDetalhes.outros_qtd || ""}
                  onChange={(e) => setOutrosDetalhes((prev) => ({ ...prev, outros_qtd: parseInt(e.target.value) }))}
                  sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: "0.85rem" } }}
                />
              </Box>
            )}
          </FormGroup>
        </Box>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={outrosDetalhes.acompanhamento}
            onChange={() => toggleOutros("acompanhamento")}
            sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
            size="small"
          />
        }
        label={<Typography sx={{ fontSize: "0.85rem" }}>Acompanhamento</Typography>}
      />
      {outrosDetalhes.acompanhamento && (
        <Box ml={4}>
          <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
            {["banco", "comercio", "delegacia"].map((key) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={outrosDetalhes[key] || false}
                    onChange={() => toggleOutros(key)}
                    sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
                    size="small"
                  />
                }
                label={<Typography sx={{ fontSize: "0.85rem" }}>{{
                  banco: "Banco / Agência",
                  comercio: "Comércio Local",
                  delegacia: "Delegacia",
                }[key]}</Typography>}
              />
            ))}
          </FormGroup>
        </Box>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={outrosDetalhes.artesanato}
            onChange={() => toggleOutros("artesanato")}
            sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
            size="small"
          />
        }
        label={<Typography sx={{ fontSize: "0.85rem" }}>Atividade com Artesanato</Typography>}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={outrosDetalhes.apoio_logistico}
            onChange={() => toggleOutros("apoio_logistico")}
            sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
            size="small"
          />
        }
        label={<Typography sx={{ fontSize: "0.85rem" }}>Apoio Logístico</Typography>}
      />
      {outrosDetalhes.apoio_logistico && (
        <Box ml={4}>
          <FormGroup sx={{ flexDirection: "column", gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={outrosDetalhes.combustivel || false}
                  onChange={() => toggleOutros("combustivel")}
                  sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
                  size="small"
                />
              }
              label={<Typography sx={{ fontSize: "0.85rem" }}>Combustível</Typography>}
            />
            {outrosDetalhes.combustivel && (
              <TextField
                fullWidth
                type="number"
                size="small"
                label="Quantidade de litros"
                value={outrosDetalhes.combustivel_qtd || ""}
                onChange={(e) => setOutrosDetalhes((prev) => ({ ...prev, combustivel_qtd: parseInt(e.target.value) }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: "0.85rem" } }}
              />
            )}

            {["deslocamento_aereo", "deslocamento_terrestre", "deslocamento_fluvial"].map((key) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={outrosDetalhes[key] || false}
                    onChange={() => toggleOutros(key)}
                    sx={{ color: "#2E7D32", '&.Mui-checked': { color: "#2E7D32" } }}
                    size="small"
                  />
                }
                label={<Typography sx={{ fontSize: "0.85rem" }}>{{
                  deslocamento_aereo: "Deslocamento Aéreo",
                  deslocamento_terrestre: "Deslocamento Terrestre",
                  deslocamento_fluvial: "Deslocamento Fluvial",
                }[key]}</Typography>}
              />
            ))}
          </FormGroup>
        </Box>
      )}
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
      backgroundColor: isSubmitting ? "#9e9e9e" : "#1a73e8",
      color: "#fff",
      textTransform: "none",
      "&:hover": {
        backgroundColor: isSubmitting ? "#9e9e9e" : "#1666c1",
      },
    }}
  >
    {isSubmitting ? "Enviando..." : "Salvar Atendimento"}
  </Button>

  {/* Botão Sair (opcional e discreto) */}
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