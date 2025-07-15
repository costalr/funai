import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export default function LoginTelaYanomami() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      const response = await axios.post(`${apiUrl}/api/token/`, {
        email,
        password: senha,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("usuario", JSON.stringify(user));

      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 401) {
        setErro("Credenciais inválidas. Verifique e tente novamente.");
      } else {
        setErro("Erro ao conectar com o servidor. Tente novamente mais tarde.");
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0e4a2b",
        backgroundImage: "url('/bg-noise.png')",
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
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          component="img"
          src="/funai-logo.png"
          alt="FUNAI"
          sx={{ width: 200, mx: "auto", mb: 8 }}
        />

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
            mb: 8,
          }}
        >
          YANOMAMI & YE’KWANA
        </Typography>

        {erro && (
          <Typography sx={{ color: "red", mb: 2 }}>{erro}</Typography>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 4 }}>
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
                fontWeight: "bold",
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
                fontSize: "0.85rem",
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
                fontWeight: "bold",
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
                fontSize: "0.85rem",
                padding: "20px 1px 10px 10px",
              },
            }}
          />

          <Button
            type="submit"
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
