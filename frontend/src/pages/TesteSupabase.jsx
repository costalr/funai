import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function TesteSupabase() {
  const [status, setStatus] = useState("🔄 Testando conexão...");
  const [dados, setDados] = useState(null);

  useEffect(() => {
    async function testarConexao() {
      const { data, error } = await supabase
        .from("comunidade")
        .select("*")
        .limit(5);

      if (error) {
        console.error("❌ Erro ao conectar com Supabase:", error.message);
        setStatus("❌ Erro ao conectar: " + error.message);
      } else {
        console.log("✅ Conexão bem-sucedida! Dados:", data);
        setStatus("✅ Conexão bem-sucedida!");
        setDados(data);
      }
    }

    testarConexao();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Teste de Conexão com Supabase</h2>
      <p className="mb-4">{status}</p>

      {dados && (
        <ul className="list-disc pl-6 space-y-1">
          {dados.map((comunidade) => (
            <li key={comunidade.id}>
              {comunidade.nome_comunidade || "Sem nome"} (ID: {comunidade.id})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
