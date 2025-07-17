import { supabaseAssistencia } from "../lib/Supabase/supabaseAssistencia";

export async function getTiposGeral(idAtendimento) {
  const tipos = [];

  const tabelas = {
    "Assistência": "atendimento_assistencia",
    "Saúde": "atendimento_saude",
    "Previdência": "atendimento_previdencia",
    "Documentação": "atendimento_documentacao",
    "Segurança Alimentar": "atendimento_seguranca_alimentar",
    "Outros": "atendimento_outros"
  };

  for (const [nome, tabela] of Object.entries(tabelas)) {
    const { data, error } = await supabaseAssistencia
      .from(tabela)
      .select("id")
      .eq("id_atendimento", idAtendimento)
      .limit(1);

    if (error) {
      console.error(`Erro ao buscar tipo em ${tabela}:`, error);
      continue;
    }

    if (data && data.length > 0) {
      tipos.push(nome);
      console.log(`✅ Atendimento ${idAtendimento} inclui: ${nome}`);
    }
  }

  if (tipos.length === 0) {
    console.log(`⚠️ Atendimento ${idAtendimento} sem tipo identificado.`);
    return "Não informado";
  }

  return tipos.join(", ");
}
