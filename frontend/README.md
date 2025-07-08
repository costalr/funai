# 🛡️ Plataforma de Formulários – Operações Yanomami

Este projeto tem como objetivo desenvolver uma **plataforma unificada de formulários** para coleta e integração de dados das **operações de atendimento na Terra Indígena Yanomami**. A aplicação será responsiva, conectada ao banco de dados Supabase e incluirá múltiplos módulos para diferentes tipos de atendimento.

## 📌 Escopo Geral

- [x] Formulário de Proteção Social (**implementado**)
- [ ] Formulário de Entrega de Cestas
- [ ] Formulário de Entrega de Ferramentas
- [ ] Documentação Civil
- [ ] Apoio Logístico e outros

---

## ✅ Formulário de Proteção Social

### Funcionalidades
- Registro completo do atendimento por servidor
- Coleta de dados da pessoa atendida, comunidade e acompanhantes
- Registro detalhado do deslocamento até a comunidade
- Vínculo com múltiplos tipos de atendimento (assistência, previdência, saúde, etc.)

### Tecnologias
- **React + Vite**
- **TailwindCSS**
- **Supabase (PostgreSQL + API)**
- **React-Select** para inputs customizados

---

## 🧩 Estrutura de Dados

### Tabelas utilizadas no Supabase:

| Tabela                         | Finalidade                                   |
|-------------------------------|----------------------------------------------|
| `informacoes_pessoais`        | Dados gerais do atendimento                  |
| `informacoes_deslocamento`    | Modais e tempo de deslocamento               |
| `atendimento_assistencia`     | Dados de assistência social                  |
| `atendimento_previdencia`     | Ações do INSS (CEAR, requerimento etc.)      |
| `atendimento_documentacao`    | Emissão de documentos civis                  |
| `atendimento_saude`           | UBS, hospital, DSEI                          |
| `atendimento_seguranca_alimentar` | Entrega de alimentos                    |
| `atendimento_outros`          | Insumos, apoio logístico, transporte         |

---

## ⚙️ Validações Implementadas

- Nome da pessoa atendida (obrigatório)
- Comunidade (obrigatório)
- Modal de deslocamento (ao menos um selecionado)
- Campos descritivos obrigatórios:
  - Órgão responsável (Viatura Oficial, Embarcação Oficial, Frete Aéreo Oficial)
  - Descrição de “Outros” (quando selecionado)
- Tempo de deslocamento (obrigatório)
- Tipo de atendimento (obrigatório)
- Bloqueio contra envio múltiplo com `isSubmitting`

---

## ⚡ Automatizações

- 📍 Coordenadas capturadas via `navigator.geolocation`
- 🕓 Data/hora local ajustada automaticamente (timezone local)
- 🏞️ Município estimado via API Nominatim (OpenStreetMap)
- 🗃️ Comunidades carregadas e armazenadas em cache local

---

## 🚧 Próximos Passos

### Desenvolvimento
- [ ] Refatorar layout com componentes reutilizáveis
- [ ] Adicionar `react-toastify` para mensagens de sucesso/erro
- [ ] Criar formulário de entrega de cestas (integração com `id_comunidade`)
- [ ] Dashboard de relatórios e visualizações (React + Supabase Views)
- [ ] Autenticação por nível de acesso (servidor, polo, gestor)

### Documentação
- [ ] Diagrama ER (entidade-relacionamento)
- [ ] Manual de implantação e configuração local
- [ ] Padrão de escrita para os campos e estados React

---

## 👩🏾‍💻 Responsável

**Lara**  
TI / Proteção Social – FUNAI  
Objetivo: consolidar um sistema próprio, leve e independente de planilhas, para uso em campo e posterior análise.

---

> Esta documentação será atualizada à medida que novos módulos forem desenvolvidos.
