import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";
import db from "../src/models/index.js";
import {
  FORBIDDEN,
  INVALID_ROLE,
  USER_NOT_FOUND,
} from "../src/constants/constants.js";

describe("/user routes tests", () => {
  let adminAccessToken;
  let adminId;
  let user1AccessToken;
  let user2Id;
  let developerId;

  before(async () => {
    /**
     * Sign up an admin user
     * for now system will default role to "user"
     */
    const adminSignupRes = await request(app).post("/auth/signup").send({
      email: "admin@test.com",
      password: "adminpassword",
    });

    // expect then set adminId
    expect(adminSignupRes.status).to.equal(201);
    adminId = adminSignupRes.body.user;

    // manually update user admin@test.com's role to "admin"
    await db.User.update({ role: "admin" }, { where: { id: adminId } });

    /**
     * log in the admin to get their accessToken
     */
    const adminLoginRes = await request(app).post("/auth/login").send({
      email: "admin@test.com",
      password: "adminpassword",
    });

    // expect then set adminAccessToken
    expect(adminLoginRes.status).to.equal(200);
    adminAccessToken = adminLoginRes.body.accessToken;

    /**
     * signup two regular users (user1 and user2)
     * user role defaults to "user"
     */
    const user1SignupRes = await request(app).post("/auth/signup").send({
      email: "user1@test.com",
      password: "user1password",
    });
    expect(user1SignupRes.status).to.equal(201);

    // sign up user 2 (will be deleted later)
    const user2SignupRes = await request(app).post("/auth/signup").send({
      email: "user2@test.com",
      password: "user2password",
    });
    expect(user2SignupRes.status).to.equal(201);
    user2Id = user2SignupRes.body.user;

    /**
     * log in user1 to get their accessToken
     */
    const user1LoginRes = await request(app).post("/auth/login").send({
      email: "user1@test.com",
      password: "user1password",
    });

    // expect then set user1AccessToken
    expect(user1LoginRes.status).to.equal(200);
    user1AccessToken = user1LoginRes.body.accessToken;

    /**
     * sign up a developer user
     * user role defaults to "user".
     */
    const developerSignupRes = await request(app).post("/auth/signup").send({
      email: "developer@test.com",
      password: "developerpassword",
    });

    // expect then set developerId
    expect(developerSignupRes.status).to.equal(201);
    developerId = developerSignupRes.body.user;
  });

  /**
   * Tests for GET /users
   * Admin should be able to get a paginated list of users
   */
  describe("GET /users", () => {
    it("should allow an admin to get a paginated list of users", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.total).to.be.greaterThan(0);
      expect(res.body.users).to.be.an("array");
    });

    it("should NOT allow a regular user to get a list of users ", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${user1AccessToken}`);

      expect(res.status).to.equal(403);
      expect(res.body.message).to.equal(FORBIDDEN);
    });
  });

  /**
   * Tests for GET /users/:id
   * Any authenticated user should be able to view a user by id
   */
  describe("GET /users/:id", () => {
    it("should allow anyone authenticated to get user details by id", async () => {
      const res = await request(app)
        .get(`/users/${developerId}`)
        .set("Authorization", `Bearer ${user1AccessToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.email).to.equal("developer@test.com");
      expect(res.body.role).to.equal("user");
    });

    it("should return 404 if user not found", async () => {
      const res = await request(app)
        .get("/users/9999")
        .set("Authorization", `Bearer ${user1AccessToken}`);

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal(USER_NOT_FOUND);
    });
  });

  /**
   * Tests for PATCH /users/:id/role
   * Only admins can change a user's role
   */
  describe("PATCH /users/:id/role", () => {
    it("should allow an admin to change a user's role", async () => {
      const res = await request(app)
        .patch(`/users/${developerId}/role`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send({ role: "developer" });

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Role updated successfully.");
    });

    it("should NOT allow a regular user to change another user's role", async () => {
      const res = await request(app)
        .patch(`/users/${adminId}/role`)
        .set("Authorization", `Bearer ${user1AccessToken}`)
        .send({ role: "admin" });

      expect(res.status).to.equal(403);
      expect(res.body.message).to.equal(FORBIDDEN);
    });

    it("should return 400 for an invalid role", async () => {
      const res = await request(app)
        .patch(`/users/${developerId}/role`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send({ role: "invalidRole" });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal(INVALID_ROLE);
    });
  });

  /**
   * Tests for GET /users/:id/projects
   * Only admins can fetch projects assigned to a user
   */
  describe("GET /users/:id/projects", () => {
    it("should allow an admin to get projects assigned to a user", async () => {
      const res = await request(app)
        .get(`/users/${developerId}/projects`)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
    });

    it("should NOT allow a regular user to fetch projects assigned to another user", async () => {
      const res = await request(app)
        .get(`/users/${adminId}/projects`)
        .set("Authorization", `Bearer ${user1AccessToken}`);

      expect(res.status).to.equal(403);
      expect(res.body.message).to.equal(FORBIDDEN);
    });
  });

  /**
   * Tests for GET /users/:id/bugs
   * Only admins can fetch bugs assigned to a user
   */
  describe("GET /users/:id/bugs", () => {
    it("should allow an admin to get bugs assigned to a user", async () => {
      const res = await request(app)
        .get(`/users/${developerId}/bugs`)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
    });

    it("should NOT allow a regular user to fetch bugs assigned to another user", async () => {
      const res = await request(app)
        .get(`/users/${adminId}/bugs`)
        .set("Authorization", `Bearer ${user1AccessToken}`);

      expect(res.status).to.equal(403);
      expect(res.body.message).to.equal(FORBIDDEN);
    });
  });

  /**
   * Tests for DELETE /users/:id
   * Only admins can delete a user
   */
  describe("DELETE /users/:id", () => {
    it("should allow an admin to delete a user", async () => {
      const res = await request(app)
        .delete(`/users/${user2Id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(res.status).to.equal(204);
    });

    it("should NOT allow a regular user to delete another user", async () => {
      const res = await request(app)
        .delete(`/users/${adminId}`)
        .set("Authorization", `Bearer ${user1AccessToken}`);

      expect(res.status).to.equal(403);
      expect(res.body.message).to.equal(FORBIDDEN);
    });

    it("should return 404 if user not found", async () => {
      const res = await request(app)
        .delete("/users/9999")
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal(USER_NOT_FOUND);
    });
  });
});
