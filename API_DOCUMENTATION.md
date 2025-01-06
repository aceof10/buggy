# API Documentation

## Prerequites

1. Successful setup outlined in README.
2. To use the provided cURL commands effectively, ensure that `jq` is installed on your system. Follow the instructions below based on your operating system:

- **Debian/Ubuntu:**  
  `sudo apt install jq`

- **Fedora/RHEL/CentOS:**  
  `sudo dnf install jq `

- **Arch Linux:**  
  `sudo pacman -S jq`

- **macOS**

  - **Using Homebrew:** `brew install jq`

- **Windows**
  - **Using Chocolatey:** `choco install jq`
  - **Using Scoop:** `scoop install jq`

---

## Auth Routes

### 1. POST /auth/signup

**Description:** Registers a new user.

**Access:** Public.

**Response:**

- **201 Created:** User registered successfully.
- **500 : Internal Server Error**

#### cURL Command:

```bash
curl -X POST "http://localhost:3000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq
```

---

### 2. POST /auth/login

**Description:** Logs in a user and returns a JWT access token.

**Access:** Public.

**Response:**

- **200 OK:** Login successful.
- **401 Unauthorized:** Invalid email or password.

#### cURL Command:

```bash
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' --cookie-jar cookies.txt | jq
```

Or login as an admin (created by default on app first-time startup) to perform admin-only actions.
```bash
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@buggy.com",
    "password": "admin"
  }' --cookie-jar cookies.txt | jq
```

- Saves cookie in cookies.txt file.
- Copy the returned accessToken and save in environment variable `ACCESS_TOKEN`:

```bash
export ACCESS_TOKEN=<copied_access_token>
```

---

### 3. POST /auth/refresh-token

**Description:** Generates a new access token using a refresh token.

**Access:** Authenticated.

**Response:**

- **200 OK:** Access token refreshed successfully.
- **401 Unauthorized:** Invalid or expired refresh token.

#### cURL Command:

```bash
curl -X POST "http://localhost:3000/auth/refresh-token" \
  -H "Content-Type: application/json" \
  --cookie cookies.txt | jq
```

- Copy the returned accessToken and save in environment variable `ACCESS_TOKEN`:

```bash
export ACCESS_TOKEN=<copied_access_token>
```

---

### 4. POST /auth/logout

**Description:** Logs out a user by invalidating the refresh token.

**Access:** Authenticated.

**Response:**

- **200 OK:** Logout successful.

#### cURL Command:

```bash
curl -X POST "http://localhost:3000/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Host: localhost:3000" | jq
```

---

## User Routes

### 1. GET /users

**Description:** Retrieves a paginated list of users.

**Access:** Admins only.

**Response:**

- **200 OK:** Returns a paginated list of users.
- **403 Forbidden:** Returned when a non-admin tries to access the route.

#### cURL Command:

```bash
curl -X GET "http://localhost:3000/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Host: localhost:3000" | jq
```

---

### 2. GET /users/:id

**Description:** Retrieves details of a user by ID.

**Access:** Any authenticated user.

**Response:**

- **200 OK:** Returns the user details.
- **404 Not Found:** If the user is not found.

#### cURL Command:

```bash
curl -X GET "http://localhost:3000/users/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Host: localhost:3000" | jq
```

---

### 3. PATCH /users/:id/role

**Description:** Changes the role of a user.

**Access:** Admins only.

**Response:**

- **200 OK:** Role updated successfully.
- **403 Forbidden:** Returned when a non-admin tries to change a user’s role.
- **400 Bad Request:** If an invalid role is provided.
- **304 Not Modified:** If the user is already assigned the role.

#### cURL Command:

replace `<newRole>` with the new role to be assigned

```bash
curl -X PATCH "http://localhost:3000/users/$USER_ID/role" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Host: localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"role": "<newRole>"}' | jq
```

---

### 4. DELETE /users/:id

**Description:** Deletes a user by ID.

**Access:** Admins only.

**Response:**

- **200 OK:** User deleted successfully.
- **403 Forbidden:** Returned when a non-admin tries to delete a user.
- **404 Not Found:** If the user is not found.

#### cURL Command:

```bash
curl -X DELETE "http://localhost:3000/users/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Host: localhost:3000" | jq
```

---

### 5. GET /users/:id/projects

**Description:** Retrieves the list of projects assigned to a user.

**Access:** Admins only.

**Response:**

- **200 OK:** Returns a list of projects.
- **403 Forbidden:** Returned when a non-admin tries to access this route.

#### cURL Command:

```bash
curl -X GET "http://localhost:3000/users/$USER_ID/projects" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Host: localhost:3000" | jq
```

---

### 6. GET /users/:id/bugs

**Description:** Retrieves the list of bugs assigned to a user.

**Access:** Admins only.

**Response:**

- **200 OK:** Returns a list of bugs.
- **403 Forbidden:** Returned when a non-admin tries to access this route.

#### cURL Command:

```bash
curl -X GET "http://localhost:3000/users/$USER_ID/bugs" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Host: localhost:3000" | jq
```

---

## Project Routes

### 1. POST /projects

**Description:** Creates a new project.

**Access:** Admins only.

**Response:**

- **201 Created:** Project created successfully.
- **403 Forbidden:** If a non-admin attempts to create a project.

#### cURL Command:

```bash
curl -X POST "http://localhost:3000/projects" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
"name": "Project Name",
"description": "Project Description"
}' | jq
```

---

### 2. GET /projects

**Description:** Retrieves a list of all projects.

**Access:** Authenticated users.

**Response:**

- **200 OK:** Returns a list of projects.
- **401 Unauthorized:** If the user is not authenticated.

#### cURL Command:

```bash
curl -X GET "http://localhost:3000/projects" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Host: localhost:3000" | jq
```

