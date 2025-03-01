const express = require('express');
const sequelize = require('./config/database');
const taskRoutes = require('./routes/taskRoutes');
const dependencyRoutes = require('./routes/dependencyRoutes');

const app = express();
app.use(express.json());

app.use('/api', taskRoutes);
app.use('/api', dependencyRoutes);

sequelize.sync().then(() => {
  console.log("Base de données synchronisée !");
  app.listen(3000, () => console.log("Serveur démarré sur http://localhost:3000"));
});
