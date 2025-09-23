// src/components/FormFerramentas.jsx
import { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  Typography,
  Box,
  Button,
  MenuItem,
  Checkbox,
  IconButton,
  Divider,
  FormControlLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

/**
 * Formulário de Entrega de Ferramentas
 * - Módulo 1: Cabeçalho + Modal de Entrega (aéreo, terrestre, fluvial, local)
 * - Módulo 4.1: Kits de Pesca (Anzol, Linha, Chumbada, Cadeirão)
 *   Cada item usa linhas dinâmicas: [Select de tamanho] + [Quantidade] + (+) adicionar outra linha.
 */
export default function FormularioFerramentas() {
  // ================== ESTADOS (Módulo 1) ==================
  const [servidor, setServidor] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [dataAtendimento, setDataAtendimento] = useState("");
  const [coordenadas, setCoordenadas] = useState({ latitude: null, longitude: null });
  const [municipio, setMunicipio] = useState("");
  const [modalEntrega, setModalEntrega] = useState("");
  const [erros, setErros] = useState([]);

  const opcoesModalEntrega = [
    { value: "aereo", label: "Aéreo" },
    { value: "terrestre", label: "Terrestre" },
    { value: "fluvial", label: "Fluvial" },
    { value: "local", label: "Local" },
  ];    
const [observacao, setObservacao] = useState("");

  // ================== EFEITOS (Módulo 1) ==================
  useEffect(() => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
      if (usuario && usuario.nome_completo) setServidor(usuario.nome_completo);
    } catch {}

    const agora = new Date();
    const offset = agora.getTimezoneOffset();
    const localISO = new Date(agora.getTime() - offset * 60000).toISOString().slice(0, 16);
    setDataHora(localISO);
    setDataAtendimento(localISO.slice(0, 10));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lon = Number(position.coords.longitude.toFixed(5));
        setCoordenadas({ latitude: lat, longitude: lon });

        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const data = await resp.json();
          const m = data?.address?.city || data?.address?.town || data?.address?.village || "";
          setMunicipio(m);
        } catch (err) {
          console.error("Erro ao buscar município:", err);
        }
      });
    }
  }, []);

  // ================== AÇÕES (Módulo 1) ==================
  const handleClearHeader = () => {
    setModalEntrega("");
    const agora = new Date();
    const offset = agora.getTimezoneOffset();
    const localISO = new Date(agora.getTime() - offset * 60000).toISOString().slice(0, 16);
    setDataHora(localISO);
    setDataAtendimento(localISO.slice(0, 10));
    setErros([]);
  };

  const validarHeader = () => {
    const e = [];
    if (!modalEntrega) e.push("Selecione o Modal de Entrega.");
    setErros(e);
    return e.length === 0;
  };

    const handleContinuar = () => {
    const okPesca = validarPesca ? validarPesca() : true;
    const okCasaFarinha = validarCasaFarinha ? validarCasaFarinha() : true;
    const okFerramentas = validarFerramentas ? validarFerramentas() : true;

    if (okPesca && okCasaFarinha && okFerramentas) {
        alert("Todos os blocos validados com sucesso!");
        // aqui você pode seguir para salvar ou avançar no fluxo
    }
    };

  // ================== OPÇÕES DOS TAMANHOS (Módulo 4.1) ==================
  const ANZOL_OPTIONS = Array.from({ length: 13 }, (_, i) => `${i + 1}/0`); // 1/0..13/0
  const LINHA_OPTIONS = [0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0, 1.2].map(
    (n) => `${n.toLocaleString("pt-BR", { minimumFractionDigits: n % 1 ? 2 : 1 })}mm`
  );
  const CHUMBADA_OPTIONS = ["00", ...Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))];
  const CADEIRAO_OPTIONS = ["12L", "14L", "16L", "21L", "25L"];

  // Cada grupo agora é uma lista de linhas: [{ id, size, qty }]
  const [anzolLinhas, setAnzolLinhas] = useState([{ id: rid(), size: "", qty: "" }]);
  const [linhaLinhas, setLinhaLinhas] = useState([{ id: rid(), size: "", qty: "" }]);
  const [chumbadaLinhas, setChumbadaLinhas] = useState([{ id: rid(), size: "", qty: "" }]);
  const [cadeiraoLinhas, setCadeiraoLinhas] = useState([{ id: rid(), size: "", qty: "" }]);

  function rid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  const addRow = (rows, setRows) => setRows([...rows, { id: rid(), size: "", qty: "" }]);
  const removeRow = (rows, setRows, id) => setRows(rows.filter((r) => r.id !== id));
  const updateRow = (rows, setRows, id, patch) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const clearPesca = () => {
    setAnzolLinhas([{ id: rid(), size: "", qty: "" }]);
    setLinhaLinhas([{ id: rid(), size: "", qty: "" }]);
    setChumbadaLinhas([{ id: rid(), size: "", qty: "" }]);
    setCadeiraoLinhas([{ id: rid(), size: "", qty: "" }]);
  };

  const validarPesca = () => {
    const e = [];
    const grupos = [
      { nome: "Anzol", rows: anzolLinhas },
      { nome: "Linha", rows: linhaLinhas },
      { nome: "Chumbada", rows: chumbadaLinhas },
      { nome: "Cadeirão", rows: cadeiraoLinhas },
    ];

    // Pelo menos um tamanho válido em todo o kit
    const algumValido = grupos.some((g) =>
      g.rows.some((r) => r.size && String(r.size).trim() && Number(r.qty) > 0)
    );
    if (!algumValido) e.push("Informe ao menos um tamanho e quantidade em algum item do Kit de Pesca.");

    // Validação linha a linha
    grupos.forEach(({ nome, rows }) => {
      rows.forEach((r, idx) => {
        const pos = `(${nome} #${idx + 1})`;
        const temQualquer = r.size || r.qty;
        if (temQualquer) {
          if (!r.size || !String(r.size).trim()) e.push(`${pos}: selecione o tamanho.`);
          if (!(Number(r.qty) > 0)) e.push(`${pos}: informe uma quantidade válida (> 0).`);
        }
      });
    });

    setErros(e);
    return e.length === 0;
  };
  // ================== ESTADOS E HELPERS (Módulo 4.2) ==================
    const [casaFarinha, setCasaFarinha] = useState({
    motor:  { checked: false, qty: 0 },
    tacho:  { checked: false, qty: 0 },
    catitu: { checked: false, qty: 0 },
    });

    const toggleCasaFarinha = (key) => {
    setCasaFarinha((prev) => {
        const atual = prev[key] || { checked: false, qty: 0 };
        const checked = !atual.checked;
        return { ...prev, [key]: { checked, qty: checked ? (atual.qty || 0) : 0 } };
    });
    };

    const setCasaFarinhaQty = (key, value) => {
    const v = Math.max(0, parseInt(value, 10) || 0);
    setCasaFarinha((prev) => ({ ...prev, [key]: { ...prev[key], qty: v } }));
    };

    const clearCasaFarinha = () => {
    setCasaFarinha({
        motor:  { checked: false, qty: 0 },
        tacho:  { checked: false, qty: 0 },
        catitu: { checked: false, qty: 0 },
    });
    };

    // opcional
    const validarCasaFarinha = () => {
    const ok = Object.values(casaFarinha).some((i) => i.checked && i.qty > 0);
    setErros((prev) => {
        const filtrados = prev.filter((m) => !m.includes("Casa de Farinha"));
        return ok ? filtrados : [...filtrados, "4.2 Casa de Farinha: informe ao menos um item com quantidade (> 0)."];
    });
    return ok;
    };


  // ================== ESTADOS E HELPERS (Módulo 4.3) ==================