---

### 3. GET /projects/:id

**Description:** Retrieves a project by ID.

**Access:** Authenticated users.

**Response:**

- **200 OK:** Returns the project details.
- **404 Not Found:** If the project is not found.

#### cURL Command:

```bash
curl -X GET "http://localhost:3000/projects/$PROJECT_ID" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Host: localhost:3000" | jq
```

---

### 4. POST /projects/:id/add-user

**Description** Assigns a user to a project.

**Access:** Admin only.

**Response:**

- **200 OK:** User assigned to the project successfully.
- **400 Bad Request:** If the `userId` is missing in the request body.
- **403 Forbidden:** If the user's role is not authorized to be assigned to projects.
- **404 Not Found:**

  - If the project does not exist.
  - If the user does not exist.

- **409 Conflict:** If the user is already assigned to the project.
- **500 Internal Server Error:** If an unexpected error occurs.

#### cURL Command:

```bash
curl -X POST "http://localhost:3000/projects/$PROJECT_ID/add-user" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Content-Type: application/json" \
 -H "Host: localhost:3000" \
 -d "{\"userId\": \"$USER_ID\"}" | jq
```

---

### 5. DELETE /projects/:id/remove-user

**Description** Removes a user from a project
**Description** Assigns a user to a project.

**Access:** Admin only.

**Response:**

- **200 OK:** User removed from the project successfully.
- **400 Bad Request:** If the userId is missing in the request body.
- **404 Not Found:**
  - If the project does not exist.
  - If the user does not exist.
  - If the user is not assigned to the project.
- **500 Internal Server Error:** If an unexpected error occurs.

```bash
curl -X DELETE "http://localhost:3000/projects/$PROJECT_ID/remove-user" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Content-Type: application/json" \
 -d "{ \"userId\": \"$USER_ID\" }" | jq
```

---

### 6. GET /projects/:id/users

**Description:** Retrieves a list of users assigned to a project.

**Access:** Admin

**Response:**

- **200 OK:** Returns a list of users.
- **401 Unauthorized:** If the user is not authenticated.

#### cURL Command:

```bash
curl -X GET "http://localhost:3000/projects/:id/users" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Host: localhost:3000" | jq
```

---

## Bug Routes

### 1. POST /bugs

**Description:** Creates a new bug.

**Access:** Authenticated users.

**Response:**

- **201 Created:** Bug created successfully.
- **400 Bad Request:** If required fields are missing.

#### cURL Command:

```bash
curl -X POST "http://localhost:3000/bugs" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
  "title": "Bug Title",
  "description": "Bug Description",
  "projectId": '$PROJECT_ID',
  "priority": "low"
}' | jq
```

---

### 2. GET /bugs

**Description:** Retrieves a list of all bugs.

**Access:** Authenticated users.

**Response:**

- **200 OK:** Returns a list of bugs.
- **401 Unauthorized:** If the user is not authenticated.

#### cURL Command:

```bash
curl -X GET "http://localhost:3000/bugs" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Host: localhost:3000" | jq
```

---

### 3. PUT /bugs/:id

**Description:** Updates a bug

**Access:** Authenticated users.

**Response:**

- **200 OK:** Bug updated successfully.
- **404 Not Found:** If the bug is not found.

#### cURL Command:

```bash
curl -X PUT "http://localhost:3000/bugs/$BUG_ID" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
  "title": "Bug Title",
  "description": "Bug Description",
  "status": "duplicate",
  "priority": "low",
  "projectId": '$PROJECT_ID'
 }' | jq
```

---

### 4. DELETE /bugs/:id

**Description:** Deletes a bug by ID.

**Access:** Admins only.

**Response:**

- **200 OK:** Bug deleted successfully.
- **403 Forbidden:** If a non-admin tries to delete a bug.

#### cURL Command:

```bash
curl -X DELETE "http://localhost:3000/bugs/$BUG_ID" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Host: localhost:3000" | jq
```

---

### 5. POST /bugs/:id/add-user

**Description** Assigns a user to a bug

**Response:**

- **200 OK:** User assigned to the bug successfully.
- **400 Bad Request:** If the `userId` is missing in the request body.
- **403 Forbidden:** If the user's role is not authorized to be assigned to bugs.
- **404 Not Found:**

  - If the bug does not exist.
  - If the user does not exist.

- **409 Conflict:** If the user is already assigned to the bug.
- **500 Internal Server Error:** If an unexpected error occurs.

#### cURL Command:

```bash
curl -X POST "http://localhost:3000/bugs/$BUG_ID/add-user" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Content-Type: application/json" \
 -H "Host: localhost:3000" \
 -d "{\"userId\": \"$USER_ID\"}" | jq
```

---

### 6. DELETE /bugs/:id/remove-user

**Description** Removes a user from a bug

**Access:** Admin only.

**Response:**

- **200 OK:** User removed from the bug successfully.
- **400 Bad Request:** If the userId is missing in the request body.
- **404 Not Found:**
  - If the bug does not exist.
  - If the user does not exist.
  - If the user is not assigned to the bug.
- **500 Internal Server Error:** If an unexpected error occurs.

```bash
curl -X DELETE "http://localhost:3000/bugs/$BUG_ID/remove-user" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Content-Type: application/json" \
 -d "{ \"userId\": \"$USER_ID\" }" | jq
```

---

### 7. GET /bugs/:id/users

**Description:** Retrieves a list of users assigned to a bug.

**Access:** Admin

**Response:**

- **200 OK:** Returns a list of users.
- **401 Unauthorized:** If the user is not authenticated.

#### cURL Command:

```bash
curl -X GET "http://localhost:3000/bugs/:id/users" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Host: localhost:3000" | jq
```

---
