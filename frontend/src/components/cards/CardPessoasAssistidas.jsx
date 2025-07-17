import { useEffect, useState } from "react";
import DashboardCardContainer from "../ui/CardContainer";
import { getPessoasUnicasPorServidor } from "../../lib/Supabase/protecao_social/supabaseInformacoesPessoais";

export default function CardPessoasAssistidas() {
  const [total, setTotal] = useState(0);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("usuario");
    if (userData) {
      const userObj = JSON.parse(userData);
      console.log("[DEBUG] Usuário logado:", userObj.nome_completo);
      setUsuario(userObj);
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      carregarPessoas();
    }
  }, [usuario]);

  async function carregarPessoas() {
    try {
      const totalUnicos = await getPessoasUnicasPorServidor(usuario.nome_completo);
      console.log("[DEBUG] Total de pessoas únicas:", totalUnicos);
      setTotal(totalUnicos);
    } catch (error) {
      console.error("[ERRO] ao buscar pessoas únicas:", error);
    }
  }

  return (
    <DashboardCardContainer
      titulo="Pessoas Assistidas"
      valor={total}
      subtitulo="Total de Pessoas Assistidas"
      onIconClick={() => navigator.clipboard.writeText(String(total))}
    />
  );
}
