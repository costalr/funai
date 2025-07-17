import { useEffect, useState } from "react";
import { getTotalAtendimentosPorServidor } from "../../lib/Supabase/protecao_social/supabaseInformacoesPessoais";
import CardContainer from "../ui/CardContainer";

export default function CardTotalAtendimentos() {
  const [total, setTotal] = useState(0);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("usuario");
    if (userData) {
      const userObj = JSON.parse(userData);
      console.log("[DEBUG] Usuário carregado do localStorage:", userObj);
      setUsuario(userObj);
    } else {
      console.warn("[AVISO] Nenhum usuário encontrado no localStorage.");
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      carregarTotal();
    }
  }, [usuario]);

  async function carregarTotal() {
    try {
      const total = await getTotalAtendimentosPorServidor(usuario.nome_completo);
      console.log("[DEBUG] Total de atendimentos recebidos:", total);
      setTotal(total);
    } catch (error) {
      console.error("[ERRO] Falha ao buscar total de atendimentos:", error);
    }
  }

  return (
      <CardContainer
        titulo="Total de Atendimentos"
        valor={total}
        subtitulo="Todos os atendimentos registrados"
        onIconClick={() => navigator.clipboard.writeText(String(total))}
      />

  );
}
