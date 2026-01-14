import dataSource from "../typeorm/typeorm-config";

async function runMigrations() {
  try {
    await dataSource.initialize();
    console.log("Running migrations...");
    await dataSource.runMigrations();
    console.log("Migrations completed successfully");
    await dataSource.destroy();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
