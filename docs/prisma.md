/\*\*

- Prisma Documentation
- ***
- Prisma is a modern ORM (Object-Relational Mapping) tool for Node.js and TypeScript.
- It provides a type-safe and intuitive API for interacting with your database.
-
- 📦 INSTALLATION
- ***
- To install Prisma CLI and Client, run:
-
- ```bash

  ```
- npm install prisma --save-dev
- npm install @prisma/client
- ```

  ```
-
- This installs:
- - `prisma` CLI (dev dependency) for schema, migrations, and tooling.
- - `@prisma/client` for querying your database in your application code.
-
- To initialize Prisma in your project:
-
- ```bash

  ```
- npx prisma init
- ```

  ```
-
- This creates a `prisma/` directory with:
- - `schema.prisma` — The main schema definition file.
- - `.env` — For your database connection string and other environment variables.
-
- 🛠️ DATABASE MIGRATIONS
- ***
- After updating your `schema.prisma` file, create and apply a new migration:
-
- ```bash

  ```
- npx prisma migrate dev --name <migration_name>
- ```

  ```
-
- This command:
- - Creates a new migration under `prisma/migrations/`
- - Applies the migration to your development database
- - Regenerates the Prisma Client automatically
-
- To apply all pending migrations in a production environment:
-
- ```bash

  ```
- npx prisma migrate deploy
- ```

  ```
-
- ⚙️ GENERATING PRISMA CLIENT
- ***
- After modifying your Prisma schema or updating dependencies, regenerate the client:
-
- ```bash

  ```
- npx prisma generate
- ```

  ```
-
- This updates the auto-generated Prisma Client in:
- `node_modules/@prisma/client`
-
- 📊 PRISMA STUDIO (GUI)
- ***
- To explore and manage your database visually, use Prisma Studio:
-
- ```bash

  ```
- npx prisma studio
- ```

  ```
-
- This opens a web-based GUI where you can view, edit, and search your data easily.
-
- 🔧 OTHER USEFUL COMMANDS
- ***
- - `npx prisma db push`
- Pushes schema changes directly to the database **without** generating a migration (useful for prototyping).
-
- - `npx prisma migrate reset`
- Resets the database and re-applies all migrations from scratch (useful in development).
-
- 🧠 RESOURCES
- ***
- Official documentation: https://www.prisma.io/docs
- GitHub repository: https://github.com/prisma/prisma
  \*/
