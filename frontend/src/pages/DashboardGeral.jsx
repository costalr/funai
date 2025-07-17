import { useEffect, useState } from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";
import { supabaseAssistencia } from "../lib/Supabase/supabaseAssistencia";

export default function Dashboard() {
  const [totalAtendimentos, setTotalAtendimentos] = useState(0);
  const [pessoasAtendidas, setPessoasAtendidas] = useState(0);
  const [mediaMensal, setMediaMensal] = useState(0);

  useEffect(() => {
    fetchIndicadores();
  }, []);

  const fetchIndicadores = async () => {
    // Total de atendimentos
    const { count: countAtendimentos, error: erroTotal } = await supabaseAssistencia
      .from("informacoes_pessoais")
      .select("*", { count: "exact", head: true });

    if (erroTotal) {
      console.error("Erro ao contar atendimentos:", erroTotal);
    } else {
      setTotalAtendimentos(countAtendimentos || 0);
    }

    // Pessoas únicas (tabela pessoa_atendida)
    const { count: pessoasUnicas, error: erroPessoas } = await supabaseAssistencia
      .from("pessoa_atendida")
      .select("*", { count: "exact", head: true });

    if (erroPessoas) {
      console.error("Erro ao contar pessoas:", erroPessoas);
    } else {
      setPessoasAtendidas(pessoasUnicas || 0);
    }

    // Média mensal (RPC)
    const { data: mediaRes, error: erroMedia } = await supabaseAssistencia.rpc("media_mensal_atendimentos");

    if (erroMedia) {
      console.error("Erro ao calcular média mensal:", erroMedia);
    } else {
      setMediaMensal(mediaRes || 0);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Dashboard de Atendimentos
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="subtitle2">Total de Atendimentos</Typography>
            <Typography variant="h5">{totalAtendimentos}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="subtitle2">Pessoas Atendidas</Typography>
            <Typography variant="h5">{pessoasAtendidas}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="subtitle2">Média Mensal</Typography>
            <Typography variant="h5">{mediaMensal}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