const [ferramentas, setFerramentas] = useState({
  enxada:    { checked: false, qty: 0 },
  foice:     { checked: false, qty: 0 },
  machado:   { checked: false, qty: 0 },
  cavadeira: { checked: false, qty: 0 },
  lima:      { checked: false, qty: 0 },
  facao:     { checked: false, qty: 0 },
});

const toggleFerramenta = (key) => {
  setFerramentas((prev) => {
    const atual = prev[key] || { checked: false, qty: 0 };
    const checked = !atual.checked;
    return {
      ...prev,
      [key]: { checked, qty: checked ? (atual.qty || 0) : 0 }, // desmarca -> zera qty
    };
  });
};

const setFerramentaQty = (key, value) => {
  const v = Math.max(0, parseInt(value, 10) || 0);
  setFerramentas((prev) => ({ ...prev, [key]: { ...prev[key], qty: v } }));
};

const clearFerramentas = () => {
  setFerramentas({
    enxada:    { checked: false, qty: 0 },
    foice:     { checked: false, qty: 0 },
    machado:   { checked: false, qty: 0 },
    cavadeira: { checked: false, qty: 0 },
    lima:      { checked: false, qty: 0 },
    facao:     { checked: false, qty: 0 },
  });
};

// opcional: validação (pede ao menos uma ferramenta marcada com quantidade > 0)
const validarFerramentas = () => {
  const algumValido = Object.values(ferramentas).some((f) => f.checked && f.qty > 0);
  setErros((prev) => {
    // remove mensagens antigas deste bloco
    const filtrados = prev.filter((m) => !m.includes("ferramenta"));
    return algumValido
      ? filtrados
      : [...filtrados, "Informe ao menos uma ferramenta com quantidade (> 0)."];
  });
  return algumValido;
};

 const FerramentaRow = ({ id, label, ferramentas, toggleFerramenta, setFerramentaQty }) => (
  <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
  <FormControlLabel
    control={
      <Checkbox
        checked={ferramentas[id]?.checked}
        onChange={() => toggleFerramenta(id)}
        size="small"
        sx={{ color: "#2E7D32", "&.Mui-checked": { color: "#2E7D32" } }}
      />
    }
    label={<Typography sx={{ fontSize: ".90rem" }}>{label}</Typography>}
  />

  {ferramentas[id]?.checked && (
    <Box sx={{ display: "flex", flexDirection: "column", ml: 2, mt: 0}}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
        Quantidade
      </Typography>
      <TextField
        type="number"
        size="small"
        value={ferramentas[id]?.qty ?? 0}
        onChange={(e) => setFerramentaQty(id, e.target.value)}
        inputProps={{ min: 0 }}
        sx={{ width: 200, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: ".85rem" } }}
      />
    </Box>
  )}
