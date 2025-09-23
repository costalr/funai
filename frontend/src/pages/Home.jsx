import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BuildIcon from "@mui/icons-material/Build"; // <-- ícone para ferramentas

export default function Home() {
  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Sistema de Proteção Social
      </Typography>

      <Typography variant="body1" gutterBottom>
        Escolha uma das opções abaixo para continuar:
      </Typography>

      <Grid container spacing={3} mt={2}>
        {/* Novo Atendimento */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              <AddIcon sx={{ verticalAlign: "middle", mr: 1 }} />
              Novo Atendimento
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Registrar um novo atendimento no sistema
            </Typography>
            <Button
              component={Link}
              to="/formulario"
              variant="contained"
              color="success"
              fullWidth
            >
              Cadastrar Atendimento
            </Button>
          </Paper>
        </Grid>

        {/* Entrega de Ferramentas */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              <BuildIcon sx={{ verticalAlign: "middle", mr: 1 }} />
              Entrega de Ferramentas
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Registrar uma entrega de ferramentas
            </Typography>
            <Button
              component={Link}
              to="/form-ferramentas"
              variant="contained"
              color="primary"
              fullWidth
            >
              Cadastrar Entrega
            </Button>
          </Paper>
        </Grid>

        {/* Visualizar Atendimentos */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              <ListAltIcon sx={{ verticalAlign: "middle", mr: 1 }} />
              Atendimentos
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Visualizar e gerenciar atendimentos cadastrados
            </Typography>
            <Button variant="outlined" disabled fullWidth>
              Ver Atendimentos
            </Button>
          </Paper>
        </Grid>

        {/* Dashboard */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              <AssessmentIcon sx={{ verticalAlign: "middle", mr: 1 }} />
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Visão geral e estatísticas do sistema
            </Typography>
            <Button
              component={Link}
              to="/dashboard"
              variant="outlined"
              fullWidth
            >
              Ver Dashboard
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
