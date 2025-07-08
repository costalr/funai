import { useEffect, useState } from "react";
import Select from "react-select";
import { supabaseAssistencia } from "../lib/supabaseAssistencia";

export default function FormularioProtecao() {
  const [servidor, setServidor] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [coordenadas, setCoordenadas] = useState({ latitude: "", longitude: "" });
  const [nome, setNome] = useState("");
  const [comunidades, setComunidades] = useState([]);
  const [comunidadeSelecionada, setComunidadeSelecionada] = useState(null);
  const [comunidadeManual, setComunidadeManual] = useState("");
  const [adultos, setAdultos] = useState(0);
  const [criancas, setCriancas] = useState(0);
  const [idosos, setIdosos] = useState(0);
  const [modalDeslocamento, setModalDeslocamento] = useState({ terrestre: [], fluvial: [], aereo: [] });
  const [orgaos, setOrgaos] = useState({ viatura: "", embarcacao: "", freteOficial: "" });
  const [tempoDeslocamento, setTempoDeslocamento] = useState("");
  const [tipoAtendimento, setTipoAtendimento] = useState([]);
  const [assistenciaSelecionada, setAssistenciaSelecionada] = useState([]);
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
  const [saudeDetalhes, setSaudeDetalhes] = useState({ outros: "" });
  const [segAlimentarSelecionada, setSegAlimentarSelecionada] = useState([]);
  const [segAlimentarDetalhes, setSegAlimentarDetalhes] = useState({ refeicao: 0, cesta: 0, outros: "" });
  const [outrosModais, setOutrosModais] = useState({
  terrestre: "",
  fluvial: "",
  aereo: ""
    });

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
    ["Boa Vista", "São Gabriel da Cachoeira", "Santa Isabel do Rio Negro", "Barcelos", "Brasília"].includes(municipio) &&
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
  if (isSubmitting) return; // Redundância segura

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
  const [localUnidade, setLocalUnidade] = useState("");


useEffect(() => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario) setServidor(usuario.nome_completo);

  const agora = new Date();
  const offset = agora.getTimezoneOffset();
  const localDate = new Date(agora.getTime() - offset * 60000).toISOString().slice(0, 16);
  setDataHora(localDate);

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

    async function fetchComunidades() {
      const cache = localStorage.getItem("comunidades_cache");
      const cacheTimestamp = localStorage.getItem("comunidades_cache_time");

      const agora = new Date().getTime();
      const validade = 1000 * 60 * 60 * 24;

      if (cache && cacheTimestamp && agora - cacheTimestamp < validade) {
        const comunidadesCache = JSON.parse(cache);
        setComunidades(comunidadesCache);
        console.log("📦 Cache encontrado?", !!cache, "Timestamp:", cacheTimestamp);
        return;
      }

      const { data, error } = await supabaseAssistencia
        .from("comunidade")
        .select(`id_comunidade, nome_comunidade, subpolo (nome_subpolo, polo (nome_polo))`)
        .order("nome_comunidade", { ascending: true });

        if (error) {
        console.error("❌ Erro ao buscar comunidades:", error);
      } else {
        console.log("✅ Comunidades carregadas:", data?.length);
        console.log(data?.slice(0, 3)); // só as primeiras pra não lotar o console
      }
    }


  const toggleOption = (categoria, opcao) => {
    setModalDeslocamento((prev) => {
      const selecionadas = prev[categoria];
      return {
        ...prev,
        [categoria]: selecionadas.includes(opcao)
          ? selecionadas.filter((item) => item !== opcao)
          : [...selecionadas, opcao]
      };
    });
  };

  

  return (

    
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Formulário de Proteção Social</h2>
        <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Sair
          </button>
        {erros.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <ul className="list-disc pl-5">
            {erros.map((erro, i) => (
              <li key={i}>{erro}</li>
            ))}
          </ul>
        </div>
      )}

          <label className="block font-semibold text-gray-700">Nome do Servidor</label>
      <input
        value={servidor}
        disabled
        className="w-full border px-2 py-1 mb-4 bg-gray-100 text-gray-500 cursor-not-allowed"
      />

    <label className="block font-semibold text-gray-700">Horário e Data</label>
      <input
        value={dataHora}
        disabled
        className="w-full border px-2 py-1 mb-4 bg-gray-100 text-gray-500 cursor-not-allowed"
      />

      <label className="block font-semibold text-gray-700">Local de Atendimento (Coordenadas)</label>
      <input
        value={`Lat: ${coordenadas.latitude}, Lon: ${coordenadas.longitude}`}
        disabled
        className="w-full border px-2 py-1 mb-4 bg-gray-100 text-gray-500 cursor-not-allowed"
      />

      <label className="block font-semibold text-gray-700">Município</label>
      <input
        value={municipio}
        disabled
        className="w-full border px-2 py-1 mb-4 bg-gray-100 text-gray-500 cursor-not-allowed"
      />

      {["Boa Vista", "São Gabriel da Cachoeira", "Santa Isabel do Rio Negro", "Barcelos", "Brasília"].includes(municipio) && (
        <div className="mb-4">
          <label className="block font-semibold text-gray-700">Interno ou Externo?</label>
          <select
            value={localUnidade}
            onChange={(e) => setLocalUnidade(e.target.value)}
            className="w-full border px-2 py-1"
          >
            <option value="">Selecione...</option>
            <option value="Sede">Sede da Unidade Desconcentrada</option>
            <option value="Externo">Atendimento Externo</option>
          </select>
        </div>
      )}


      <fieldset className="border rounded p-4 mb-6">

       <h3 className="text-xl font-bold mb-4">1. Informações do Atendido</h3>

      <h4 className="text-lg font-semibold mt-6 mb-2">1.1 Nome da Pessoa Atendida</h4>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full border px-2 py-1 mb-4"
        required
      />

      <h4 className="text-lg font-semibold mt-6 mb-2">1.2 Comunidade</h4>
      <Select
        options={comunidades}
        onChange={setComunidadeSelecionada}
        className="mb-4"
      />

      {comunidadeSelecionada?.value === "outro" && (
        <input
          placeholder="Informe o nome da comunidade"
          value={comunidadeManual}
          onChange={(e) => setComunidadeManual(e.target.value)}
          className="w-full border px-2 py-1 mb-4"
        />
      )}

      {comunidadeSelecionada?.subpolo && (
        <div className="mb-4 text-sm text-gray-600">
          <p><strong>Subpolo:</strong> {comunidadeSelecionada.subpolo.nome_subpolo}</p>
          <p><strong>Polo:</strong> {comunidadeSelecionada.subpolo.polo?.nome_polo}</p>
        </div>
      )}

        <h4 className="text-lg font-semibold mt-6 mb-2">1.3 Número de Acompanhantes</h4>
        <div className="flex gap-4 mb-4">
          <div>
            <label>Adultos</label>
            <input
              type="number"
              min="0" 
              value={adultos}
              onChange={(e) => setAdultos(parseInt(e.target.value))}
              className="w-full border px-2 py-1"
            />
          </div>
        <div>
          <label>Crianças</label>
          <input
            type="number"
            min="0"
            value={criancas}
            onChange={(e) => setCriancas(parseInt(e.target.value))}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Idosos</label>
          <input
            type="number"
            min="0"
            value={idosos}
            onChange={(e) => setIdosos(parseInt(e.target.value))}
            className="w-full border px-2 py-1"
          />
        </div>
      </div>
          </fieldset>
      <fieldset className="border p-4 rounded mb-6">
        <h3 className="text-xl font-bold mt-8 mb-4">2. Informações de Deslocamento</h3>
       <h4 className="text-lg font-semibold mt-6 mb-2">2.1 Modal de Deslocamento</h4>
<fieldset className="mb-4">
  <legend className="font-medium">Terrestre</legend>
  {["A pé", "Carona", "Viatura Oficial", "Veículo Fretado", "Outros"].map((opcao) => (
    <label key={opcao} className="block">
      <input
        type="checkbox"
        checked={modalDeslocamento.terrestre.includes(opcao)}
        onChange={() => toggleOption("terrestre", opcao)}
      /> {opcao}
    </label>
  ))}

  {modalDeslocamento.terrestre.includes("Viatura Oficial") && (
    <input
      type="text"
      placeholder="Órgão"
      className="border px-2 py-1 w-full"
      value={orgaos.viatura}
      onChange={(e) => setOrgaos({ ...orgaos, viatura: e.target.value })}
    />
  )}

  {modalDeslocamento.terrestre.includes("Outros") && (
    <input
      type="text"
      placeholder="Descreva o modal terrestre"
      className="border px-2 py-1 w-full mt-2"
      value={outrosModais.terrestre}
      onChange={(e) =>
        setOutrosModais((prev) => ({ ...prev, terrestre: e.target.value }))
      }
    />
  )}
</fieldset>

<fieldset className="mb-4">
  <legend className="font-medium">Fluvial</legend>
  {["Motor Rabeta", "Motor de Popa", "Embarcação Oficial", "Outros"].map((opcao) => (
    <label key={opcao} className="block">
      <input
        type="checkbox"
        checked={modalDeslocamento.fluvial.includes(opcao)}
        onChange={() => toggleOption("fluvial", opcao)}
      /> {opcao}
    </label>
  ))}

  {modalDeslocamento.fluvial.includes("Embarcação Oficial") && (
    <input
      type="text"
      placeholder="Órgão"
      className="border px-2 py-1 w-full"
      value={orgaos.embarcacao}
      onChange={(e) => setOrgaos({ ...orgaos, embarcacao: e.target.value })}
    />
  )}

  {modalDeslocamento.fluvial.includes("Outros") && (
    <input
      type="text"
      placeholder="Descreva o modal fluvial"
      className="border px-2 py-1 w-full mt-2"
      value={outrosModais.fluvial}
      onChange={(e) =>
        setOutrosModais((prev) => ({ ...prev, fluvial: e.target.value }))
      }
    />
  )}
</fieldset>

<fieldset className="mb-4">
  <legend className="font-medium">Aéreo</legend>
  {["Frete aéreo particular", "Frete aéreo Oficial", "Outros"].map((opcao) => (
    <label key={opcao} className="block">
      <input
        type="checkbox"
        checked={modalDeslocamento.aereo.includes(opcao)}
        onChange={() => toggleOption("aereo", opcao)}
        className="mr-2"
      />
      {opcao}
    </label>
  ))}

  {modalDeslocamento.aereo.includes("Frete aéreo Oficial") && (
    <div className="ml-6 mt-2">
      <label className="block text-sm font-medium">Órgão:</label>
      <input
        type="text"
        className="border px-2 py-1 w-full"
        value={orgaos.freteOficial}
        onChange={(e) => setOrgaos({ ...orgaos, freteOficial: e.target.value })}
      />
    </div>
  )}

  {modalDeslocamento.aereo.includes("Outros") && (
    <input
      type="text"
      placeholder="Descreva o modal aéreo"
      className="border px-2 py-1 w-full mt-2"
      value={outrosModais.aereo}
      onChange={(e) =>
        setOutrosModais((prev) => ({ ...prev, aereo: e.target.value }))
      }
    />
  )}
</fieldset>


        <h4 className="text-lg font-semibold mt-6 mb-2">2.2 Tempo de Deslocamento</h4>
        <Select
          value={opcoesTempoDeslocamento.find(opt => opt.value === tempoDeslocamento)}
          onChange={(selected) => setTempoDeslocamento(selected.value)}
          options={opcoesTempoDeslocamento}
          placeholder="Selecione..."
          className="mb-4"
        />
        </fieldset>
      <fieldset className="border p-4 rounded mb-6">
      <div className="mb-6">
      <h3 className="text-lg font-semibold mt-6 mb-2">3. Tipo de Atendimento</h3>
        <Select
          isMulti
          value={tipoAtendimento.map(tipo => ({ value: tipo, label: tipo.charAt(0).toUpperCase() + tipo.slice(1) }))}
          onChange={(selected) => setTipoAtendimento(selected.map(opt => opt.value))}
          options={[
            { value: "assistencia", label: "Assistência Social" },
            { value: "previdencia", label: "Previdência Social" },
            { value: "documentacao", label: "Documentação Civil" },
            { value: "saude", label: "Atenção à Saude" },
            { value: "alimentos", label: "Segurança Alimentar" },
            { value: "outros", label: "Outros Atendimentos" },

          ]}
          className="w-full"
        />
      </div>

      {tipoAtendimento.includes("assistencia") && (
        <div>
          <h4 className="text-lg font-semibold mt-6 mb-2">3.1 Assistência Social</h4>
          {[{ id: "baixa", titulo: "Baixa Complexidade", opcoes: [
            { key: "cadastro_unico", label: "Cadastro Único" },
            { key: "pbf", label: "Programa Bolsa Família (PBF)" },
            { key: "bpc", label: "Benefício de Prestação Continuada (BPC/LOAS)" },
          ]},
          { id: "media", titulo: "Média Complexidade", opcoes: [] },
          { id: "alta", titulo: "Alta Complexidade", opcoes: [
            { key: "acolhimento", label: "Unidade de Acolhimento Social" },
          ]}].map(({ id, titulo, opcoes }) => (
            <fieldset key={id} className="mb-4 border p-2 rounded">
              <label className="font-medium block mb-1">
                <input
                  type="checkbox"
                  checked={assistenciaSelecionada.includes(id)}
                  onChange={() => toggleAssistencia(id)}
                  className="mr-2"
                />
                {titulo}
              </label>

              {assistenciaSelecionada.includes(id) && opcoes.length > 0 && (
                <div className="ml-6 mt-2 border-l pl-4 space-y-1">
                  {opcoes.map(({ key, label }) => (
                    <label key={key} className="block text-sm">
                      <input
                        type="checkbox"
                        checked={assistenciaDetalhes?.[id]?.[key] || false}
                        onChange={() => toggleAssistenciaSubopcao(id, key)}
                        className="mr-2"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}

              {id === "baixa" && assistenciaDetalhes?.baixa?.bpc && (
                <div className="ml-10 mt-2 border-l pl-4 space-y-1">
                  {["meuInss", "requerimento", "consulta", "exigencia"].map((key) => (
                    <label key={key} className="block text-sm ml-4">
                      <input
                        type="checkbox"
                        checked={assistenciaDetalhes?.bpc?.[key] || false}
                        onChange={() => toggleAssistenciaSubopcao("bpc", key)}
                        className="mr-2"
                      />
                      {subopcoesPadrao.find((s) => s.key === key)?.label}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          ))}

          <div className="mb-4">
            <label className="block font-semibold">Outros:</label>
            <input
              type="text"
              className="w-full border px-2 py-1"
              value={assistenciaDetalhes.outros}
              onChange={(e) =>
                setAssistenciaDetalhes((prev) => ({ ...prev, outros: e.target.value }))
              }
            />
          </div>
        </div>
      )}
 
          {tipoAtendimento.includes("previdencia") && (
        <div>
          <h4 className="text-lg font-semibold mt-6 mb-2">3.2 Previdência Social</h4>
          {["salario_maternidade", "aposentadoria", "pensao_morte", "auxilio_incapacidade", "auxilio_reclusao"].map((id) => (
            <fieldset key={id} className="mb-4 border p-2 rounded">
              <label className="font-medium block mb-1">
                <input
                  type="checkbox"
                  checked={previdenciaSelecionada.includes(id)}
                  onChange={() => togglePrevidencia(id)}
                  className="mr-2"
                />
                {id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </label>

              {previdenciaSelecionada.includes(id) && (
                <div className="ml-6 mt-2 border-l pl-4 space-y-1">
                  {[
                    { key: "cear", label: "Preenchimento de Certidão de Exercício de Atividade Rural (CEAR)" },
                    { key: "meuInss", label: "Cadastro Meu INSS" },
                    { key: "requerimento", label: "Abertura de requerimento" },
                    { key: "consulta", label: "Consulta" },
                    { key: "exigencia", label: "Cumprimento de Exigência" }
                  ].map(({ key, label }) => (
                    <label key={key} className="block text-sm">
                      <input
                        type="checkbox"
                        checked={previdenciaDetalhes?.[id]?.[key] || false}
                        onChange={() => toggleSubopcao(id, key)}
                        className="mr-2"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          ))}
                  </div>
      )}

       {tipoAtendimento.includes("documentacao") && (
        <div>
          <h4 className="text-lg font-semibold mt-6 mb-2">3.3 Documentação Civil</h4>
          {["nascido_vivo", "registro_nascimento", "registro_obito", "cpf", "cin", "titulo_eleitor", "reservista"].map((id) => (
            <fieldset key={id} className="mb-4 border p-2 rounded">
              <label className="font-medium block mb-1">
                <input
                  type="checkbox"
                  checked={documentacaoSelecionada.includes(id)}
                  onChange={() => toggleDocumentacao(id)}
                  className="mr-2"
                />
                {({
                  nascido_vivo: "Declaração de Nascido Vivo",
                  registro_nascimento: "Registro Civil Nascimento",
                  registro_obito: "Registro Civil de Óbito",
                  cpf: "Cadastro de Pessoa Física (CPF)",
                  cin: "Carteira de Identidade Nacional (CIN)",
                  titulo_eleitor: "Título de Eleitor",
                  reservista: "Certificado de Reservista ou Dispensa de Incorporação (CDI)"
                })[id]}
              </label>

              {documentacaoSelecionada.includes(id) && (
                <div className="ml-6 mt-2 border-l pl-4 space-y-1">
                    {[
                      "Primeira Via",
                      "Segunda Via",
                      ...(["registro_nascimento", "registro_obito"].includes(id) ? ["Registro Tardio"] : []),
                      "Retificação",
                      "Boletim de Ocorrência para Perda ou Roubo de Documentos"
                    ].map((sub, idx) => (
                      <label key={idx} className="block text-sm">
                        <input
                            type="checkbox"
                            checked={documentacaoDetalhes?.[id]?.[sub] || false}
                            onChange={() => toggleSubopcaoDocumentacao(id, sub)}
                            className="mr-2"
                          />
                        {sub}
                      </label>
                  ))}
                </div>
              )}
            </fieldset>
          ))}

          <div className="mb-4">
            <label className="block font-semibold">Outros:</label>
            <input
              type="text"
              className="w-full border px-2 py-1"
              value={documentacaoDetalhes.outros || ""}
              onChange={(e) =>
                setDocumentacaoDetalhes((prev) => ({ ...prev, outros: e.target.value }))
              }
            />
          </div>
        </div>
          )}
      {tipoAtendimento.includes("saude") && (
            <div>
              <h4 className="text-lg font-semibold mt-6 mb-2">3.4 Atenção à Saúde</h4>
              {["ubs", "hospital", "dsei_y", "caps"].map((id) => (
                <label key={id} className="block text-sm mb-1">
                  <input
                    type="checkbox"
                    checked={saudeSelecionada.includes(id)}
                    onChange={() => toggleSaude(id)}
                    className="mr-2"
                  />
                  {({
                    ubs: "Unidade Básica de Saúde (UBS)",
                    hospital: "Hospital",
                    dsei_y: "Distrito Sanitário Especial Indígena Yanomami (DSEI-Y)",
                    caps: "Centro de Atenção Psicossocial (CAPS)"
                  })[id]}
                </label>
              ))}

              <div className="mt-2 mb-4">
                <label className="block font-semibold">Outros:</label>
                <input
                  type="text"
                  className="w-full border px-2 py-1"
                  value={saudeDetalhes.outros || ""}
                  onChange={(e) =>
                    setSaudeDetalhes((prev) => ({ ...prev, outros: e.target.value }))
                  }
                />
              </div>
            </div>
          )}
       {tipoAtendimento.includes("alimentos") && (
        <div>
          <h4 className="text-lg font-semibold mt-6 mb-2">3.5 Segurança Alimentar</h4>
          {["cesta", "refeicao", "restaurante", "encaminhamento"].map((id) => (
            <label key={id} className="block text-sm mb-1">
              <input
                type="checkbox"
                checked={segAlimentarSelecionada.includes(id)}
                onChange={() => toggleSegAlimentar(id)}
                className="mr-2"
              />
              {{
                cesta: "Entrega de cesta alimentar",
                refeicao: "Entrega de refeição pronta",
                restaurante: "Restaurante Comunitário",
                encaminhamento: "Encaminhamento para Rede Socioassistencial",
              }[id]}
            </label>
          ))}

          {segAlimentarSelecionada.includes("cesta") && (
            <div className="ml-6 my-2">
              <label className="text-sm block">Quantidade de cestas:</label>
              <input
                type="number"
                value={segAlimentarDetalhes.cesta || 0}
                onChange={(e) => setSegAlimentarDetalhes((prev) => ({ ...prev, cesta: parseInt(e.target.value) }))}
                className="w-full border px-2 py-1"
              />
            </div>
          )}

          {segAlimentarSelecionada.includes("refeicao") && (
            <div className="ml-6 my-2">
              <label className="text-sm block">Quantidade de refeições:</label>
              <input
                type="number"
                value={segAlimentarDetalhes.refeicao || 0}
                onChange={(e) => setSegAlimentarDetalhes((prev) => ({ ...prev, refeicao: parseInt(e.target.value) }))}
                className="w-full border px-2 py-1"
              />
            </div>
          )}

          <div className="mt-2 mb-4">
            <label className="block font-semibold">Outros:</label>
            <input
              type="text"
              className="w-full border px-2 py-1"
              value={segAlimentarDetalhes.outros || ""}
              onChange={(e) =>
                setSegAlimentarDetalhes((prev) => ({ ...prev, outros: e.target.value }))
              }
            />
          </div>
        </div>
      )}
     {tipoAtendimento.includes("outros") && (
        <div>
          <h4 className="text-lg font-semibold mt-6 mb-2">3.6 Outros Atendimentos</h4>

          <fieldset className="mb-4 border p-2 rounded">
            <label className="block font-medium mb-1">
              <input type="checkbox" checked={outrosDetalhes.insumos} onChange={() => toggleOutros("insumos")} className="mr-2" />
              Entrega de insumos
            </label>

            {outrosDetalhes.insumos && (
              <div className="ml-6">
                <label className="block">
                  <input type="checkbox" checked={outrosDetalhes.rede_dormir} onChange={() => toggleOutros("rede_dormir")} className="mr-2" />
                  Rede de Dormir
                </label>
                {outrosDetalhes.rede_dormir && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium">Quantidade:</label>
                    <input type="number" className="border px-2 py-1 w-full" value={outrosDetalhes.rede_dormir_qtd || 0} onChange={(e) => setOutrosDetalhes((prev) => ({ ...prev, rede_dormir_qtd: parseInt(e.target.value) }))} />
                  </div>
                )}

                <label className="block mt-2">
                  <input type="checkbox" checked={outrosDetalhes.outros} onChange={() => toggleOutros("outros")} className="mr-2" />
                  Outros
                </label>
                {outrosDetalhes.outros && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium">Descrição:</label>
                    <input type="text" className="border px-2 py-1 w-full" value={outrosDetalhes.outros_desc} onChange={(e) => setOutrosDetalhes((prev) => ({ ...prev, outros_desc: e.target.value }))} />
                    <label className="block text-sm font-medium mt-2">Quantidade:</label>
                    <input type="number" className="border px-2 py-1 w-full" value={outrosDetalhes.outros_qtd || 0} onChange={(e) => setOutrosDetalhes((prev) => ({ ...prev, outros_qtd: parseInt(e.target.value) }))} />
                  </div>
                )}
              </div>
            )}
          </fieldset>

          <fieldset className="mb-4 border p-2 rounded">
            <label className="block font-medium mb-1">
              <input type="checkbox" checked={outrosDetalhes.acompanhamento} onChange={() => toggleOutros("acompanhamento")} className="mr-2" />
              Acompanhamento
            </label>
            {outrosDetalhes.acompanhamento && (
              <div className="ml-6">
                <label className="block"><input type="checkbox" checked={outrosDetalhes.banco} onChange={() => toggleOutros("banco")} className="mr-2" /> Instituição bancária</label>
                <label className="block"><input type="checkbox" checked={outrosDetalhes.comercio} onChange={() => toggleOutros("comercio")} className="mr-2" /> Estabelecimento comercial</label>
                <label className="block"><input type="checkbox" checked={outrosDetalhes.delegacia} onChange={() => toggleOutros("delegacia")} className="mr-2" /> Delegacia</label>
              </div>
            )}
          </fieldset>
            <fieldset className="mb-4 border p-1 rounded">
              <label className="font-medium block mb-1">
                <input
                  type="checkbox"
                  checked={outrosDetalhes.artesanato}
                  onChange={() => toggleOutros("artesanato")}
                  className="mr-2"
                />
                Apoio na venda de artesanatos e outros produtos
              </label>
            </fieldset>

          <fieldset className="mt-4 border p-2 rounded">
            <label className="block font-medium mb-1">
              <input type="checkbox" checked={outrosDetalhes.apoio_logistico} onChange={() => toggleOutros("apoio_logistico")} className="mr-2" />
              Apoio logístico de retorno
            </label>
            {outrosDetalhes.apoio_logistico && (
              <div className="ml-6">
                <label className="block">
                  <input type="checkbox" checked={outrosDetalhes.combustivel} onChange={() => toggleOutros("combustivel")} className="mr-2" />
                  Fornecimento de combustível
                </label>
                {outrosDetalhes.combustivel && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium">Quantidade de litros:</label>
                    <input type="number" className="border px-2 py-1 w-full" value={outrosDetalhes.combustivel_qtd || 0} onChange={(e) => setOutrosDetalhes((prev) => ({ ...prev, combustivel_qtd: parseInt(e.target.value) }))} />
                  </div>
                )}
                <label className="block"><input type="checkbox" checked={outrosDetalhes.deslocamento_aereo} onChange={() => toggleOutros("deslocamento_aereo")} className="mr-2" /> Deslocamento aéreo</label>
                <label className="block"><input type="checkbox" checked={outrosDetalhes.deslocamento_terrestre} onChange={() => toggleOutros("deslocamento_terrestre")} className="mr-2" /> Deslocamento terrestre</label>
                <label className="block"><input type="checkbox" checked={outrosDetalhes.deslocamento_fluvial} onChange={() => toggleOutros("deslocamento_fluvial")} className="mr-2" /> Deslocamento fluvial</label>
              </div>
            )}
          </fieldset>
        </div>
      )}
        </fieldset>
      <fieldset className="border rounded p-4 mb-6">
       <h3 className="text-lg font-semibold mt-6 mb-2">4. Observações</h3>
      <textarea
        className="w-full border px-3 py-2"
        rows="4"
        placeholder="Escreva aqui observações adicionais..."
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
      ></textarea>
              </fieldset>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`mt-6 px-4 py-2 rounded text-white transition-all duration-200 ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed pointer-events-none"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isSubmitting ? "Enviando..." : "Enviar Formulário"}
      </button>

      
    </div>
  );
}