</Box>

);

// ================== ESTADOS E HELPERS (Módulo 4.4) ==================
// 4.4.2/4.4.3 Sabonete/Sabão
const [higiene, setHigiene] = useState({
  sabonete: { checked: false, qty: 0 },
  sabao:    { checked: false, qty: 0 },
});
const toggleHigiene = (key) =>
  setHigiene((prev) => ({ ...prev, [key]: { checked: !prev[key].checked, qty: !prev[key].checked ? (prev[key].qty || 0) : 0 } }));
const setHigieneQty = (key, value) =>
  setHigiene((prev) => ({ ...prev, [key]: { ...prev[key], qty: Math.max(0, parseInt(value, 10) || 0) } }));

// 4.4.4 Miçangas (linhas dinâmicas tamanho + quantidade)
const [micangasChecked, setMicangasChecked] = useState(false);
const [micangasRows, setMicangasRows] = useState([{ id: rid(), size: "", qty: "" }]);
const addMicRow = () => setMicangasRows((r) => [...r, { id: rid(), size: "", qty: "" }]);
const removeMicRow = (id) => setMicangasRows((r) => r.filter((x) => x.id !== id));
const updateMicRow = (id, patch) =>
  setMicangasRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

// 4.4.5 Outros (descrição + quantidade)
const [outros, setOutros] = useState({ checked: false, descricao: "", qty: 0 });
const toggleOutros = () =>
  setOutros((prev) => ({ ...prev, checked: !prev.checked, descricao: !prev.checked ? prev.descricao : "", qty: !prev.checked ? prev.qty : 0 }));

