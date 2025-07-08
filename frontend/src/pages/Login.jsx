import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      const response = await axios.post(`${apiUrl}/api/token/`, {
        email,
        password,

      });

      const { access, refresh, user } = response.data;

      // Armazena tokens e dados do usuário no localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("usuario", JSON.stringify(user));

      // Redireciona para o dashboard
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 401) {
        setErro("Credenciais inválidas. Verifique e tente novamente.");
      } else {
        setErro("Erro ao conectar com o servidor. Tente novamente mais tarde.");
      }
      console.error("Erro no login:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-xl font-semibold mb-4">Login - Plataforma FUNAI</h1>

        {erro && <p className="text-red-600 mb-3">{erro}</p>}

        <label className="block mb-2 text-sm">Email Institucional</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded"
          placeholder="seu.nome@funai.gov.br"
          required
        />

        <label className="block mb-2 text-sm">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Entrar
        </button>


      </form>
    </div>

    
  );
}
