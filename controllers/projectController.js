const Project = require('../models/Project');
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
        const { name, description, isFavorite } = req.body;

        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }

        await project.update({ name, description, isFavorite });
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
