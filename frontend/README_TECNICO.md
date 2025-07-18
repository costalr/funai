
# 🛡️ Plataforma de Formulários – Proteção Social Yanomami

Este repositório contém o código-fonte do **formulário de proteção social** da FUNAI, utilizado para registrar atendimentos em campo, com integração direta ao banco de dados **Supabase**.

---

## 🧩 Visão Geral

- **Front-end:** React + Vite + Material UI (MUI)
- **Back-end:** Django (API REST)
- **Banco de dados:** Supabase (PostgreSQL)
- **Armazenamento de imagens:** Buckets do Supabase (`fotos-entregas`)
- **Gerenciamento de estado:** React hooks (`useState`, `useEffect`)
- **Cache de comunidades:** LocalStorage com validade de 24h

---

## 🗂️ Estrutura de Pastas

```
/src
 ├── components
 │    └── FormProtecaoSocial.jsx
 ├── pages
 │    ├── Home.jsx
 │    ├── DashboardGeral.jsx
 │    ├── DashboardPessoal.jsx
 │    └── Login.jsx
 ├── lib
 │    ├── supabaseAssistencia.js
 │    └── supabaseCestas.js
 ├── debug
 │    └── TesteSupabase.jsx
```

---

## 🔐 Conexão com Supabase

Existem **duas instâncias** de Supabase no projeto:

- `supabaseAssistencia`: utilizada para as tabelas de atendimento (informações pessoais, deslocamentos, atendimentos etc.).
- `supabaseCestas`: utilizada para tabelas de referência (comunidade, subpolo, polo).

Configurações devem estar no arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL_ASSISTENCIA=<URL_DO_SUPABASE_ASSISTENCIA>
NEXT_PUBLIC_SUPABASE_ANON_KEY_ASSISTENCIA=<CHAVE_PUBLICA_ASSISTENCIA>
NEXT_PUBLIC_SUPABASE_URL_CESTAS=<URL_DO_SUPABASE_CESTAS>
NEXT_PUBLIC_SUPABASE_ANON_KEY_CESTAS=<CHAVE_PUBLICA_CESTAS>
```

---

## 🧠 Lógica do Formulário

- Dividido em **blocos temáticos**:
  1. Dados do Atendimento
  2. Pessoa Atendida
  3. Modal de Deslocamento
  4. Tipos de Atendimento (Assistência, Previdência, Saúde, etc.)
  5. Observações

- **Seleção de Comunidade:** via `Autocomplete`, com cache em `localStorage` por 24h.
- **Comunidade "Outros":** habilita campos manuais de nome e polo base.
- **Envio:** salva primeiro na tabela `informacoes_pessoais`, em seguida nas tabelas específicas (`atendimento_assistencia`, `atendimento_saude`, `atendimento_documentacao`, etc.).

---

## 🧪 Validações

- Nome da pessoa e comunidade são obrigatórios.
- Pelo menos **um modal de deslocamento** deve ser selecionado.
- Para opções **Oficiais** (Viatura, Embarcação, Frete), o campo “Órgão responsável” é obrigatório.
- Tempo de deslocamento é obrigatório.
- Campo “Interno ou Externo” é obrigatório se o município for:
  - Boa Vista
  - São Gabriel da Cachoeira
  - Santa Isabel do Rio Negro
  - Barcelos

---

## 🖼️ Upload de Fotos

- Utiliza `<input type="file" accept="image/*" capture="environment">`.
- Lê dados EXIF (GPS e data) usando `exifr`.
- Aplica **carimbo com informações da entrega** na foto (nome do projeto, comunidade, coordenadas e data/hora).
- Salva a imagem no bucket `fotos-entregas` e grava a URL pública no campo `url_foto_entrega` da tabela `atendimento_seguranca_alimentar`.

---

## 🧼 Limpeza do Formulário

A função `handleClear()`:

- Reseta todos os estados (nome, comunidade, tipos de atendimento, observações).
- Reaplica data/hora atual e coordenadas.
- É disparada pelo botão **"Limpar Formulário"**.

---

## 🚨 Pontos de Atenção

- O campo `subpolo` foi **renomeado para `polo_base`** – todos os pontos do código e do banco devem refletir isso.
- As regras de segurança (RLS) do Supabase devem permitir `insert` e `update` para usuários autenticados.
- Verifique se as colunas do banco estão **sincronizadas com os campos do front-end**.

---

## 🚀 Próximos Passos

- [ ] Corrigir comportamento do upload em dispositivos móveis (camera/gallery).
- [ ] Adicionar formulário de **Entrega de Cestas**.
- [ ] Criar **dashboard** unificado com métricas e gráficos.
- [ ] Integrar **toast notifications** (`react-toastify`).
- [ ] Melhorar UX de cache e recarga de comunidades.

---
