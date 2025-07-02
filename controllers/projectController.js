const Project = require('../models/Project');
const Dependency  = require('../models/Dependency'); 
const Task = require('../models/Task'); // Pour inclure les tâches liées

exports.createProject = async (req, res) => {
    try {
        const { name, description, isFavorite } = req.body;
        const userId = req.user.id; // Récupérer l'ID de l'utilisateur connecté depuis req.user

        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const project = await Project.create({ name, description, isFavorite, userId });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création du projet", error: error.message });
    }
};

// Récupérer tous les projets avec leurs tâches associées
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({ include: [{ model: Task, as: 'tasks' }] });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des projets", error: error.message });
    }
};

// Récupérer un projet par ID avec ses tâches
exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByPk(id, { include: [{ model: Task, as: 'tasks' }] });

        if (!project) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du projet", error: error.message });
    }
};

// Mettre à jour un projet
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isFavorite, isSuccessor } = req.body;

        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }

        await project.update({ name, description, isFavorite,isSuccessor });
        res.status(200).json({ message: "Projet mis à jour avec succès", project });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du projet", error: error.message });
    }
};

// Supprimer un projet (et ses tâches associées)
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByPk(id);
        
        if (!project) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }

        await project.destroy();
        res.status(200).json({ message: "Projet supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du projet", error: error.message });
    }
};
exports.getProjectsByUser = async (req, res) => {
    try {
      const userId = req.user.id; // Supposons que l'ID de l'utilisateur est extrait du token d'authentification
  
      if (!userId) {
        return res.status(400).json({ error: "L'identifiant de l'utilisateur est requis." });
      }
  
      const projects = await Project.findAll({
        where: { userId },
        include: [
          {
            model: Task,
            as: 'tasks', // Utilise l'alias défini dans le modèle
            attributes: ['id', 'name', 'duration'], // Inclure les attributs nécessaires
            include: [
              {
                model: Dependency,
                as: 'dependencies', // Dépendances où cette tâche dépend d'autres
                attributes: ['taskId', 'dependsOnId'],
                required: false // LEFT JOIN pour inclure les tâches sans dépendances
              },
              {
                model: Dependency,
                as: 'successors', // Dépendances où cette tâche est une dépendance pour d'autres
                attributes: ['taskId', 'dependsOnId'],
                required: false // LEFT JOIN pour inclure les tâches sans successeurs
              }
            ],
            required: false // LEFT JOIN pour inclure les projets sans tâches
          }
        ],
        order: [
          ['id', 'DESC'], // Trier les projets par ID décroissant (plus récents d'abord)
          [{ model: Task, as: 'tasks' }, 'id', 'ASC'] // Trier les tâches par ID croissant
        ]
      });
  
      if (!projects.length) {
        return res.status(404).json({ message: "Aucun projet trouvé pour cet utilisateur." });
      }
  
      res.status(200).json(projects);
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fonction additionnelle pour obtenir les statistiques détaillées (optionnel)
  exports.getProjectsStatsForDashboard = async (req, res) => {
    try {
      const userId = req.user.id;
  
      if (!userId) {
        return res.status(400).json({ error: "L'identifiant de l'utilisateur est requis." });
      }
  
      // Récupérer tous les projets avec leurs statistiques
      const projects = await Project.findAll({
        where: { userId },
        include: [
          {
            model: Task,
            as: 'tasks',
            attributes: ['id', 'name', 'duration'],
            include: [
              {
                model: Dependency,
                as: 'dependencies',
                attributes: ['taskId', 'dependsOnId'],
                required: false
              }
            ],
            required: false
          }
        ]
      });
  
      // Calculer les statistiques pour le dashboard
      const stats = {
        totalProjects: projects.length,
        totalTasks: projects.reduce((sum, project) => sum + (project.tasks?.length || 0), 0),
        totalDependencies: projects.reduce((sum, project) => {
          return sum + (project.tasks?.reduce((taskSum, task) => {
            return taskSum + (task.dependencies?.length || 0);
          }, 0) || 0);
        }, 0),
        favoritesCount: projects.filter(p => p.isFavorite).length,
        successorProjectsCount: projects.filter(p => p.isSuccessor).length,
        avgTaskDuration: (() => {
          const allTasks = projects.flatMap(p => p.tasks || []);
          if (allTasks.length === 0) return 0;
          return Math.round(allTasks.reduce((sum, task) => sum + (task.duration || 0), 0) / allTasks.length);
        })(),
        projectsWithTasks: projects.filter(p => p.tasks && p.tasks.length > 0).length
      };
  
      res.status(200).json({
        projects,
        stats
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ error: error.message });
    }
  };
  