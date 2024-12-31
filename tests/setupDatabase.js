import db from "../src/models/index.js";

before(async () => {
  console.log("Synchronizing database schema...");
  await db.sequelize.sync({ force: true });
  console.log("Database schema synchronized.");
  console.log("Note: The test database is stored in './tests/data/database/'");
});

after(async () => {
  console.log("Closing database connection...");
  await db.sequelize.close();
  console.log("Database connection closed.");
});
