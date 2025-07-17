import { useEffect, useState } from "react";
import DashboardCardContainer from "../ui/CardContainer";
import { getUltimoAtendimentoPorServidor } from "../../lib/Supabase/protecao_social/supabaseInformacoesPessoais";

export default function CardUltimoAtendimento() {
  const [usuario, setUsuario] = useState(null);
  const [atendimento, setAtendimento] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("usuario");
    if (userData) setUsuario(JSON.parse(userData));
  }, []);

  useEffect(() => {
    if (usuario) carregarUltimo();
  }, [usuario]);

  async function carregarUltimo() {
    try {
      const data = await getUltimoAtendimentoPorServidor(usuario.nome_completo);
      setAtendimento(data);
    } catch (err) {
      console.error("Erro ao buscar último atendimento:", err);
    }
  }

  return (
    <DashboardCardContainer
      titulo="Último Atendimento"
      valor={atendimento ? new Date(atendimento.data_hora).toLocaleDateString("pt-BR") : "-"}
      subtitulo={atendimento ? `${atendimento.nome_atendido} — ${atendimento.comunidade}` : "—"}
      onIconClick={() =>
        atendimento && navigator.clipboard.writeText(`${atendimento.nome_atendido} - ${atendimento.data_hora}`)
      }
    />
  );
}
