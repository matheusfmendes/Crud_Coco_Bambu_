# User CRUD – OAuth2 + PKCE

Aplicação full stack para gerenciamento de usuários, desenvolvida como desafio técnico, utilizando **Django REST Framework**, **OAuth2 (Authorization Code + PKCE)**, **PostgreSQL**, **Angular (Standalone)** e **Docker**.

O projeto segue boas práticas de **REST**, **segurança**, **containerização** e **organização de código**, com foco em clareza, manutenibilidade e facilidade de execução.

---

## 📌 Visão Geral

A aplicação permite:

- Autenticação via **OAuth2 Authorization Code + PKCE**
- Login de usuários com **email e senha**
- Controle de permissões:
  - Usuários comuns: login e visualização dos próprios dados
  - Superusuários (admin): listar e cadastrar usuários
- API RESTful protegida por OAuth2
- Client Web em Angular consumindo a API
- Ambiente totalmente containerizado com Docker

---

## 🧱 Arquitetura

Frontend (Angular)
|
| OAuth2 + PKCE
v
API (Django REST)
|
v
PostgreSQL

yaml
Copiar código

- **Frontend**: Angular (Standalone Components)
- **Backend**: Django + Django REST Framework
- **Auth**: Django OAuth Toolkit
- **Banco**: PostgreSQL
- **Infra**: Docker + Docker Compose

---

## 🔐 Autenticação e Segurança

A autenticação segue o padrão **OAuth2 Authorization Code com PKCE**, indicado para aplicações SPA.

Fluxo resumido:
1. Usuário informa email e senha
2. Sessão Django é criada
3. Início do fluxo OAuth2 (`/o/authorize`)
4. Troca do código por token (`/o/token`)
5. API protegida por Bearer Token
6. Refresh token automático no frontend

✔ Tokens com expiração  
✔ Refresh token rotativo  
✔ API stateless  
✔ Controle de permissões por role  

---

## 🔗 Endpoints Principais (REST)

### Autenticação
- `POST /api/session/login/` – Login com email e senha
- `POST /o/token/` – OAuth2 Token
- `POST /o/revoke_token/` – Revogação de token

### Usuário
- `GET /api/me/` – Dados do usuário logado
- `GET /api/users/` – Listar usuários (admin)
- `POST /api/users/` – Criar usuário (admin)

Todos os endpoints seguem padrão REST:
- Recursos bem definidos
- Uso correto de métodos HTTP
- Retorno de status HTTP apropriados
- API stateless

---

## 👥 Controle de Acesso

| Ação                     | Usuário comum | Admin |
|--------------------------|---------------|-------|
Login                     | ✅            | ✅    |
Ver próprios dados        | ✅            | ✅    |
Listar usuários           | ❌            | ✅    |
Cadastrar usuários        | ❌            | ✅    |

---

## 🧪 Testes Unitários

Foram implementados **5 testes unitários** utilizando `Django TestCase`, cobrindo:

1. Criação de usuário
2. Login com credenciais válidas
3. Acesso ao endpoint `/api/me/`
4. Bloqueio de listagem para não-admin
5. Permissão de listagem para admin

### Executar testes:
```bash
docker compose exec api python manage.py test
🐳 Docker e Execução
Pré-requisitos
Docker

Docker Compose

Subir o projeto (produção)
bash
Copiar código
docker compose -f docker-compose.prod.yml up
Serviços disponíveis:

Frontend: http://localhost:4200

API: http://localhost:8000

Swagger: http://localhost:8000/api/docs/

Criar superusuário (admin)
bash
Copiar código
docker compose exec api python manage.py createsuperuser
📦 Docker Hub
As imagens Docker da aplicação estão publicadas no Docker Hub, permitindo execução imediata sem build local.

O código-fonte completo também está disponível neste repositório.

📂 Estrutura do Projeto
arduino
Copiar código
backend/
 ├── config/
 ├── users/
 │   ├── models.py
 │   ├── views.py
 │   ├── serializers.py
 │   ├── permissions.py
 │   ├── tests/
 │   │   └── test_api.py
 └── manage.py

frontend/
 ├── src/
 │   ├── app/
 │   ├── pages/
 │   ├── core/
 │   └── styles.css

docker-compose.dev.yml
docker-compose.prod.yml
🧠 Decisões e Trade-offs
OAuth2 + PKCE foi escolhido por ser o padrão recomendado para SPAs

O login inicial com email/senha melhora a experiência do usuário antes do fluxo OAuth

Django REST Framework foi utilizado pela maturidade e clareza

Angular Standalone reduz boilerplate e melhora organização

Docker garante reprodutibilidade e facilidade de avaliação

Não foi utilizado scaffolding automático de API, conforme exigido no desafio

📄 Observações Finais
Este projeto foi desenvolvido seguindo os critérios do desafio, com foco em:

Segurança

Padrões REST

Clareza de código

Facilidade de execução

Boas práticas de mercado

Fico à disposição para quaisquer esclarecimentos.

Autor: Matheus Mendes
