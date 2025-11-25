# AuzWeb - Sistema de Gestão de Agendamentos Médicos

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6.8.1-CA4245?logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.8.4-5A29E4?logo=axios&logoColor=white)

Sistema web moderno para gestão de agendamentos, pacientes e médicos

**Desenvolvido especialmente para clínicas pequenas**

[Começar](#instalação) • [Funcionalidades](#funcionalidades) • [Tecnologias](#tecnologias)

</div>

---

## Funcionalidades

### Gestão de Usuários
- Autenticação e autorização
- Registro de novos usuários
- Perfis de parceiros e operacionais

### Agendamentos
- Visualização de calendário
- Criação e edição de agendamentos
- Detalhes completos de agendamentos
- Upload e download de documentos (PDF, imagens, etc.)
- Busca e filtros avançados

### Gestão Médica
- Cadastro de médicos
- Visualização de relacionamentos
- Dashboard operacional

### Gestão de Pacientes
- Cadastro completo de pacientes
- Histórico de atendimentos
- Documentos associados

### Menu Operacional
- Interface dedicada para usuários operacionais
- Visualização de agendamentos e pacientes
- Navegação intuitiva com carrosséis

---

## Tecnologias

- **React 18.2.0** - Biblioteca JavaScript para interfaces
- **React Router DOM 6.8.1** - Roteamento de páginas
- **Axios 1.8.4** - Cliente HTTP para APIs
- **CSS3** - Estilização moderna e responsiva

---

## Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd AuzWeb/auz-web
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure a API**
   - Edite os arquivos em `src/services/` para configurar a URL da API
   - Por padrão: `http://189.126.105.186:8080`

4. **Inicie o servidor de desenvolvimento**
```bash
npm start
```

5. **Acesse a aplicação**
   - Abra [http://localhost:3000](http://localhost:3000) no navegador

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm test` | Executa os testes unitários |
| `npm run build` | Cria build de produção |
| `npm run test:watch` | Executa testes em modo watch |

---

## Estrutura do Projeto

```
auz-web/
├── public/              # Arquivos estáticos
├── src/
│   ├── components/      # Componentes React
│   │   ├── agendamento/ # Detalhes de agendamentos
│   │   ├── home/        # Páginas principais
│   │   ├── Login/       # Autenticação
│   │   ├── operacional/ # Menu operacional
│   │   ├── parceiro/    # Gestão de parceiros
│   │   └── custom/       # Componentes reutilizáveis
│   ├── services/         # Serviços de API
│   ├── styles/          # Estilos globais
│   └── utils/           # Utilitários
└── package.json
```

---

## Autenticação

O sistema utiliza autenticação baseada em tokens JWT armazenados no `localStorage`. As rotas protegidas verificam automaticamente a autenticação do usuário.

---

## Docker

O projeto inclui suporte para Docker:

```bash
# Build da imagem
docker build -t auz-web .

# Executar com docker-compose
docker-compose up
```

---

## Testes

Execute os testes com:
```bash
npm test
```

Os testes utilizam:
- Jest
- React Testing Library

---

## Licença

Este projeto é privado e de uso interno.

---

## Contribuição

Para contribuir com o projeto:
1. Crie uma branch para sua feature
2. Faça commit das alterações
3. Abra um Pull Request

---

<div align="center">

**Desenvolvido para gestão médica de clínicas pequenas**

</div>
