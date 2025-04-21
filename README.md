# Auth Module With Logging and Swagger Documentation

A simple and secure authentication system built with NestJS, featuring JWT-based authentication, session management, and structured logging.

## Features

- **User Registration & Login**: Secure user authentication with hashed passwords.
- **JWT Authentication**: Access and refresh tokens with configurable expiration.
- **Session Management**: Store and manage user sessions in MongoDB.
- **Structured Logging**: Utilize Pino for structured and level-based logging.
- **API Documentation**: Comprehensive API docs available via Swagger.

---

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT, Passport
- **Logging**: Pino
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger (via @nestjs/swagger)

---

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/elmotasembelah/nestjs-auth-module.git
   cd easygenerator-auth-task
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   Create a `.env` file in the root directory and populate it based on the `.env.example`:

   ```env
   MONGODB_URI=your_mongodb_connection_string

   JWT_ACCESS_SECRET=your_jwt_access_secret
   JWT_ACCESS_EXPIRES_IN=3600s

   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   JWT_REFRESH_EXPIRES_IN=7d
   ```

4. **Run the application**:

   ```bash
   npm run start:dev
   ```

   The API will be accessible at `http://localhost:3000`.

---

## API Documentation

Swagger UI is available at: [http://localhost:3000/docs](http://localhost:3000/docs)

This provides a comprehensive overview of all available endpoints, request/response schemas, and authentication methods.

---

## Authentication

The application supports **two methods** of passing authentication tokens:

### Cookie-Based Authentication (Recommended for Production)

- Tokens are automatically set as HTTP-only cookies upon login.
- No need to manually send tokens in headers.
- Used by the frontend application by default with `withCredentials: true`.

### Header-Based Authentication (Useful for Testing/Dev)

- Tokens can be manually included in API requests for tools like **Postman**, **Thunder Client**, or **Swagger UI**.

Example:

```http
Authorization: Bearer <access_token>
x-refresh-token: <refresh_token>
```

> In production, the app will **first look for tokens in cookies**. If not found, it will fall back to **Authorization headers** (useful for testing APIs manually).

---

## Logs

Structured logs are written to the `logs/` directory at the project root:

- `logs/combined.log`: General logs.
- `logs/error.log`: Error-specific logs.

---

## API Endpoints

### Auth Routes

- `POST /api/v1/auth/register`: Register a new user.
- `POST /api/v1/auth/sign-in`: Authenticate user and receive tokens.
- `POST /api/v1/auth/sign-out`: Invalidate the current session.
- `POST /api/v1/auth/sign-out-all`: Invalidate all sessions for the user.

### User Routes

- `GET /api/v1/users/me`: Retrieve current authenticated user's information.

---

## Security Considerations

- **Password Hashing**: Passwords are securely hashed using bcrypt before being stored in the database.
- **JWT Secrets**: Ensure that `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are strong, random strings and are never exposed publicly.
- **Environment Variables**: All sensitive configuration values (e.g., secrets, database URI) are managed via environment variables and not hardcoded in the codebase.
- **Session Management**: Refresh tokens are stored in the database with secure hashing, allowing for session invalidation and multi-device support.
- **Validation & Sanitization**: User inputs are validated using `class-validator`, ensuring type safety and protection from common injection attacks.

---

## Logging

The application uses **Pino** for structured and performant logging. Logs are automatically written to files in the `logs/` directory at the project root.

### Log Files

- `logs/combined.log`: Contains all log levels (info, warning, debug, etc.)
- `logs/error.log`: Contains only error-level logs
