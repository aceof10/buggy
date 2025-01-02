import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import db from "../src/models/index.js";

describe("/project routes tests", () => {
  let adminAccessToken;
  let projectId;
  let admin2Id;

  before(async () => {
    const adminSignupRes = await request(app).post("/auth/signup").send({
      email: "admin2@test.com",
      password: "adminpassword",
    });
    expect(adminSignupRes.status).to.equal(201);
    admin2Id = adminSignupRes.body.user;

    // manually update admin2@test.com's role to "admin"
    await db.User.update({ role: "admin" }, { where: { id: admin2Id } });

    const adminLoginRes = await request(app).post("/auth/login").send({
      email: "admin2@test.com",
      password: "adminpassword",
    });

    // expect then set adminAccessToken
    expect(adminLoginRes.status).to.equal(200);
    adminAccessToken = adminLoginRes.body.accessToken;
  });

  it("should create a new project", async () => {
    const projectData = {
      name: "New Project",
      description: "Project Description",
    };

    const response = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${adminAccessToken}`)
      .send(projectData);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property("id").that.is.a("number");
    expect(response.body.name).to.equal(projectData.name);

    projectId = response.body.id; // Save projectId for further tests
  });

  it("should return all projects", async () => {
    const response = await request(app)
      .get("/projects")
      .set("Authorization", `Bearer ${adminAccessToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("array");
  });

  it("should get a specific project by ID", async () => {
    const response = await request(app)
      .get(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${adminAccessToken}`);

    expect(response.status).to.equal(200);
    expect(response.body.id).to.equal(projectId);
  });

  it("should update a project", async () => {
    const updatedData = {
      name: "Updated Project",
      description: "Updated Description",
      status: "active",
    };

    const response = await request(app)
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${adminAccessToken}`)
      .send(updatedData);

    expect(response.status).to.equal(200);
    expect(response.body.name).to.equal(updatedData.name);
  });

  it("should delete a project", async () => {
    const response = await request(app)
      .delete(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${adminAccessToken}`);

    expect(response.status).to.equal(204);
  });
});
