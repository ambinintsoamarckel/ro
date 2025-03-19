const express = require('express');
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const crypto = require('crypto');
const Utilisateur = require('../models/User');
const router = express.Router();



passport.use(new LocalStrategy(
  async function verify(username, password, cb) {
    try {
      const user = await Utilisateur.findOne({ username: username });
      
      if (!user) {
        return cb(null, false, { message: 'Incorrect email.' });
      }
      
      crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
        if (err) { return cb(err); }
        if (!crypto.timingSafeEqual(Buffer.from(user.password, 'hex'), hashedPassword)) {
          return cb(null, false, { message: 'Incorrect password.' });
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


module.exports = router;
