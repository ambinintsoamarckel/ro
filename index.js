const express = require("express");
const cors = require("cors");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = require("./config/database");
const taskRoutes = require("./routes/taskRoutes");
const AuthRoute = require("./config/passport");
const passport = require("passport");
const dependencyRoutes = require("./routes/dependencyRoutes");

const generateSecret = () => {
  return process.env.SESSION_SECRET || "Mon-secret-qui-tue";
};

const secret = generateSecret();
const sessionStore = new SequelizeStore({ db: sequelize }); // Ajout de sessionStore

const app = express();
const sessionConfig = {
  secret: secret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore, // Correction ici
  cookie: {
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24, // 1 jour
    sameSite: "None",
  },
};

// Activation de CORS
app.use(cors());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

sessionStore.sync(); // Synchronisation de la session avec la base de données

// Middleware pour parser le JSON
app.use(express.json());

// Définition des routes
app.use("/api", taskRoutes);
app.use("/api", dependencyRoutes);
app.use("/", AuthRoute);

// Synchronisation avec la base de données et démarrage du serveur
sequelize.sync().then(() => {
  console.log("Base de données synchronisée !");
  app.listen(3001, () =>
    console.log("Serveur démarré sur http://localhost:3001")
  );
});
