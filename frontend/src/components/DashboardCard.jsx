import {
  Box,
  Typography,
  Paper,
  Collapse,
  IconButton,
  List,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useState } from "react";

export default function DashboardCard({ titulo, valor, detalhe }) {
  const [aberto, setAberto] = useState(false);

  const handleToggle = () => {
    setAberto((prev) => !prev);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle2" color="textSecondary">
            {titulo}
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {valor}
          </Typography>
        </Box>
        {detalhe && (
          <IconButton onClick={handleToggle}>
            {aberto ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
      </Box>

      {detalhe && (
        <Collapse in={aberto} timeout="auto" unmountOnExit>
          <List dense>{detalhe}</List>
        </Collapse>
      )}
    </Paper>
  );
}
