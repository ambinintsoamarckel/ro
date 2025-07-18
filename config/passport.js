const express = require('express');
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const crypto = require('crypto');
const Utilisateur = require('../models/User');
const router = express.Router();



passport.use(new LocalStrategy(
  async function verify(username, password, cb) {
    try {
      const user = await Utilisateur.findOne({ where: { username: username } });
      
      if (!user) {
        return cb(null, false, { message: "Nom d'utilisateur incorrecte." });
      }
      
      crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
        if (err) { return cb(err); }
        if (!crypto.timingSafeEqual(Buffer.from(user.password, 'hex'), hashedPassword)) {
          return cb(null, false, { message: 'Mot de passe incorrecte.' });
        }
        return cb(null, user);
      });
    } catch (err) {
      return cb(err);
    }
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, {
    id: user.id,
    username: user.username

  });
});

passport.deserializeUser(async function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// Route pour le login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.status(401).json(info); }
    
    req.logIn(user, async (err) => {
      if (err) { return next(err); }
      
      // Mettre à jour la présence à "en ligne" après une connexion réussie
      res.status(200).json({ message: 'Login successful', user });
    });

  })(req, res, next);
});


// Route pour le logout
router.post('/logout', async (req, res) => {
  try {
    // Vérifier si l'utilisateur est authentifié
    console.log('notre user ici', req.user);
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Récupérer l'utilisateur via l'ID stocké dans la session
    const user = await Utilisateur.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Vous pouvez ajouter ici toute logique supplémentaire, comme la mise à jour du statut de l'utilisateur (ex. "inactif")
    // await user.setInactif().catch(error => res.status(500).json({ message: 'Presence update failed: ' + error }));

    // Log out de l'utilisateur en utilisant passport
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }

      res.status(200).json({ message: 'Logged out successfully' });
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Vérifie si l'utilisateur est connecté
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ user: req.user });
  } else {
    return res.status(401).json({ message: "Non authentifié" });
  }
});



// Route pour l'inscription
router.post("/signup", async (req, res, next) => {
  try {
    // Création du nouvel utilisateur
    const utilisateur = Utilisateur.build(req.body);
    utilisateur.setPassword(req.body.password);
    await utilisateur.save();

    // Connexion automatique après l'inscription
    req.logIn(utilisateur, (err) => {
      if (err) {
        return next(err); // Gestion des erreurs de connexion
      }

      // Sauvegarde de la session avant de répondre
      req.session.save(() => {
        res.status(201).json({ message: "Inscription réussie et connexion automatique", utilisateur });
      });
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// PATCH /auth/update-profile
router.patch('/update-profile', async (req, res) => {
  const { newUsername, password } = req.body;

  if (!req.user) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await Utilisateur.findByPk(req.user.id);

    // Vérification du mot de passe
    const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 310000, 32, 'sha256').toString('hex');
    if (hashedPassword !== user.password) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    user.username = newUsername;
    await user.save();
    return res.status(200).json({ message: "Profil mis à jour", user: { id: user.id, username: user.username } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
// PATCH /auth/reset-password
router.patch('/reset-password', async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.user) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await Utilisateur.findByPk(req.user.id);

    // Vérification
    const hashed = crypto.pbkdf2Sync(currentPassword, user.salt, 310000, 32, 'sha256').toString('hex');
    if (hashed !== user.password) return res.status(401).json({ message: "Mot de passe actuel incorrect" });

    user.setPassword(newPassword);
    await user.save();

    // Réauthentification (session mise à jour sans afficher un "logout")
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({ message: "Mot de passe mis à jour" });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
// DELETE /auth/delete-account
router.delete('/delete-account', async (req, res) => {
  const { password } = req.body;

  if (!req.user) return res.status(401).json({ message: "Non authentifié" });

  try {
    const user = await Utilisateur.findByPk(req.user.id);

    const hashed = crypto.pbkdf2Sync(password, user.salt, 310000, 32, 'sha256').toString('hex');
    if (hashed !== user.password) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    await user.destroy();
    req.logout(() => {
      return res.status(200).json({ message: "Compte supprimé" });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});



module.exports = router;
