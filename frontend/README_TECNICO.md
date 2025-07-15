## 🧩 Visão Geral

Este projeto é um formulário web para registrar atendimentos de proteção social realizados pela equipe de campo da FUNAI. Ele está integrado ao Supabase, com tabelas vinculadas para diferentes tipos de atendimento (assistência, previdência, saúde, etc).

O sistema foi construído com React + MUI (Material UI), Django como backend, Supabase como repositório de banco de dados e lógica modularizada por tipo de atendimento.

## 🗂️ Estrutura de Pastas

- `/components`: componentes reutilizáveis
- `/lib/supabaseAssistencia.js`: instância do Supabase para tabelas da Assistência
- `/lib/supabaseCestas.js`: instância para tabelas de referência (como comunidade)
- `/pages/FormularioProtecao.jsx`: página principal do formulário

## 🔐 Conexão com Supabase

O projeto utiliza duas instâncias de Supabase:

- `supabaseCestas`: para tabelas de referência (comunidade, subpolo/polo)
- `supabaseAssistencia`: para salvar os dados de atendimento

As chaves públicas de cada projeto devem estar configuradas em arquivos `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL_ASSISTENCIA=
NEXT_PUBLIC_SUPABASE_ANON_KEY_ASSISTENCIA=
NEXT_PUBLIC_SUPABASE_URL_CESTAS=
NEXT_PUBLIC_SUPABASE_ANON_KEY_CESTAS=



---

### 4. 🧠 Lógica de Funcionamento

```markdown
## 🧠 Lógica do Formulário

- O formulário é dividido em blocos temáticos: Dados do Atendimento, Pessoa Atendida, Modal de Deslocamento, Tipos de Atendimento, etc.
- Cada tipo de atendimento renderiza subcomponentes com base nas seleções feitas.
- A comunidade é selecionada via `Autocomplete`, com cache local de 24h.
- Se a comunidade for "Outros", o polo base pode ser preenchido manualmente.
- Ao enviar, o sistema salva primeiro em `informacoes_pessoais` e em seguida nas tabelas associadas, como `atendimento_assistencia`, `atendimento_documentacao`, etc.

## 🧪 Validações

- Nome e comunidade são obrigatórios
- Modal de deslocamento deve conter pelo menos uma opção
- Quando há “Viatura/Embarcação/Frete Oficial”, o órgão responsável é obrigatório
- Tempo de deslocamento é obrigatório
- “Interno ou Externo” é obrigatório apenas se o município for:
  - Boa Vista
  - São Gabriel da Cachoeira
  - Santa Isabel do Rio Negro
  - Barcelos

## 🧼 Limpeza do Formulário

Função `handleClear()`:
- Restaura os valores iniciais
- Reaplica a data e coordenadas
- Apaga estados como tipo de atendimento e observações

Essa função é acionada pelo botão “Limpar Formulário”.

## 🚨 Pontos de Atenção

- O campo `subpolo` foi renomeado para `polo_base`, então qualquer código ou integração anterior com `subpolo` deve ser atualizado.
- Sempre verificar se as tabelas estão sincronizadas com os campos usados no frontend.
- O Supabase precisa ter permissões corretas de escrita e leitura.
