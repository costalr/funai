
# 🛡️ Plataforma de Formulários – Operações Yanomami

Este projeto visa consolidar uma **plataforma unificada de formulários** para coleta, análise e integração de dados das **operações de atendimento na Terra Indígena Yanomami**. A aplicação é responsiva, conectada ao banco de dados Supabase e inclui múltiplos módulos para diferentes tipos de atendimento e logística.

---

## 📌 Escopo Geral

- [x] **Formulário de Proteção Social** (implementado)
- [ ] Formulário de Entrega de Cestas
- [ ] Formulário de Entrega de Ferramentas
- [ ] Formulário de Apoio Logístico
- [ ] Documentação Civil (identidade, certidões, CPF)
- [ ] Relatórios e Dashboards

---

## ✅ Formulário de Proteção Social

### Funcionalidades
- Registro detalhado de cada atendimento (servidor, local, data e hora).
- **Captura automática de coordenadas GPS e município via geolocalização**.
- Identificação do **polo base** e da **comunidade atendida** (com opção de preenchimento manual).
- Registro dos modais de deslocamento, órgãos responsáveis e tempo de viagem.
- **Integração com múltiplos tipos de atendimento**:  
  Assistência Social, Previdência Social, Saúde, Documentação Civil, Segurança Alimentar e Apoio Logístico.
- **Upload de foto da entrega**, com **carimbo automático** contendo:
  - Nome do projeto
  - Nome da comunidade
  - Data e hora do registro
  - Coordenadas do local (EXIF)

---

## 🧩 Estrutura de Dados (Supabase)

### Tabelas Principais

| Tabela                         | Finalidade                                   |
|-------------------------------|----------------------------------------------|
| `informacoes_pessoais`        | Dados gerais do atendimento                  |
| `informacoes_deslocamento`    | Modais e tempo de deslocamento               |
| `atendimento_assistencia`     | Dados de assistência social                  |
| `atendimento_previdencia`     | Ações do INSS (CEAR, requerimento etc.)      |
| `atendimento_documentacao`    | Emissão de documentos civis                  |
| `atendimento_saude`           | UBS, hospital, CAPS, DSEI                    |
| `atendimento_seguranca_alimentar` | Entrega de alimentos + foto (URL)      |
| `atendimento_outros`          | Apoio logístico, insumos, deslocamentos      |
| `pessoa_atendida`             | Cadastro individual de pessoas atendidas     |

---

## ⚙️ Validações Implementadas

- **Campos obrigatórios**: Nome da pessoa, comunidade e tipo de atendimento.
- **Validação por município**: Campo *Interno/Externo* habilitado apenas para `Boa Vista`, `São Gabriel da Cachoeira`, `Santa Isabel do Rio Negro` e `Barcelos`.
- **Validação de deslocamento**:
  - Pelo menos um modal (terrestre, fluvial ou aéreo).
  - Obrigatório informar o órgão responsável (se *Oficial*).
- **Controle de submissão** com `isSubmitting` (evita envio duplo).
- **Carimbo em fotos** apenas se dados EXIF (GPS e data/hora) estiverem presentes.

---

## ⚡ Automações

- **📍 Geolocalização**: `navigator.geolocation` para coordenadas em tempo real.
- **🕓 Data/hora** ajustada ao fuso horário local.
- **🏞️ Município** identificado via [Nominatim](https://nominatim.org/) (OpenStreetMap).
- **📷 Upload de foto** com carimbo automático.
- **🗃️ Cache local** para lista de comunidades (`localStorage`).

---

## 🔒 Regras de Negócio Recentes


3. **Uploads para `fotos-entregas`**:
   - Nome do arquivo padronizado como `entrega_<id_atendimento>_<timestamp>.jpg`.
   - URL pública gravada em `atendimento_seguranca_alimentar.url_foto_entrega`.
4. **Integração com EXIF**:
   - Se a foto não contém EXIF (GPS e data), ainda é aceita, mas um aviso é mostrado.
   - A imagem pode ser processada para adicionar carimbo via função `addTimestampToImage`.
5. **Campos dinâmicos**:
   - O campo *Interno ou Externo* é exibido apenas quando aplicável ao município.
   - Campos de *Polo Base* são auto-preenchidos se a comunidade estiver cadastrada.

---

## 🚧 Próximos Passos

### Desenvolvimento
- [ ] Criar módulo de **Formulário de Cestas** (com vinculação automática via `id_comunidade`).
- [ ] **Formulário de Ferramentas** com gestão de estoque.
- [ ] Dashboard de visualização (métricas, comunidades atendidas).
- [ ] **Notificações e alertas com React-Toastify**.
- [ ] Melhorias de UX para captura de foto em dispositivos móveis (galeria + câmera).

### Documentação
- [ ] **Manual do usuário** para campo.
- [ ] **Diagrama ER** (atualização com tabelas de fotos).
- [ ] Documentar **políticas de RLS** no Supabase.

---

## 👩🏾‍💻 Responsável

**Lara**  
TI / Proteção Social – FUNAI  
Objetivo: consolidar um sistema próprio, leve e independente de planilhas, para uso em campo e posterior análise.

---

> Esta documentação será atualizada à medida que novos módulos forem desenvolvidos.
