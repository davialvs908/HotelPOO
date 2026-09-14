# HotelPOO - PMS

Sistema de gestão hoteleira do **Hotel É o Que Tem Pra Hoje**. O produto principal é a API Spring Boot em `backend/` mais o painel da recepção em `frontend/` (aplicação Vite/React separada).

O console Java em `src/hotelpoo/` permanece apenas como estudo de POO e **não** é a interface de produção.

## Pré-requisitos

- Java 21
- Node.js 20 (somente para o frontend)
- Docker (PostgreSQL 16)

## Como subir

### 1. Banco de dados

Na raiz do repositório:

```bash
docker compose up -d
```

Sobe o PostgreSQL 16 em `localhost:5432`, banco `hotelpoo`, usuário `hotel`, senha `hotel`.

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

No Windows:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

A API fica em `http://localhost:8080/api`.

Variáveis de ambiente opcionais:

- `SPRING_DATASOURCE_URL` (padrão `jdbc:postgresql://localhost:5432/hotelpoo`)
- `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` (padrão `hotel` / `hotel`)
- `JWT_SECRET` (obrigatório em produção; deve ter no mínimo 32 caracteres)

### 3. Frontend

O painel é um app Vite separado em `frontend/`. Depois que o backend estiver no ar:

```bash
cd frontend
npm install
npm run dev
```

O Vite deve expor a UI em `http://localhost:5173` e fazer proxy de `/api` para a porta 8080.

## Usuários seed (somente desenvolvimento local)

Estas contas existem só no banco inicial da máquina local. Não use em produção e não as exponha na interface.

| Login     | Senha         | Papel          |
|-----------|---------------|----------------|
| admin     | admin123      | GERENTE        |
| recepcao  | recepcao123   | RECEPCIONISTA  |
| camareira | camareira123  | CAMAREIRA      |

Quartos seed (mesmos do estudo de POO): 101/102 Simples (R$100/noite), 201/202 Luxo (R$225/noite), 301/302 Suíte (R$450/noite). Também há clientes de exemplo, uma reserva futura `RESERVADA`, uma `CHECKED_IN` (quarto ocupado) e um feedback.

## Papéis

- **GERENTE**: acesso total, inclusive usuários e preço base dos quartos
- **RECEPCIONISTA**: clientes, reservas, check-in/out, pagamentos, transferência, feedbacks e relatórios; não gerencia usuários nem altera preço base
- **CAMAREIRA**: apenas listar/consultar quartos e atualizar status de limpeza/manutenção

## Autenticação

`POST /api/auth/login` com `{ "login", "senha" }` devolve `{ "token", "nome", "papel" }`.

Nas demais rotas: `Authorization: Bearer <token>`.

Erros no formato `{ "mensagem": "...", "campo": "..." }` (campo opcional). HTTP 400/401/403/404/409.

## Endpoints

Base: `http://localhost:8080/api`

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me`

### Clientes
- `GET /api/clientes?busca=`
- `GET /api/clientes/{id}`
- `POST /api/clientes`
- `PUT /api/clientes/{id}`
- `DELETE /api/clientes/{id}` (409 se houver reserva `RESERVADA` ou `CHECKED_IN`)

### Quartos
- `GET /api/quartos`
- `GET /api/quartos/disponiveis?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD`
- `GET /api/quartos/{id}`
- `POST /api/quartos` (GERENTE)
- `PUT /api/quartos/{id}` (GERENTE)
- `PATCH /api/quartos/{id}/status` (GERENTE/CAMAREIRA): corpo `{ "status": "LIVRE"|"SUJO"|"MANUTENCAO" }`

### Reservas
- `GET /api/reservas?status=`
- `GET /api/reservas/{id}`
- `POST /api/reservas`
- `POST /api/reservas/{id}/cancelar`
- `POST /api/reservas/{id}/renovar`: `{ "novaDataCheckOut" }`
- `POST /api/reservas/{id}/transferir`: `{ "novoQuartoId" }`
- `POST /api/reservas/{id}/check-in`
- `POST /api/reservas/{id}/check-out`
- `POST /api/reservas/{id}/hospedes`
- `POST /api/reservas/{id}/pagamentos`
- `GET /api/reservas/{id}/folio`

### Demais
- `GET /api/dashboard`
- `GET /api/relatorios/completo`
- `GET /api/relatorios/resumido`
- CRUD `/api/feedbacks`
- CRUD `/api/usuarios` (somente GERENTE; a senha nunca é devolvida)

## Testes do backend

```bash
cd backend
./mvnw test
```

Os testes de domínio (preço, sobreposição de datas, folio, cancelamento e CPF duplicado) usam JUnit 5 e H2/Mockito: **não precisam do PostgreSQL**.

## CORS

Liberado para `http://localhost:5173`.
