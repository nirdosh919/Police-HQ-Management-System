import "dotenv/config";

import app from "./app";
import { connectDatabase } from "./config/db";
import { seedDefaultAdmin } from "./controllers/auth.controller";

const PORT = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    await seedDefaultAdmin();

    app.listen(PORT, "0.0.0.0", () => {
      console.log("");
      console.log("=================================");
      console.log(" POLICE HQ MANAGEMENT SYSTEM");
      console.log("=================================");
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log("=================================");
      console.log("");
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();



