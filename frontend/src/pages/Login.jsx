import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
} from "@mui/material";
import { useState } from "react";

export default function LoginTelaYanomami() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0e4a2b", // verde profundo
        backgroundImage: "url('/bg-noise.png')", // opcional: textura tribal
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
<Container
  maxWidth="xs"
  sx={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // 👈 isso centraliza horizontalmente tudo dentro
    textAlign: "center",
  }}
>        <Box
          component="img"
          src="/funai-logo.png"
          alt="FUNAI"
          sx={{ width: 200, mx: "auto", mb: 8 }}
        />

        {/* Título */}
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontFamily: `"Hoverage", sans-serif`,
              letterSpacing: 8, 
              color: "#F4E3C1", 
              fontSize: "5rem", 
              whiteSpace: "nowrap", 
              textAlign: "center", 
              mb: 8
            }}
          >
            YANOMAMI & YE’KUANA
          </Typography>


        {/* Formulário */}
        <Box component="form" sx={{ mt: 4 }}>
<TextField
  label="Email Institucional"
  type="email"
  fullWidth
  variant="outlined"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
InputLabelProps={{
  shrink: true,
  sx: {
    backgroundColor: "#0E4A2B", 
    color: "#fdf1cd",
    px: 1,
    mx: 14,
    mt: -2,
    fontSize: "1.1rem",
    fontWeight: 'bold',
  },
}}

  sx={{
    mb: 5,
    "& .MuiOutlinedInput-root": {
      borderRadius: "15px",
      backgroundColor: "#eaf0ff",
      color: "#000",
    },
    "& .MuiOutlinedInput-input": {
      fontSize: '0.85rem',
      padding: "20px 1px 10px 10px", 
    },
  }}
/>


<TextField
  label="Senha"
  type="password"
  fullWidth
  variant="outlined"
  value={senha}
  onChange={(e) => setSenha(e.target.value)}
  InputLabelProps={{
    shrink: true,
    sx: {
    backgroundColor: "#0E4A2B", 
    color: "#fdf1cd",
    px: 1,
    mx: 18,
    mt: -2,
    fontSize: "1.1rem",
    fontWeight: 'bold',
    },
  }}
  sx={{
    mb: 3,
    "& .MuiOutlinedInput-root": {
      borderRadius: "15px",
      backgroundColor: "#eaf0ff",
      color: "#000",
    },
    "& .MuiOutlinedInput-input": {
      fontSize: '0.85rem',
      padding: "20px 1px 10px 10px",
    },
  }}
/>


   <Button
  variant="contained"
  fullWidth
  sx={{
    backgroundColor: "#4caf50",
    color: "#fdf1cd", 
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#3d9140",
    },
    mb: 2,
  }}
>
  Entrar
</Button>

          <Link
            href="#"
            underline="hover"
            sx={{ fontSize: "0.75rem", color: "#ccc" }}
          >
            Esqueci minha senha
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
