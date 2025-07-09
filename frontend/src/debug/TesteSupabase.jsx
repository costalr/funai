import { useEffect, useState } from "react";
import { supabaseCestas } from "../lib/supabaseCestas"; 

export default function TesteSupabase() {
  const [status, setStatus] = useState("🔄 Testando conexão...");
  const [dados, setDados] = useState(null);

  useEffect(() => {
    async function testarConexao() {
      const { data, error } = await supabaseCestas
        .from("comunidade")
        .select(`id_comunidade, nome_comunidade, comunidade_id_subpolo_fkey (nome_subpolo, polo (nome_polo))`)
        .order("nome_comunidade", { ascending: true });

      if (error) {
        console.error("❌ Erro ao buscar comunidades:", error.message);
        setStatus("❌ Erro ao buscar comunidades: " + error.message);
      } else {
        console.log("✅ Dados recebidos:", data);
        setStatus("✅ Conexão e relacionamento funcionando!");
        setDados(data.slice(0, 5)); // mostra só os 5 primeiros
      }
    }

    testarConexao();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Teste de Relacionamento Aninhado</h2>
      <p className="mb-4">{status}</p>

      {dados && (
<ul>
  {dados.map((comunidade) => {
    const subpolo = comunidade.comunidade_id_subpolo_fkey;
    const nomeSubpolo = subpolo?.nome_subpolo || "—";
    const nomePolo = subpolo?.polo?.nome_polo || "—";

    return (
      <li key={comunidade.id_comunidade}>
        <strong>{comunidade.nome_comunidade}</strong> — Subpolo: {nomeSubpolo} / Polo: {nomePolo}
      </li>
    );
  })}
</ul>

      )}
    </div>
  );
}
