import {
  Box,
  Typography,
  Grid,
  IconButton,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";

import CardTotalAtendimentos from "../components/cards/CardTotalAtendimentos";
import CardPessoasAssistidas from "../components/cards/CardPessoasAssistidas";
import CardMediaAtendimentoMensal from "../components/cards/CardMediaAtendimentoMensal";
import CardUltimosAtendimentos from "../components/cards/CardUltimosAtendimentos";
import CardRegioesAtendidas from "../components/cards/CardRegioesAtendidas";

export default function DashboardPessoal() {
  const handleRefresh = () => {
    window.location.reload(); // ou sua lógica customizada
  };

  const handleExport = () => {
    alert("Exportação ainda não implementada!"); // substituir futuramente
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* TOPO DA DASHBOARD */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        {/* Esquerda */}
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => window.history.back()}>
            <ArrowBackIcon />
          </IconButton>
          <BarChartRoundedIcon sx={{ fontSize: 40, color: "green" }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estatísticas e relatórios
            </Typography>
          </Box>
        </Box>

        {/* Direita */}
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Atualizar
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Excel
          </Button>
        </Box>
      </Box>

      {/* CARDS */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <CardTotalAtendimentos />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CardPessoasAssistidas />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CardMediaAtendimentoMensal />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CardUltimosAtendimentos />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CardRegioesAtendidas />
        </Grid>
      </Grid>
    </Box>
  );
}
