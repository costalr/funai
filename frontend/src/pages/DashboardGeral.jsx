import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Drawer,
  Divider,
  Button,
  TextField,
  MenuItem,
  Grid,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import { supabaseAssistencia } from "../lib/Supabase/supabaseAssistencia";

/* ============================
   ESTILOS – personalize AQUI
   ============================ */
const STYLES = {
  card: {
    backgroundColor: "#0f5132",
    color: "#FFFFFF",
    p: 4,
    borderRadius: 3,
    boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
    width: "100%",
    maxWidth: 920,
    minHeight: 180,
    position: "relative",
  },
  title: {
    fontSize: "1rem",
    fontWeight: 800,
    letterSpacing: "0.02em",
    opacity: 0.95,
    mb: 1.5,
  },
  bigNumber: {
    fontSize: "4.8rem",
    fontWeight: 900,
    lineHeight: 1.05,
    mt: 0.5,
  },
  filterButtonWrapper: { position: "absolute", top: 14, right: 14 },
  filterButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
  },
  separator: { my: 2.2, borderColor: "rgba(255,255,255,0.25)" },
  footerRow: { mt: 0.5, display: "flex", gap: 2, alignItems: "center", opacity: 0.92 },

  drawerPaper: { width: 520, p: 3.5 },
  filtersTitle: { fontSize: "1.15rem", fontWeight: 900, mb: 1 },

  filterField: {
    mb: 2,
    "& .MuiInputLabel-root": { fontSize: "1rem" },
    "& .MuiSelect-select": { minHeight: 58, fontSize: "1.02rem" },
  },
  menuPaper: {
    minWidth: 420,
    maxHeight: 420,
    "& .MuiMenuItem-root": { fontSize: "1rem", whiteSpace: "nowrap" },
  },
  drawerButtonsRow: { mt: 2, display: "flex", gap: 1, justifyContent: "flex-end" },
};

/* ===== Subpolos por Estado ===== */
const SUBPOLOS_RR = new Set(["Surucucu", "Auaris", "Boa Vista"]);
const SUBPOLOS_AM = new Set(["São Gabriel da Cachoeira", "Santa Isabel do Rio Negro", "Barcelos"]);

/* ===== Tabela/View e colunas ===== */
const TABLE = "vw_atendimentos_consolidado";
const COLS = {
  municipio: "nome_municipio",
  subpolo: "subpolo",
  servidor: "nome_servidor",
};

/* ========= helper ========= */
async function fetchDistinctWhere(columnName, whereObj) {
  let q = supabaseAssistencia.from(TABLE).select(columnName).not(columnName, "is", null);
  Object.entries(whereObj).forEach(([col, val]) => {
    if (val !== "" && val !== null && val !== undefined) q = q.eq(col, val);
  });
  const { data, error } = await q;
  if (error) {
    console.error(`Erro ao carregar '${columnName}':`, error);
    return [];
  }
  const uniq = Array.from(
    new Set(
      data
        .map((r) => r[columnName])
        .filter((v) => (typeof v === "string" ? v.trim() !== "" : v != null))
    )
  );
  return uniq.sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
}

/* ============================
   COMPONENTE
   ============================ */
