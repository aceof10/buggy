import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";

let accessToken, refreshToken;

const signupResponse = async (email, password) => {
  return await request(app).post("/auth/signup").send({ email, password });
};

const loginResponse = async (email, password) => {
  const res = await request(app).post("/auth/login").send({ email, password });

  accessToken = res.body.accessToken;
  refreshToken = res.headers["set-cookie"]?.[0].split("=")[1];

  return res;
};

describe("/auth routes tests", () => {
  describe("POST /auth/signup", () => {
    it("should create a new user and return 201", async () => {
      const res = await signupResponse("test@example.com", "Password123");

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("user").that.is.a("string");
      expect(res.body.email).to.equal("test@example.com");
    });

    it("should return 200 if email is already taken", async () => {
      await signupResponse("test@example.com", "Password123");

      const res = await signupResponse("test@example.com", "Password123");

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Email already taken." });
    });
  });

  describe("POST /auth/login", () => {
    it("should login an existing user and return an access token", async () => {
      const res = await loginResponse("test@example.com", "Password123");

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("accessToken");
      expect(res.headers["set-cookie"][0]).to.contain("refresh_token");
    });

    it("should return 400 for invalid credentials", async () => {
      const res = await loginResponse("test@example.com", "WrongPassword");

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({ message: "Invalid credentials." });
    });
  });

  describe("POST /auth/logout", () => {
    before(async () => {
      const res = await loginResponse("test@example.com", "Password123");
      if (res.status !== 200 || !res.body.accessToken) {
        throw new Error(
          "Failed to log in and retrieve access token for logout test."
        );
      }
      accessToken = res.body.accessToken;
    });

    it("should log out the user and clear the refresh token cookie", async () => {
      const res = await request(app)
        .post("/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Logged out successfully." });
      expect(res.headers["set-cookie"][0]).to.contain("refresh_token=;");
    });
  });

  describe("POST /auth/refresh-token", () => {
    before(async () => {
      const res = await loginResponse("test@example.com", "Password123");
      refreshToken = res.headers["set-cookie"]?.[0].split("=")[1]; // Extract refresh token for testing
    });

    it("should return a new access token if refresh token is valid", async () => {
      const res = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", `refresh_token=${refreshToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("accessToken");
    });

    it("should return 401 if refresh token is missing", async () => {
      const res = await request(app).post("/auth/refresh-token");

      expect(res.status).to.equal(401);
      expect(res.body).to.deep.equal({
        message: "No session found. Please log in to continue.",
      });
    });

    it("should return 401 if refresh token is invalid", async () => {
      const res = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", "refresh_token=invalidtoken");

      expect(res.status).to.equal(401);
      expect(res.body).to.deep.equal({
        message: "Invalid session. Please log in again.",
      });
    });
  });

  // should always come last as this will change the user password
  // or use newPassword: "NewPassword123" for tests that come after this
  describe("POST /auth/change-password", () => {
    let token;

    before(async () => {
      const res = await loginResponse("test@example.com", "Password123");
      token = res.body.accessToken;
    });

    it("should change the password of an authenticated user", async () => {
      const res = await request(app)
        .post("/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({ oldPassword: "Password123", newPassword: "NewPassword123" });

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({
        message: "Password changed successfully.",
      });
    });

    it("should return 400 for incorrect old password", async () => {
      const res = await request(app)
        .post("/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({ oldPassword: "WrongPassword", newPassword: "NewPassword123" });

      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({ message: "Incorrect old password." });
    });
  });
});
