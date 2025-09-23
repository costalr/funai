import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/DashboardGeral";
import DashboardPessoal from "./pages/DashboardPessoal";
import Login from "./pages/Login";
import RequireAuth from "./components/RequireAuth";
import FormularioProtecao from "./components/FormProtecaoSocial";
import FormularioFerramentas from "./components/FormFerramentas"; // <-- novo import
import TesteSupabase from "./debug/TesteSupabase";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/teste-supabase" element={<TesteSupabase />} />

        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />

        <Route
          path="/formulario"
          element={
            <RequireAuth>
              <FormularioProtecao />
            </RequireAuth>
          }
        />

        <Route
          path="/form-ferramentas"
          element={
            <RequireAuth>
              <FormularioFerramentas />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/minha-dashboard"
          element={
            <RequireAuth>
              <DashboardPessoal />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
