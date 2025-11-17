# MovieApp — NestJS Backend (v0.0.1)

A production-ready backend for MovieApp, a movie streaming and subscription platform built with NestJS 11 and TypeScript.

## Overview

This backend provides a complete, modular implementation featuring authentication, media uploads, subscription and payment flows, role-based access control, rate limiting, email notifications, OpenAPI documentation, and comprehensive test coverage.

## Key Features

- **Framework**: NestJS 11 + TypeScript with modular, domain-driven architecture
- **Database**: TypeORM + MySQL with auto-sync in development
- **Authentication**: JWT (access and refresh tokens) with role-based guards
- **Media Management**: Cloudinary integration for uploads
- **Email**: Nodemailer with EJS templating for transactional messages
- **API Protection**: Per-endpoint rate limiting via @nestjs/throttler
- **Documentation**: Swagger/OpenAPI at `/api/v1/swagger`
- **Validation & Serialization**: Global exception handling and serialization
- **Security**: Helmet, CORS, cookie-parser middleware
- **Testing**: Jest (unit) and Supertest (E2E)

## Prerequisites

- Node.js ≥ 18 (22 recommended)
- MySQL 8.0+
- Cloudinary account
- SMTP service (Mailtrap recommended for development)

## Project Structure
```
movieapp-nestjs-backend/
├── dist/                          # Compiled output
├── env/
│   ├── .development.env           # Development environment variables
│   ├── .development.env.example   # Development template
│   ├── .production.env            # Production environment variables
│   └── .test.env                  # E2E testing environment
├── src/
│   ├── app.module.ts              # Root application module
│   ├── main.ts                    # Application entry point
│   ├── common/                    # Shared utilities
│   │   ├── filters/               # Exception filters
│   │   │   └── query-exception.filter.ts
│   │   ├── middleware/            # Custom middleware
│   │   │   └── logger.middleware.ts
│   │   ├── interceptors/          # Response/request interceptors
│   │   │   └── serializer.interceptor.ts
│   │   ├── decorators/            # Custom decorators
│   │   │   └── auth.decorator.ts
│   │   ├── guards/                # Authentication & authorization
│   │   │   ├── jwt.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── utils/                 # Helper functions
│   │       └── helpers.ts
│   ├── config/                    # Configuration modules
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── cloudinary.config.ts
│   │   └── mailer.config.ts
│   └── modules/                   # Feature modules (domain-driven)
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── dto/
│       │   │   ├── login.dto.ts
│       │   │   └── register.dto.ts
│       │   └── entities/
│       │       └── auth.entity.ts
│       ├── user/
│       │   ├── user.module.ts
│       │   ├── user.controller.ts
│       │   ├── user.service.ts
│       │   ├── dto/
│       │   │   └── update-user.dto.ts
│       │   └── entities/
│       │       └── user.entity.ts
│       ├── movie/
│       │   ├── movie.module.ts
│       │   ├── movie.controller.ts
│       │   ├── movie.service.ts
│       │   ├── dto/
│       │   │   └── create-movie.dto.ts
│       │   └── entities/
│       │       └── movie.entity.ts
│       ├── subscription/
│       │   ├── subscription.module.ts
│       │   ├── subscription.controller.ts
│       │   ├── subscription.service.ts
│       │   ├── dto/
│       │   │   └── create-subscription.dto.ts
│       │   └── entities/
│       │       └── subscription.entity.ts
│       ├── payment/
│       │   ├── payment.module.ts
│       │   ├── payment.controller.ts
│       │   ├── payment.service.ts
│       │   ├── dto/
│       │   │   └── create-payment.dto.ts
│       │   └── entities/
│       │       └── payment.entity.ts
│       └── upload/
│           ├── upload.module.ts
│           ├── upload.controller.ts
│           ├── upload.service.ts
│           ├── dto/
│           │   └── upload.dto.ts
│           └── entities/
│               └── upload.entity.ts
├── test/                          # E2E test suite
│   ├── app.e2e-spec.ts
│   └── fixtures/                  # Test data & utilities
├── .gitignore
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```
## Environment Configuration

Create `env/.development.env` from the example:

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

## Installation & Startup

```bash
# Install dependencies
npm install

# Configure environment
cp env/.development.env.example env/.development.env
# Edit env/.development.env with your credentials

# Development (with hot reload)
npm run start:dev

# Production build and start
npm run build
npm run start:prod
```

**Server**: `http://localhost:3001` (adjust port as configured)

## Available Scripts

| Script | Purpose |
|--------|---------|
| `start:dev` | Development server with hot reload |
| `build` | Production build |
| `start:prod` | Run production build |
| `lint` | Run ESLint |
| `format` | Format code with Prettier |
| `test` | Run unit tests |
| `test:cov` | Generate coverage report |
| `test:e2e` | Run E2E tests |

## Testing

- **Unit Tests**: Colocated as `*.spec.ts` files. Run: `npm run test`
- **Coverage**: `npm run test:cov`
- **E2E Tests**: Located in `/test` directory using Supertest and `.test.env`. Run: `npm run test:e2e`

## Rate Limiting

Global rate limiting enforced via `@nestjs/throttler`:

| Area | Limit/min | Use Case |
|------|-----------|----------|
| default | 10 | General API |
| auth | 5 | Login / registration |
| movie | 20 | Movie browsing |
| user | 15 | Profile operations |

Use `@SkipThrottle()` decorator to exempt specific routes.

## Security

- Rate limiting with configurable thresholds
- Sensitive data exclusion via `ClassSerializerInterceptor`
- Query error handling via `QueryExceptionFilter`
- Selective request logging
- CORS with restricted origins (localhost, Vercel)
- Security headers via Helmet
- Cookie parsing and management

## Development Guidelines

- Keep controllers focused on routing and responses
- Place business logic in services
- Validate inputs using DTOs and `class-validator`
- Add features as modules in `src/modules/`
- Share utilities in `src/common/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests (unit and E2E where applicable)
4. Run: `npm run lint && npm run test && npm run test:e2e`
5. Submit a pull request with a clear description

## API Documentation

Swagger UI is available at: `http://localhost:3001/api/v1/swagger`

Includes endpoint definitions, DTOs, request/response examples, and Bearer token authentication.

## License

UNLICENSED (private project). To open-source, add a LICENSE file (MIT, Apache 2.0, or GPL) and update this section.

## Additional Resources

- Configure Cloudinary and SMTP credentials before testing uploads and email features
- Use `.test.env` for E2E testing to prevent data pollution
- For Docker, CI/CD, seed scripts, or Postman collections, see planned enhancements below

## Roadmap

- Docker + docker-compose configuration
- GitHub Actions CI/CD pipeline
- Database seed scripts for genres and movies
- Postman collection
- Frontend integration guide (Angular/React)
