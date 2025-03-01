const Task = require('../models/Task');
const Dependency = require('../models/Dependency');

async function getTaskGraph() {
  const tasks = await Task.findAll({ include: ['dependencies', 'successors'] });
  const graph = {};
  const inDegree = {}; // Nombre de dépendances pour chaque tâche

  // Initialiser le graphe
  tasks.forEach(task => {
    graph[task.id] = { ...task.toJSON(), successors: [], dependencies: [] };
    inDegree[task.id] = 0;
  });

  // Remplir les dépendances et les successeurs
  tasks.forEach(task => {
    task.dependencies.forEach(dep => {
      graph[task.id].dependencies.push(dep.dependsOnId);
      graph[dep.dependsOnId].successors.push(task.id);
      inDegree[task.id]++; // Augmenter le compteur d'entrées
    });
  });

  return { graph, inDegree };
}
async function topologicalSort() {
    const { graph, inDegree } = await getTaskGraph();
    const sortedTasks = [];
    const queue = [];
  
    // Ajouter toutes les tâches sans dépendance dans la file d'attente
    Object.keys(inDegree).forEach(taskId => {
      if (inDegree[taskId] === 0) queue.push(taskId);
    });
  
    while (queue.length > 0) {
      const currentId = queue.shift();
      sortedTasks.push(graph[currentId]);
  
      // Réduire le degré entrant des successeurs et les ajouter à la file s'ils sont prêts
      graph[currentId].successors.forEach(successorId => {
        inDegree[successorId]--;
        if (inDegree[successorId] === 0) queue.push(successorId);
      });
    }
  
    // Vérifier s'il y a un cycle (si le tri ne contient pas toutes les tâches)
    if (sortedTasks.length !== Object.keys(graph).length) {
      throw new Error('Le graphe contient une boucle ! Vérifiez les dépendances.');
    }
  
    return sortedTasks;
  }
  
  async function getCriticalPath() {
    const sortedTasks = await topologicalSort();
    const taskMap = Object.fromEntries(sortedTasks.map(task => [task.id, { ...task, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, slack: 0, critical: false }]));
  
    // ➤ Étape 1 : Forward Pass (Calcul des early start/finish)
    sortedTasks.forEach(task => {
      if (task.dependencies.length === 0) {
        taskMap[task.id].earlyStart = 0;
      } else {
        taskMap[task.id].earlyStart = Math.max(...task.dependencies.map(depId => taskMap[depId].earlyFinish));
      }
      taskMap[task.id].earlyFinish = taskMap[task.id].earlyStart + taskMap[task.id].duration;
    });
  
    // ➤ Étape 2 : Backward Pass (Calcul des late start/finish)
    const maxFinish = Math.max(...sortedTasks.map(task => taskMap[task.id].earlyFinish));
    [...sortedTasks].reverse().forEach(task => {
      if (task.successors.length === 0) {
        taskMap[task.id].lateFinish = maxFinish;
      } else {
        taskMap[task.id].lateFinish = Math.min(...task.successors.map(succId => taskMap[succId].lateStart));
      }
      taskMap[task.id].lateStart = taskMap[task.id].lateFinish - taskMap[task.id].duration;
      taskMap[task.id].slack = taskMap[task.id].lateStart - taskMap[task.id].earlyStart;
      taskMap[task.id].critical = (taskMap[task.id].slack === 0);
    });
  
    return Object.values(taskMap);
  }
  module.exports = {  getCriticalPath };  