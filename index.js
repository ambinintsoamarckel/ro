const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const taskRoutes = require("./routes/taskRoutes");
const dependencyRoutes = require("./routes/dependencyRoutes");

const app = express();

// Activation de CORS
app.use(cors());

// Middleware pour parser le JSON
app.use(express.json());

// Définition des routes
app.use("/api", taskRoutes);
app.use("/api", dependencyRoutes);

// Synchronisation avec la base de données et démarrage du serveur
sequelize.sync().then(() => {
  console.log("Base de données synchronisée !");
  app.listen(3001, () => console.log("Serveur démarré sur http://localhost:3001"));
});
