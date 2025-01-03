import request from "supertest";
import app from "../src/app.js";
import db from "../src/models/index.js";
import { expect } from "chai";

describe("/bugs routes tests", () => {
  let adminAccessToken;
  let projectId;
  let admin3Id;
  let bugId;

  before(async () => {
    const adminSignupRes = await request(app).post("/auth/signup").send({
      email: "admin3@test.com",
      password: "adminpassword",
    });
    expect(adminSignupRes.status).to.equal(201);
    admin3Id = adminSignupRes.body.user;

    // manually update admin3@test.com's role to "admin"
    await db.User.update({ role: "admin" }, { where: { id: admin3Id } });

    const adminLoginRes = await request(app).post("/auth/login").send({
      email: "admin3@test.com",
      password: "adminpassword",
    });

    expect(adminLoginRes.status).to.equal(200);
    adminAccessToken = adminLoginRes.body.accessToken;

    const projectData = {
      name: "Bug Project",
      description: "A project with bugs",
    };
    const response = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${adminAccessToken}`)
      .send(projectData);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property("id").that.is.a("number");
    expect(response.body.name).to.equal(projectData.name);

    projectId = response.body.id;
  });

  it("should create a new bug", async () => {
    const bugData = {
      title: "Bug Title",
      description: "Bug Description",
      priority: "high",
      projectId,
    };

    const response = await request(app)
      .post("/bugs")
      .set("Authorization", `Bearer ${adminAccessToken}`)
      .send(bugData);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property("id").that.is.a("number");
    expect(response.body.title).to.equal(bugData.title);

    bugId = response.body.id; // Save bugId for further tests
  });

  it("should return all bugs", async () => {
    const response = await request(app)
      .get("/bugs")
      .set("Authorization", `Bearer ${adminAccessToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("array");
  });

  it("should get a specific bug by ID", async () => {
    const response = await request(app)
      .get(`/bugs/${bugId}`)
      .set("Authorization", `Bearer ${adminAccessToken}`);

    expect(response.status).to.equal(200);
    expect(response.body.id).to.equal(bugId);
  });

  it("should update a bug", async () => {
    const updatedData = {
      title: "Updated Bug Title",
      description: "Updated Bug Description",
      status: "resolved",
      priority: "low",
      projectId,
    };

    const response = await request(app)
      .put(`/bugs/${bugId}`)
      .set("Authorization", `Bearer ${adminAccessToken}`)
      .send(updatedData);

    expect(response.status).to.equal(200);
    expect(response.body.title).to.equal(updatedData.title);
  });

  it("should delete a bug", async () => {
    const response = await request(app)
      .delete(`/bugs/${bugId}`)
      .set("Authorization", `Bearer ${adminAccessToken}`);

    expect(response.status).to.equal(204);
  });
});
