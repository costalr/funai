import { supabaseAssistencia } from "../supabaseAssistencia"; 

console.log("[DEBUG] Arquivo supabaseInformacoesPessoais.js carregado.");


// 1. Total de atendimentos realizados por servidor
export async function getTotalAtendimentosPorServidor(nome_servidor) {
  const { count, error } = await supabaseAssistencia
    .from("informacoes_pessoais")
    .select("id_atendimento", { count: "exact", head: true })
    .eq("nome_servidor", nome_servidor);

  if (error) throw error;
  return count ?? 0;
}

// 2. Total de pessoas únicas (nome + comunidade)
export async function getPessoasUnicasPorServidor(nome_servidor) {
  const { data, error } = await supabaseAssistencia
    .from("informacoes_pessoais")
    .select("nome_atendido, comunidade")
    .eq("nome_servidor", nome_servidor);

  if (error) throw error;

  const set = new Set(
    data.map((d) => `${d.nome_atendido.trim()}||${d.comunidade.trim()}`)
  );

  return set.size;
}

// 3. Último atendimento realizado
export async function getUltimoAtendimentoPorServidor(nome_servidor) {
  const { data, error } = await supabaseAssistencia
    .from("informacoes_pessoais")
    .select("*")
    .eq("nome_servidor", nome_servidor)
    .order("data_hora", { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

// 4. (Opcional) Retorna todos os registros de atendimentos para o servidor
export async function getTodosAtendimentosPorServidor(nome_servidor) {
  const { data, error } = await supabaseAssistencia
    .from("informacoes_pessoais")
    .select("*")
    .eq("nome_servidor", nome_servidor)
    .order("data_hora", { ascending: false });

  if (error) throw error;
  return data;
}

// 5. Retorna as regiões atendidas para o servidor
export async function getRegioesPorServidor(nome_servidor) {
  const { data, error } = await supabaseAssistencia
    .from("informacoes_pessoais")
    .select("comunidade, polo_base")
    .eq("nome_servidor", nome_servidor);

  if (error) throw error;

  const comunidades = new Set(data.map((d) => d.comunidade.trim()));
  const polos = new Set(data.map((d) => d.polo_base.trim()));

  return {
    totalComunidades: comunidades.size,
    totalPolos: polos.size,
    comunidades: Array.from(comunidades),
    polos: Array.from(polos),
  };
}

// 6. Média mensal de atendimentos por servidor
export async function getMediaMensalPorServidor(nome_servidor) {
  const { data, error } = await supabaseAssistencia
    .from("informacoes_pessoais")
    .select("data_atendimento")
    .eq("nome_servidor", nome_servidor);

  if (error) throw error;

  const mesesUnicos = new Set(
    data.map((d) =>
      new Date(d.data_atendimento).toISOString().slice(0, 7) // ex: '2025-07'
    )
  );

  const total = data.length;
  const media = total / (mesesUnicos.size || 1);

  return media.toFixed(1);
}
