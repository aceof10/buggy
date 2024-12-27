# API Documentation

## Auth Routes

\*To be updated

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
