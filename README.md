# SkillCert Backend Server

A NestJS REST API that manages the off-chain metadata for the SkillCert platform — including users, courses, modules, lessons, enrollments, quizzes, and reviews. It uses PostgreSQL via TypeORM and is designed to work alongside the SkillCert frontend.

---

## Prerequisites

Make sure the following are installed on your machine before proceeding:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 18.x | https://nodejs.org |
| npm | >= 9.x | Comes with Node.js |
| PostgreSQL | >= 14.x | https://www.postgresql.org/download |
| Git | any | https://git-scm.com |

---

## 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/skillcert-backend-server.git
cd skillcert-backend-server
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Set Up Environment Variables

Create a `.env` file in the project root by copying the example below:

```bash
cp .env.example .env   # if an example exists, otherwise create it manually
```

Then open `.env` and fill in your values:

```env
# Application
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=skillcert
```

> **Note:** When `NODE_ENV` is not `production`, TypeORM will auto-synchronize the database schema on startup (`synchronize: true`). Never use this in production — use migrations instead.

---

## 4. Create the Database

Log into PostgreSQL and create the database:

```bash
psql -U your_db_user -c "CREATE DATABASE skillcert;"
```

Or use a GUI tool like pgAdmin or TablePlus.

---

## 5. Run the Server

**Development mode** (auto-reloads on file changes):

```bash
npm run start:dev
```

**Standard start:**

```bash
npm run start
```

**Production mode** (requires a build first):

```bash
npm run build
npm run start:prod
```

The server will be available at `http://localhost:3000` by default.

---

## 6. API Documentation (Swagger)

Once the server is running, open your browser and navigate to:

```
http://localhost:3000/api
```

This displays the full interactive Swagger UI with all available endpoints.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start the server |
| `npm run start:dev` | Start in watch mode (development) |
| `npm run start:debug` | Start with debugger attached |
| `npm run start:prod` | Start compiled production build |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` | Run ESLint and auto-fix issues |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage report |
| `npm run test:e2e` | Run end-to-end tests |

---

## Project Structure

```
src/
├── users/            # User accounts and roles
├── courses/          # Course metadata
├── modules/          # Course modules (sections)
├── lessons/          # Individual lessons within modules
├── enrollment/       # User-course enrollment records
├── quiz/             # Quizzes and questions tied to lessons
├── reviews/          # Course reviews and ratings
├── categories/       # Course categories
├── objectives/       # Learning objectives per course
├── course-progress/  # Tracks lesson completion per enrollment
├── references/       # External reference links for lessons
├── lesson-resources/ # File/media resources for lessons
├── common/           # Shared utilities, guards, decorators
├── config/           # Database and app configuration
└── health/           # Health check endpoint
```

For a full explanation of how these entities relate to each other, see [`docs/data.md`](./docs/data.md).

---

## Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | App environment. Set to `production` to disable auto-sync |
| `DB_HOST` | Yes | — | PostgreSQL host |
| `DB_PORT` | Yes | `5432` | PostgreSQL port |
| `DB_USERNAME` | Yes | — | Database user |
| `DB_PASSWORD` | Yes | — | Database password |
| `DB_DATABASE` | Yes | — | Database name |