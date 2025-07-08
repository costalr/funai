import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Plataforma de Formulários - FUNAI</h1>
      <p className="mb-6">Escolha um formulário para iniciar o preenchimento.</p>
      <Link
        to="/dashboard"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Formulário de Proteção Social
      </Link>
    </div>
  );
}
