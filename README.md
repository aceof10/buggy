# Bug Tracker API

Buggy is a RESTful API for managing projects and bugs. It allows for role-based access control, ensuring secure and efficient management of data.

## Features

- User authentication and role management.
- Project and bug tracking functionalities.
- Role-based access control for secure data handling.
- Test backups to aid debugging and development.

## Setup and Installation

### 1. Clone the repository:

```bash
git clone https://github.com/aceof10/buggy.git
```

```bash
cd buggy
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Set up the environment variables in a `.env` file:

- Inside the `buggy` project directory, create a file named `.env`
- copy and paste below values into the file, replacing `<username>` and `<password>` with your database credentials.
- `NOTE:` make sure your database username has `CREATE` permission.
- replace `<jwt_secret>` with your jwt secret or leave it as is for demo purposes
  ```
  NODE_ENV=development
  DB_HOST=localhost
  DB_USER=<username>
  DB_PASSWORD=<password>
  DB_NAME=buggy
  JWT_SECRET=<jwt_secret>
  ```

### 4. Database Setup:

#### Create the Database

Before running the application, ensure the database is created. You can create the database using a database client (e.g., MySQL Workbench, pgAdmin, etc.) or via the command line.

**Example (MySQL and PostgreSQL):**

```sql
CREATE DATABASE buggy;
```

#### Assign Necessary Permissions

Ensure the user specified in the .env file (`DB_USER`) has the necessary permissions on the buggy database, including CREATE, SELECT, INSERT, UPDATE, and DELETE.

**Example (MySQL):**

```sql
GRANT ALL PRIVILEGES ON buggy.* TO '<username>'@'localhost';
FLUSH PRIVILEGES;
```

**Example (PostgreSQL):**

```sql
GRANT ALL PRIVILEGES ON DATABASE buggy TO <username>;
```

#### Verify Connectivity

Test the database connection to ensure the credentials and permissions are set correctly.

### 5. Start the application:

```bash
npm run dev
```

## Testing

To run the test suite, use:

```bash
npm test
```

### Viewing the Test Database

The test database generated during testing is an SQLite file stored in the `./tests/data/database/` directory.

The filename is dynamically generated with a timestamp to avoid conflicts (e.g., test_database_2025-01-08.sqlite).

**To view the test database contents:**

#### 1. Locate the Database File:

- Navigate to the `./tests/data/database/` directory in your project folder.

#### 2. Use an SQLite Viewer:

- Drag and drop the database file onto an online SQLite viewer like [SQLite Viewer by Inloop](https://inloop.github.io/sqlite-viewer/).
- Alternatively, use a local SQLite client such as:
  - DB Browser for SQLite.
  - SQLite command-line tools.

#### 3. Explore the Database:

- Use the viewer to inspect tables, view data, or run queries.

Ensure you run your tests first to populate the database with data.

## API Documentation

For detailed API documentation, refer to [API Documentation](API_DOCUMENTATION.md).