export default function DashboardGeral() {
  const [total, setTotal] = useState(0);
  const [openFilters, setOpenFilters] = useState(false);

  // filtros
  const [filters, setFilters] = useState({
    estado: "", // AM | RR
    subpolo: "",
    municipio: "",
    servidor: "",
  });

  // opções dinâmicas
  const [options, setOptions] = useState({
    estados: ["AM", "RR"],
    subpolos: [],
    municipios: [],
    servidores: [],
  });

  /* ESTADO => SUBPOLOS (direto) */
  useEffect(() => {
    if (!filters.estado) {
      setOptions((o) => ({ ...o, subpolos: [], municipios: [], servidores: [] }));
      setFilters((f) => ({ ...f, subpolo: "", municipio: "", servidor: "" }));
      return;
    }
    const subpolos = filters.estado === "RR" ? [...SUBPOLOS_RR] : [...SUBPOLOS_AM];
    setOptions((o) => ({ ...o, subpolos: subpolos.sort() }));
    setFilters((f) => ({ ...f, subpolo: "", municipio: "", servidor: "" }));
  }, [filters.estado]);

  /* SUBPOLO => MUNICÍPIOS */
  useEffect(() => {
    (async () => {
      if (!filters.subpolo) {
        setOptions((o) => ({ ...o, municipios: [], servidores: [] }));
        setFilters((f) => ({ ...f, municipio: "", servidor: "" }));
        return;
      }
      const municipios = await fetchDistinctWhere(COLS.municipio, { [COLS.subpolo]: filters.subpolo });
      setOptions((o) => ({ ...o, municipios }));
      setFilters((f) => ({ ...f, municipio: "", servidor: "" }));
    })();
  }, [filters.subpolo]);

  /* MUNICÍPIO => SERVIDORES */
  useEffect(() => {
    (async () => {
      if (!filters.municipio) {
        setOptions((o) => ({ ...o, servidores: [] }));
        setFilters((f) => ({ ...f, servidor: "" }));
        return;
      }
      const servidores = await fetchDistinctWhere(COLS.servidor, {
        [COLS.subpolo]: filters.subpolo,
        [COLS.municipio]: filters.municipio,
      });
      setOptions((o) => ({ ...o, servidores }));
      setFilters((f) => ({ ...f, servidor: "" }));
    })();
  }, [filters.municipio]);

  /* CONTAGEM TOTAL */
  const fetchTotal = async () => {
    let q = supabaseAssistencia.from(TABLE).select("*", { count: "exact", head: true });

    if (filters.subpolo) q = q.eq(COLS.subpolo, filters.subpolo);
    if (filters.municipio) q = q.eq(COLS.municipio, filters.municipio);
    if (filters.servidor) q = q.eq(COLS.servidor, filters.servidor);

    // Estado escolhido sem subpolo específico → IN em subpolos do estado
    if (filters.estado && !filters.subpolo) {
      const list = filters.estado === "RR" ? [...SUBPOLOS_RR] : [...SUBPOLOS_AM];
      if (q.in) q = q.in(COLS.subpolo, list);
      else list.forEach((s, i) => (q = i ? q.or(`${COLS.subpolo}.eq.${s}`) : q.eq(COLS.subpolo, s)));
    }

    const { count, error } = await q;
    if (error) {
      console.error("Erro ao contar atendimentos:", error);
      setTotal(0);
      return;
    }
    setTotal(count || 0);
  };

  useEffect(() => {
    fetchTotal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const activeFilters = useMemo(() => {
    const arr = [];
    if (filters.estado) arr.push(`Estado: ${filters.estado}`);
    if (filters.subpolo) arr.push(`Subpolo: ${filters.subpolo}`);
    if (filters.municipio) arr.push(`Município: ${filters.municipio}`);
    if (filters.servidor) arr.push(`Servidor: ${filters.servidor}`);
    return arr;
  }, [filters]);

  const handleOpenFilters = () => setOpenFilters(true);
  const handleCloseFilters = () => setOpenFilters(false);
  const handleChange = (field) => (e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  const handleClear = () => setFilters({ estado: "", subpolo: "", municipio: "", servidor: "" });

  return (
    <Box p={3}>
      <Paper elevation={0} sx={STYLES.card}>
        <Box sx={STYLES.filterButtonWrapper}>
          <IconButton size="small" aria-label="Abrir filtros" onClick={handleOpenFilters} sx={STYLES.filterButton}>
            <FilterAltIcon />
          </IconButton>
        </Box>

        <Typography sx={STYLES.title}>TOTAL DE ATENDIMENTOS</Typography>
        <Typography sx={STYLES.bigNumber}>{total.toLocaleString("pt-BR")}</Typography>

        <Divider sx={STYLES.separator} />

        {activeFilters.length > 0 && (
          <Box sx={STYLES.footerRow}>
            <Typography variant="caption">{activeFilters.join(" · ")}</Typography>
            <IconButton size="small" aria-label="Limpar filtros" onClick={handleClear} sx={{ color: "#fff" }} title="Limpar filtros">
              <RefreshIcon fontSize="inherit" />
            </IconButton>
          </Box>
        )}
      </Paper>

      {/* PAINEL DE FILTROS */}
      <Drawer anchor="right" open={openFilters} onClose={handleCloseFilters} PaperProps={{ sx: STYLES.drawerPaper }}>
        <Typography sx={STYLES.filtersTitle}>Filtros</Typography>
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
          Selecione e clique em “Aplicar”.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {/* 1) ESTADO */}
          <Grid item xs={12}>
            <TextField
              select fullWidth label="Por Estado"
              value={filters.estado}
              onChange={handleChange("estado")}
              sx={STYLES.filterField}
              SelectProps={{ MenuProps: { PaperProps: { sx: STYLES.menuPaper } } }}
            >
              <MenuItem value="">(Todos)</MenuItem>
              {options.estados.map((uf) => (
                <MenuItem key={uf} value={uf}>{uf}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* 2) SUBPOLO – depende do Estado */}
          {filters.estado && (
            <Grid item xs={12}>
              <TextField
                select fullWidth label="Por Subpolo (Região Operacional)"
                value={filters.subpolo}
                onChange={handleChange("subpolo")}
                sx={STYLES.filterField}
                SelectProps={{ MenuProps: { PaperProps: { sx: STYLES.menuPaper } } }}
              >
                <MenuItem value="">(Todos)</MenuItem>
                {options.subpolos.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {/* 3) MUNICÍPIO – depende de Subpolo */}
          {filters.subpolo && (
            <Grid item xs={12}>
              <TextField
                select fullWidth label="Por Município"
                value={filters.municipio}
                onChange={handleChange("municipio")}
                sx={STYLES.filterField}
                SelectProps={{ MenuProps: { PaperProps: { sx: STYLES.menuPaper } } }}
              >
                <MenuItem value="">(Todos)</MenuItem>
                {options.municipios.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {/* 4) SERVIDOR – depende de Município */}
          {filters.municipio && (
            <Grid item xs={12}>
              <TextField
                select fullWidth label="Por Servidor"
                value={filters.servidor}
                onChange={handleChange("servidor")}
                sx={STYLES.filterField}
                SelectProps={{ MenuProps: { PaperProps: { sx: STYLES.menuPaper } } }}
              >
                <MenuItem value="">(Todos)</MenuItem>
                {options.servidores.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
        </Grid>

        <Box sx={STYLES.drawerButtonsRow}>
          <Button variant="text" onClick={handleClear}>Limpar</Button>
          <Button variant="contained" onClick={handleCloseFilters} disableElevation>Aplicar</Button>
        </Box>
      </Drawer>
    </Box>
  );
}