// 4.6 Anexos (JPG/PNG/PDF)
const [anexos, setAnexos] = useState([]); // File[]
const handleAddFiles = (e) => {
  const files = Array.from(e.target.files || []);
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  const valid = files.filter((f) => allowed.includes(f.type));
  setAnexos((prev) => [...prev, ...valid]);
  e.target.value = null;
};
const removeAnexo = (idx) =>
  setAnexos((prev) => prev.filter((_, i) => i !== idx));

// 4.4.1 Saco de Ráfia: toggle geral + tamanhos (aparecem só quando marcado)
const RAFIA_SIZES = [
  "45cm x 70cm - 30Kg",
  "50cm x 75cm - 30Kg",
  "55cm x 85cm - 50Kg",
  "60cm x 90cm - 60Kg",
];

const [rafiaChecked, setRafiaChecked] = useState(false);
const [rafia, setRafia] = useState({}); // ex.: { "45cm x 70cm - 30Kg": 2 }

const toggleRafiaChecked = () => {
  setRafiaChecked((prev) => {
    const next = !prev;
    if (!next) setRafia({}); // desmarcou -> limpa tamanhos/quantidades
    return next;
  });
};

const toggleRafia = (size) => {
  setRafia((prev) => {
    const next = { ...prev };
    if (Object.prototype.hasOwnProperty.call(next, size)) delete next[size];
    else next[size] = 0;
    return next;
  });
};

const setRafiaQty = (size, value) =>
  setRafia((prev) => ({ ...prev, [size]: Math.max(0, parseInt(value, 10) || 0) }));


  // ================== SUBCOMPONENTE: Linhas dinâmicas ==================
