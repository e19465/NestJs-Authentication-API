# NestJS Documentation

---

- NestJS is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- It leverages TypeScript and is heavily inspired by Angular's architecture (modules, services, controllers, decorators).

- 🔧 INSTALLATION

---

- To install the Nest CLI globally:

```bash
npm install -g @nestjs/cli
```

- 🏗️ PROJECT INITIALIZATION

---

- To create a new NestJS project:

```bash
nest new my-app
```

- 📁 PROJECT STRUCTURE

---

- `main.ts` — App entry point
- `app.module.ts` — Root module
- `app.controller.ts` — Handles HTTP requests
- `app.service.ts` — Business logic

- ⚙️ JWT AUTHENTICATION SETUP

---

- For implementing JWT-based authentication, install the following packages:

```bash
npm install @nestjs/passport @nestjs/jwt passport passport-jwt passport-local
npm install --save-dev @types/passport-jwt @types/passport-local
```

- 🔹 Package Roles:

  - `@nestjs/passport`: Integrates Passport with NestJS.
  - `@nestjs/jwt`: JWT utilities (sign, verify, etc.)
  - `passport`: Core Passport.js library.
  - `passport-jwt`: JWT strategy for Passport.
  - `passport-local`: Username/password strategy for local auth.
  - `@types/passport-jwt`, `@types/passport-local`: TypeScript typings.

- ✅ Commands Summary:

---

- Generate components:

```bash
nest g module auth
nest g service auth
nest g controller auth
```

- Run the app:

```bash
npm run start:dev
```

- Build app:

```bash
npm run build
```

- Run tests:

```bash
npm run test
```

- 🧰 COMMON NEST CLI COMMANDS

---

```bash
nest g module <name>
nest g controller <name>
nest g service <name>
nest g provider <name>
```

- 🧠 USEFUL RESOURCES
- ***
- Docs: https://docs.nestjs.com
- Passport Integration: https://docs.nestjs.com/security/authentication
- JWT Guide: https://docs.nestjs.com/security/authentication#jwt-functionality
- Testing: https://docs.nestjs.com/fundamentals/testing
