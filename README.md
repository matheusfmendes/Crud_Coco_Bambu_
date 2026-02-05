# User CRUD – OAuth2 (Authorization Code + PKCE)

Aplicação **full stack** para gerenciamento de usuários, desenvolvida como um **CRUD com autenticação OAuth2**, seguindo boas práticas de segurança, arquitetura e separação de responsabilidades.

O projeto foi estruturado para facilitar **avaliação técnica**, **execução local** e **deploy via Docker**, sem dependência de ambiente específico.

---

##  Visão Geral

A aplicação permite:

- Autenticação de usuários via **e-mail e senha**
- Controle de acesso baseado em perfil
- Gerenciamento de usuários restrito a administradores
- Consumo de API REST autenticada via OAuth2
- Execução completa via Docker

---

##  Arquitetura

Angular (SPA)
└── OAuth2 Authorization Code + PKCE
Django REST API
└── PostgreSQL

yaml
Copiar código

### Componentes

- **Frontend**: Angular (SPA)
- **Backend**: Django + Django REST Framework
- **Autenticação**: django-oauth-toolkit (OAuth2)
- **Banco de dados**: PostgreSQL
- **Infraestrutura**: Docker + Docker Compose

---

##  Autenticação e Segurança

- Protocolo **OAuth2**
- Fluxo **Authorization Code + PKCE** (recomendado para SPAs)
- Tokens de acesso com expiração
- Refresh token automático
- Revogação de token no logout
- Senhas armazenadas com **hash seguro (PBKDF2 + salt)** via Django

---

##  Controle de Acesso

| Perfil | Permissões |
|------|-----------|
| Usuário comum | Login e visualização dos próprios dados |
| Superusuário | Login, cadastro e listagem de usuários |

O controle é aplicado em **duas camadas**:
- **Frontend**: guards de rota (auth / admin)
- **Backend**: permissões no DRF (IsAuthenticated + IsSuperUser)

---

##  Backend (API)

Principais tecnologias e padrões:

- Django
- Django REST Framework
- django-oauth-toolkit
- API REST seguindo padrão HTTP
- Swagger/OpenAPI para documentação
- Migrations para versionamento de banco

### Endpoints principais

- `POST /api/session/login/`
- `GET /api/me/`
- `GET /api/users/` (admin)
- `POST /api/users/` (admin)
- `/o/authorize/`
- `/o/token/`
- `/o/revoke_token/`

---

## Frontend (SPA)

- Angular (standalone components)
- Guards de rota:
  - `authGuard`
  - `adminGuard`
  - `loginGuard`
- Interceptor HTTP para:
  - Inclusão automática do access token
  - Refresh automático em caso de expiração
- UI simples, limpa e funcional

---

##  Como Executar o Projeto

### Requisitos

- Docker
- Docker Compose

> Nenhuma dependência adicional (Node, Python ou PostgreSQL) é necessária.

---

##  Modo Produção (recomendado para avaliação)

Utiliza **imagens Docker prontas**, permitindo execução imediata.

### 1️ Carregar as imagens
```bash
docker load < api.tar
docker load < client.tar

2️ Subir a aplicação
bash
Copiar código
docker compose -f docker-compose.prod.yml up

3️ Acessar
Frontend: http://localhost:4200

API: http://localhost:8000

Swagger: http://localhost:8000/api/docs

 Modo Desenvolvimento
Neste modo:

API e banco rodam em Docker

Frontend roda localmente com hot reload

1️ Subir backend e banco
bash
Copiar código
docker compose -f docker-compose.dev.yml up

2️ Rodar o frontend
bash
Copiar código
cd frontend
npm install
npm start
Frontend: http://localhost:4200

API: http://localhost:8000

 Criação de Superusuário
Para acessar funcionalidades administrativas:

bash
Copiar código
docker compose exec api python manage.py createsuperuser
Após o login com esse usuário, a rota Lista de Usuários ficará disponível.

 Testes Manuais Sugeridos
Usuário comum não acessa rotas administrativas

Superusuário acessa cadastro e listagem

Tentativa de acesso direto a /admin/users sem permissão é bloqueada

Refresh automático do token após expiração

Revogação correta no logout

 Decisões Técnicas
OAuth2 + PKCE adotado por ser o padrão recomendado para SPAs

Separação clara entre frontend e backend

Docker utilizado para padronização de ambiente

Controle de acesso aplicado em múltiplas camadas

Código priorizando clareza, organização e extensibilidade

 Estrutura do Projeto
bash
Copiar código
backend/
  config/
  users/
frontend/
  src/app/
docker-compose.dev.yml
docker-compose.prod.yml
README.md

Autor
Matheus Mendes
Desenvolvedor Full Stack