const ItemRows = ({
  title,
  hint,
  options,
  rows,
  setRows,
  placeholderSize = "Selecione o tamanho",
  addButtonSx, // <- agora aceita estilos do botão
}) => (
  <Box sx={{ border: "1px solid #E0E0E0", borderRadius: 2, p: 2, mb: 2 }}>
    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
      {title}
    </Typography>

    {hint && (
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {hint}
      </Typography>
    )}

    {rows.map((row) => (
      <Grid container spacing={1} alignItems="center" key={row.id} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={5}>
          <TextField
            select
            fullWidth
            size="small"
            value={row.size}
            onChange={(e) => updateRow(rows, setRows, row.id, { size: e.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: ".9rem" } }}
          >
            <MenuItem value="">
              <span style={{ fontSize: ".85rem", color: "#B8B8B8" }}>{placeholderSize}</span>
            </MenuItem>
            {options.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={8} sm={4} md={3}>
          <TextField
            type="number"
            size="small"
            placeholder="Quantidade"
            value={row.qty}
            onChange={(e) => updateRow(rows, setRows, row.id, { qty: e.target.value })}
            inputProps={{ min: 0 }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: ".9rem" } }}
            fullWidth
          />
        </Grid>

        <Grid item xs={4} sm={2} md={2}>
          <IconButton
            aria-label="remover"
            color="error"
            onClick={() => removeRow(rows, setRows, row.id)}
            disabled={rows.length === 1}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Grid>
      </Grid>
    ))}

    {/* Botão Adicionar - fundo branco, borda/ícone/texto VERDE */}
    <Button
      size="small"
      variant="outlined"
      color="inherit"                    // <- impede azul padrão
      startIcon={<AddIcon />}
      onClick={() => addRow(rows, setRows)}
      sx={{
        textTransform: "none",
        borderRadius: 2,
        mt: 1,
        borderColor: "#2E7D32",
        color: "#2E7D32",
        "& .MuiSvgIcon-root": { color: "#2E7D32" },
        "&:hover": {
          borderColor: "#1B5E20",
          color: "#1B5E20",
          backgroundColor: "#E8F5E9",
          "& .MuiSvgIcon-root": { color: "#1B5E20" },
        },
        ...(addButtonSx || {}),          // <- permite sobrescrever se quiser
      }}
    >
      Adicionar
    </Button>
  </Box>
);

  // ================== UI ==================
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Formulário de Entrega de Ferramentas</h2>

      {erros.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <ul className="list-disc pl-5">
            {erros.map((erro, i) => (
              <li key={i}>{erro}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ================== BLOCO: Dados do Atendimento (Módulo 1) ================== */}
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
            <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
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
                "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.85rem" },
                "& input": { padding: "8px 10px" },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
              Horário e Data (automático)
            </Typography>
            <TextField
              value={dataHora}
              fullWidth
              size="small"
              disabled
              InputProps={{ readOnly: true }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.85rem" },
                "& input": { padding: "8px 10px" },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
              Coordenadas
            </Typography>
            <TextField
              value={`Lat: ${coordenadas.latitude ?? "—"}, Lon: ${coordenadas.longitude ?? "—"}`}
              fullWidth
              size="small"
              disabled
              InputProps={{ readOnly: true }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.85rem" },
                "& input": { padding: "8px 10px" },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
              Município
            </Typography>
            <TextField
              value={municipio}
              fullWidth
              size="small"
              disabled
              InputProps={{ readOnly: true }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.85rem" },
                "& input": { padding: "8px 10px" },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mb: 0.5 }}>
              Data do Atendimento (preenchível)
            </Typography>
            <TextField
              type="date"
              value={dataAtendimento}
              onChange={(e) => setDataAtendimento(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.85rem" },
                "& input": { padding: "8px 10px" },
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ================== BLOCO: Modal de Entrega (Módulo 1) ================== */}
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
          sx={{ fontSize: "1.0rem", display: "flex", alignItems: "center", gap: 1 }}
        >
          🚚 Modal de Entrega
        </Typography>

        <TextField
          select
          fullWidth
          size="small"
          value={modalEntrega}
          onChange={(e) => setModalEntrega(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.85rem" },
          }}
        >
          <MenuItem value="">
            <span style={{ fontSize: "0.85rem", color: "#B8B8B8" }}>Selecione o modal</span>
          </MenuItem>
          {opcoesModalEntrega.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
{/* ================== BLOCO: 4.1 Kits de Pesca ================== */}
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
    🎣 4.1 Kits de Pesca
  </Typography>

  <ItemRows
    title="4.1.1 Anzol"
    hint={
      <>
        Escolha o tamanho (1/0 a 13/0) e informe a quantidade.
        <br />
        Use (+) para adicionar outro tamanho.
      </>
    }
    options={ANZOL_OPTIONS}
    rows={anzolLinhas}
    setRows={setAnzolLinhas}
    placeholderSize="Tamanho do anzol"
    addButtonSx={{
      borderColor: "#2E7D32",
      color: "#2E7D32",
      "& .MuiSvgIcon-root": { color: "#2E7D32" },
      "&:hover": {
        borderColor: "#1B5E20",
        color: "#1B5E20",
        backgroundColor: "#E8F5E9",
      },
    }}
  />

  <Divider sx={{ my: 2 }} />

  <ItemRows
    title="4.1.2 Linha"
    hint={
      <>
        Escolha o tamanho (0,25mm a 1,20mm) e informe a quantidade.
        <br />
        Use (+) para adicionar outro tamanho.
      </>
    }
    options={LINHA_OPTIONS}
    rows={linhaLinhas}
    setRows={setLinhaLinhas}
    placeholderSize="Espessura da linha"
    addButtonSx={{
      borderColor: "#2E7D32",
      color: "#2E7D32",
      "& .MuiSvgIcon-root": { color: "#2E7D32" },
      "&:hover": {
        borderColor: "#1B5E20",
        color: "#1B5E20",
        backgroundColor: "#E8F5E9",
      },
    }}
  />

  <Divider sx={{ my: 2 }} />

  <ItemRows
    title="4.1.3 Chumbada"
    hint={
      <>
        Escolha o tamanho (00 a 12) e informe a quantidade.
        <br />
        Use (+) para adicionar outro tamanho.
      </>
    }
    options={CHUMBADA_OPTIONS}
    rows={chumbadaLinhas}
    setRows={setChumbadaLinhas}
    placeholderSize="Tamanho da chumbada"
    addButtonSx={{
      borderColor: "#2E7D32",
      color: "#2E7D32",
      "& .MuiSvgIcon-root": { color: "#2E7D32" },
      "&:hover": {
        borderColor: "#1B5E20",
        color: "#1B5E20",
        backgroundColor: "#E8F5E9",
      },
    }}
  />

  <Divider sx={{ my: 2 }} />

  <ItemRows
    title="4.1.4 Cadeirão"
    hint={
      <>
        Escolha o tamanho (12L, 14L, 16L, 21L, 25L) e informe a quantidade.
        <br />
        Use (+) para adicionar outro tamanho.
      </>
    }
    options={CADEIRAO_OPTIONS}
    rows={cadeiraoLinhas}
    setRows={setCadeiraoLinhas}
    placeholderSize="Capacidade do cadeirão"
    addButtonSx={{
      borderColor: "#2E7D32",
      color: "#2E7D32",
      "& .MuiSvgIcon-root": { color: "#2E7D32" },
      "&:hover": {
        borderColor: "#1B5E20",
        color: "#1B5E20",
        backgroundColor: "#E8F5E9",
      },
    }}
  />
</Box>


     
    {/* ================== BLOCO: 4.2 Kit Casa de Farinha ================== */}
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
        sx={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: 1}}
    >
        🏠 4.2 Kit Casa de Farinha
    </Typography>

    <FerramentaRow
        id="motor"
        label="Motor"
        ferramentas={casaFarinha}
        toggleFerramenta={toggleCasaFarinha}
        setFerramentaQty={setCasaFarinhaQty}
    />

    <FerramentaRow
        id="tacho"
        label="Tacho"
        ferramentas={casaFarinha}
        toggleFerramenta={toggleCasaFarinha}
        setFerramentaQty={setCasaFarinhaQty}
    />

    <FerramentaRow
        id="catitu"
        label="Catitu"
        ferramentas={casaFarinha}
        toggleFerramenta={toggleCasaFarinha}
        setFerramentaQty={setCasaFarinhaQty}
    />
    </Box>

    {/* ================== BLOCO: 4.3 Kit de Ferramentas ================== */}
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
        🧰 4.3 Kit de Ferramentas
    </Typography>

    <FerramentaRow id="enxada"    label="Enxada"    ferramentas={ferramentas} toggleFerramenta={toggleFerramenta} setFerramentaQty={setFerramentaQty} />
    <FerramentaRow id="foice"     label="Foice"     ferramentas={ferramentas} toggleFerramenta={toggleFerramenta} setFerramentaQty={setFerramentaQty} />
    <FerramentaRow id="machado"   label="Machado"   ferramentas={ferramentas} toggleFerramenta={toggleFerramenta} setFerramentaQty={setFerramentaQty} />
    <FerramentaRow id="cavadeira" label="Cavadeira" ferramentas={ferramentas} toggleFerramenta={toggleFerramenta} setFerramentaQty={setFerramentaQty} />
    <FerramentaRow id="lima"      label="Lima"      ferramentas={ferramentas} toggleFerramenta={toggleFerramenta} setFerramentaQty={setFerramentaQty} />
    <FerramentaRow id="facao"     label="Facão"     ferramentas={ferramentas} toggleFerramenta={toggleFerramenta} setFerramentaQty={setFerramentaQty} />
    </Box>

    {/* ================== BLOCO: 4.5 Outros Materiais ================== */}
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
        📦 4.4 Outros Materiais
    </Typography>

    {/* 4.4.1 Saco de Ráfia — mesmo estilo dos demais itens */}
    <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
    <FormControlLabel
        control={
        <Checkbox
            checked={rafiaChecked}
            onChange={toggleRafiaChecked}
            size="small"
            sx={{ color: "#2E7D32", "&.Mui-checked": { color: "#2E7D32" } }}
        />
        }
        label={<Typography sx={{ fontSize: ".90rem" }}>Saco de Ráfia</Typography>}
    />

    {rafiaChecked && (
        <Box sx={{ ml: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Selecione os tamanhos e informe a quantidade (cada tamanho tem seu campo).
        </Typography>

        {RAFIA_SIZES.map((size) => {
            const marcado = Object.prototype.hasOwnProperty.call(rafia, size);
            return (
            <Box key={size} sx={{ display: "flex", flexDirection: "column", mb: 1.5 }}>
                <FormControlLabel
                control={
                    <Checkbox
                    checked={marcado}
                    onChange={() => toggleRafia(size)}
                    size="small"
                    sx={{ color: "#2E7D32", "&.Mui-checked": { color: "#2E7D32" } }}
                    />
                }
                label={<Typography sx={{ fontSize: ".90rem" }}>{size}</Typography>}
                />

                {marcado && (
                <Box sx={{ display: "flex", flexDirection: "column", ml: 2, mt: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                    Quantidade
                    </Typography>
                    <TextField
                    type="number"
                    size="small"
                    value={rafia[size] ?? 0}
                    onChange={(e) => setRafiaQty(size, e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={{
                        width: 200,
                        "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: ".85rem" },
                    }}
                    />
                </Box>
                )}
            </Box>
            );
        })}
        </Box>
    )}
    </Box>



    <Divider sx={{ my: 2 }} />

    {/* 4.4.2 Sabonete */}
    <FerramentaRow
        id="sabonete"
        label="Sabonete"
        ferramentas={higiene}
        toggleFerramenta={toggleHigiene}
        setFerramentaQty={setHigieneQty}
    />

    {/* 4.4.3 Sabão */}
    <FerramentaRow
        id="sabao"
        label="Sabão"
        ferramentas={higiene}
        toggleFerramenta={toggleHigiene}
        setFerramentaQty={setHigieneQty}
    />

    <Divider sx={{ my: 2 }} />

    {/* 4.4.4 Miçangas */}
    <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
        <FormControlLabel
        control={
            <Checkbox
            checked={micangasChecked}
            onChange={() => setMicangasChecked((v) => !v)}
            size="small"
            sx={{ color: "#2E7D32", "&.Mui-checked": { color: "#2E7D32" } }}
            />
        }
        label={<Typography sx={{ fontSize: ".90rem" }}>Miçangas</Typography>}
        />
        {micangasChecked && (
        <Box sx={{ ml: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Informe o tamanho e a quantidade. Use (+) para adicionar outro tamanho.
            </Typography>

            {micangasRows.map((row) => (
            <Grid container spacing={1} alignItems="center" key={row.id} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={6} md={5}>
                <TextField
                    size="small"
                    placeholder="Tamanho (ex.: 4mm, 6mm...)"
                    value={row.size}
                    onChange={(e) => updateMicRow(row.id, { size: e.target.value })}
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: ".9rem" } }}
                />
                </Grid>
                <Grid item xs={8} sm={4} md={3}>
                <TextField
                    type="number"
                    size="small"
                    placeholder="Quantidade"
                    value={row.qty}
                    onChange={(e) => updateMicRow(row.id, { qty: e.target.value })}
                    inputProps={{ min: 0 }}
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: ".9rem" } }}
                />
                </Grid>
                <Grid item xs={4} sm={2} md={2}>
                <IconButton
                    aria-label="remover"
                    color="error"
                    onClick={() => removeMicRow(row.id)}
                    disabled={micangasRows.length === 1}
                >
                    <DeleteOutlineIcon />
                </IconButton>
                </Grid>
            </Grid>
            ))}

            <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<AddIcon />}
            onClick={addMicRow}
            sx={{
                textTransform: "none",
                borderRadius: 2,
                mt: 1,
                borderColor: "#2E7D32",
                color: "#2E7D32",
                "& .MuiSvgIcon-root": { color: "#2E7D32" },
                "&:hover": {
                borderColor: "#1B5E20",
                color: "#1B5E20",
                backgroundColor: "#E8F5E9",
                "& .MuiSvgIcon-root": { color: "#1B5E20" },
                },
            }}
            >
            Adicionar
            </Button>
        </Box>
        )}
    </Box>

    <Divider sx={{ my: 2 }} />

    {/* 4.5.5 Outros */}
    <Box sx={{ display: "flex", flexDirection: "column" }}>
        <FormControlLabel
        control={
            <Checkbox
            checked={outros.checked}
            onChange={toggleOutros}
            size="small"
            sx={{ color: "#2E7D32", "&.Mui-checked": { color: "#2E7D32" } }}
            />
        }
        label={<Typography sx={{ fontSize: ".90rem" }}>Outros</Typography>}
        />
        {outros.checked && (
        <Box sx={{ ml: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }} display="block">
            Descrição
            </Typography>
            <TextField
            size="small"
            placeholder="Descreva o material"
            value={outros.descricao}
            onChange={(e) => setOutros((p) => ({ ...p, descricao: e.target.value }))}
            fullWidth
            sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: ".9rem" } }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }} display="block">
            Quantidade
            </Typography>
            <TextField
            type="number"
            size="small"
            placeholder="Quantidade"
            value={outros.qty}
            onChange={(e) => setOutros((p) => ({ ...p, qty: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
            inputProps={{ min: 0 }}
            sx={{ width: 200, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: ".9rem" } }}
            />
        </Box>
        )}
    </Box>
    </Box>

    

    {/* ================== BLOCO: Observação ================== */}
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
    📝  Observações
  </Typography>

  <TextField
    multiline
    rows={4}
    placeholder="Digite observações adicionais sobre a entrega..."
    fullWidth
    value={observacao}
    onChange={(e) => setObservacao(e.target.value)}
    sx={{
      "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: ".9rem" },
    }}
  />
</Box>

{/* ================== BLOCO: 4.6 Anexo de evidência fotográfica/documental ================== */}
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
        📎Anexo (JPG, PNG, PDF)
    </Typography>

    <Button
        component="label"
        variant="outlined"
        color="inherit"
        sx={{
        textTransform: "none",
        borderRadius: 2,
        borderColor: "#2E7D32",
        color: "#2E7D32",
        "&:hover": { borderColor: "#1B5E20", color: "#1B5E20", backgroundColor: "#E8F5E9" },
        }}
    >
        Selecionar arquivos
        <input hidden multiple accept="image/jpeg,image/png,application/pdf" type="file" onChange={handleAddFiles} />
    </Button>

    {anexos.length > 0 && (
        <Box sx={{ mt: 2 }}>
        {anexos.map((f, idx) => (
            <Box
            key={`${f.name}-${idx}`}
            sx={{ display: "flex", alignItems: "center", gap: 1, border: "1px solid #EEE", borderRadius: 2, p: 1, mb: 1 }}
            >
            <Typography sx={{ fontSize: ".9rem", flex: 1 }}>
                {f.name} — {(f.size / 1024).toFixed(1)} KB
            </Typography>
            <IconButton color="error" onClick={() => removeAnexo(idx)}>
                <DeleteOutlineIcon />
            </IconButton>
            </Box>
        ))}
        </Box>
    )}
    </Box>

      {/* Ações */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} mt={4}>
        <Button
          onClick={() => {
            handleClearHeader();
            clearPesca();
            clearCasaFarinha();
          }}
          variant="outlined"
          sx={{
            px: 3,
            py: 3,
            fontWeight: 600,
            borderRadius: 2,
            textTransform: "none",
            color: "#2E7D32",
            borderColor: "#2E7D32",
            "&:hover": { backgroundColor: "#E8F5E9", borderColor: "#1B5E20", color: "#1B5E20" },
          }}
        >
          Limpar
        </Button>

        <Button
          onClick={handleContinuar}
          variant="contained"
          sx={{
            px: 3,
            py: 1,
            fontWeight: 600,
            borderRadius: 2,
            backgroundColor: "#2E7D32",
            color: "#fff",
            textTransform: "none",
            "&:hover": { backgroundColor: "#1B5E20" },
          }}
        >
          Continuar
        </Button>
      </Box>

      
    </div>
  );
}
