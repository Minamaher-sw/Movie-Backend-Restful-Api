
# 🎬 MovieApp — NestJS Backend

> A production-ready, full-featured backend for a movie streaming and subscription platform built with modern technologies.

[![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-UNLICENSED-gray)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](#contributing)

---

## 📋 Overview

A comprehensive backend solution for MovieApp, featuring modular domain-driven architecture with JWT authentication, role-based access control, Cloudinary media integration, subscription/payment flows, rate limiting, email notifications, OpenAPI documentation, and extensive test coverage.

---

## ✨ Key Features

- 🔐 **JWT Authentication** — Access & refresh tokens with role-based guards
- 🎥 **Media Management** — Cloudinary integration for uploads
- 💳 **Subscription & Payments** — Complete subscription and payment workflows
- 🛡️ **Security** — Rate limiting, Helmet, CORS, JWT validation
- 📧 **Email Notifications** — Nodemailer with EJS templating
- 📚 **API Documentation** — Swagger/OpenAPI at `/api/v1/swagger`
- ✅ **Comprehensive Testing** — Jest (unit) & Supertest (E2E)
- 🏗️ **Modular Architecture** — Domain-driven design with scalable structure
- 📊 **Database** — TypeORM + MySQL with auto-sync in development
- 🚀 **Production-Ready** — Global exception handling, serialization, and validation

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js ≥ 18 |
| **Framework** | NestJS 11 |
| **Language** | TypeScript 5.0 |
| **Database** | MySQL 8.0 + TypeORM |
| **Authentication** | JWT (jsonwebtoken) |
| **Media** | Cloudinary |
| **Email** | Nodemailer + EJS |
| **Validation** | class-validator, class-transformer |
| **API Docs** | Swagger/OpenAPI |
| **Testing** | Jest, Supertest |
| **Code Quality** | ESLint, Prettier |
| **Security** | Helmet, CORS, Rate Limiting |

---

## 📦 Prerequisites

- **Node.js** ≥ 18 (22 recommended)
- **MySQL** 8.0+
- **npm** or **yarn**
- **Cloudinary** account
- **SMTP Service** (Mailtrap recommended for development)

---

## 🚀 Installation & Startup

### Step 1: Clone & Install Dependencies
```bash
git clone <repository-url>
cd movieapp-nestjs-backend
npm install
```

### Step 2: Configure Environment Variables
```bash
cp env/.development.env.example env/.development.env
```

Edit `env/.development.env` with your credentials:

```env
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=movieapp_db

# JWT
JWT_SECRET=your_very_long_secure_secret_2025
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Mailer
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_user
MAIL_PASS=your_mailtrap_pass
NODEMAILER_FROM="MovieApp <no-reply@movieapp.com>"
```

### Step 3: Run Development Server
```bash
npm run start:dev
```

**Server**: `http://localhost:3001`

---

## 📜 Available Scripts

| Script | Purpose |
|--------|---------|
| `start:dev` | Development server with hot reload |
| `build` | Production build compilation |
| `start:prod` | Run production build |
| `lint` | Run ESLint analysis |
| `format` | Format code with Prettier |
| `test` | Run unit tests |
| `test:cov` | Generate test coverage report |
| `test:e2e` | Run E2E tests |

---

## 🏗️ Project Structure

```
movieapp-nestjs-backend/
├── dist/                          # Compiled output
├── env/
│   ├── .development.env           # Development variables
│   ├── .development.env.example   # Development template
│   ├── .production.env            # Production variables
│   └── .test.env                  # E2E testing variables
├── src/
│   ├── app.module.ts              # Root module
│   ├── main.ts                    # Entry point
│   ├── common/                    # Shared utilities
│   │   ├── filters/               # Exception filters
│   │   ├── middleware/            # Custom middleware
│   │   ├── interceptors/          # Interceptors
│   │   ├── decorators/            # Custom decorators
│   │   ├── guards/                # Auth guards
│   │   └── utils/                 # Helpers
│   ├── config/                    # Configuration
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── cloudinary.config.ts
│   │   └── mailer.config.ts
│   └── modules/                   # Feature modules
│       ├── auth/                  # Authentication
│       ├── user/                  # User management
│       ├── movie/                 # Movie catalog
│       ├── subscription/          # Subscriptions
│       ├── payment/               # Payments
│       └── upload/                # Media uploads
├── test/                          # E2E tests
│   ├── app.e2e-spec.ts
│   └── fixtures/                  # Test utilities
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

---

## 🔒 Rate Limiting

Global rate limiting via `@nestjs/throttler`:

| Endpoint | Limit/min | Purpose |
|----------|-----------|---------|
| General API | 10 | Default rate limit |
| Auth (login/register) | 5 | Prevent brute force |
| Movie browsing | 20 | Media operations |
| User profiles | 15 | Profile updates |

Use `@SkipThrottle()` decorator to bypass specific routes.

---

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Coverage Report
```bash
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e
```

Tests are colocated as `*.spec.ts` files. E2E tests use `.test.env` to prevent data pollution.

---

## 📖 API Documentation

Interactive Swagger UI available at:
```
http://localhost:3001/api/v1/swagger
```

Includes endpoint definitions, DTOs, request/response examples, and Bearer token authentication.

---

## 🔐 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Per-endpoint rate limiting
- ✅ Helmet security headers
- ✅ CORS protection (localhost, Vercel)
- ✅ Sensitive data exclusion via serialization
- ✅ Query error handling
- ✅ Cookie-based session management

---

## 🤝 Contributing

We welcome contributions! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** changes: `git commit -m 'Add your feature'`
4. **Write tests** for new features (unit + E2E where applicable)
5. **Run checks**:
    ```bash
    npm run lint && npm run test && npm run test:e2e
    ```
6. **Push** to your fork and submit a **Pull Request**

---

## 🗺️ Roadmap

- 🐳 Docker & docker-compose configuration
- 🔄 GitHub Actions CI/CD pipeline
- 🌱 Database seed scripts
- 📮 Postman API collection
- 🎨 Frontend integration guide (Angular/React)
- 📱 Mobile app support

---

## 📄 License

**UNLICENSED** (private project)

To open-source: Add a LICENSE file (MIT, Apache 2.0, or GPL) and update this section.

---

## 👨‍💻 Author

**Mina Maher**

For questions or support, feel free to reach out!

---

## 🔗 Related Resources

- Configure Cloudinary and SMTP before testing uploads/emails
- Use `.test.env` for E2E testing
- Refer to [NestJS Docs](https://docs.nestjs.com) for framework details
- Check [TypeORM Docs](https://typeorm.io) for database queries

