import { useEffect, useState } from "react";
import DashboardCardContainer from "../ui/CardContainer";
import { getRegioesPorServidor } from "../../lib/Supabase/protecao_social/supabaseInformacoesPessoais";

export default function CardRegioesAtendidas() {
  const [usuario, setUsuario] = useState(null);
  const [comunidades, setComunidades] = useState(0);
  const [polos, setPolos] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem("usuario");
    if (userData) setUsuario(JSON.parse(userData));
  }, []);

  useEffect(() => {
    if (usuario) carregarRegioes();
  }, [usuario]);

  async function carregarRegioes() {
    try {
      const regiao = await getRegioesPorServidor(usuario.nome_completo);
      setComunidades(regiao.totalComunidades);
      setPolos(regiao.totalPolos);
    } catch (err) {
      console.error("Erro ao buscar regiões:", err);
    }
  }

  return (
    <DashboardCardContainer
      titulo="Regiões Atendidas"
      valor={`${comunidades}C / ${polos}P`}
      subtitulo="Comunidades e Polos Base"
      onIconClick={() =>
        navigator.clipboard.writeText(`${comunidades} comunidades / ${polos} polos`)
      }
    />
  );
}
