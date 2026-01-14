import dataSource from "../typeorm/typeorm-config";

async function runUndoMigrations() {
  try {
    await dataSource.initialize();
    console.log("Running Undo Last Migration...");
    await dataSource.undoLastMigration();
    console.log("Migrations undo last successfully");
    await dataSource.destroy();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runUndoMigrations();
