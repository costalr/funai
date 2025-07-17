import { useEffect, useState } from "react";
import CardContainer from "../ui/CardContainer";
import { getMediaMensalPorServidor } from "../../lib/Supabase/protecao_social/supabaseInformacoesPessoais";

export default function CardMediaAtendimentoMensal() {
  const [media, setMedia] = useState(0);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("usuario");
    if (userData) {
      const userObj = JSON.parse(userData);
      setUsuario(userObj);
    } else {
      console.warn("[AVISO] Nenhum usuário encontrado no localStorage.");
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      carregarMedia();
    }
  }, [usuario]);

  async function carregarMedia() {
    try {
      const media = await getMediaMensalPorServidor(usuario.nome_completo);
      setMedia(Math.round(media)); // 👈 aqui arredondamos para inteiro
    } catch (error) {
      console.error("[ERRO] ao buscar média mensal:", error);
    }
  }


  return (
    <CardContainer
      titulo="Média Mensal"
      valor={media}
      subtitulo="Atendimentos por mês"
      onIconClick={() => navigator.clipboard.writeText(String(media))}
    />
  );
}
