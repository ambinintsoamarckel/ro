const { getTaskGraph } = require('./criticalPath');

async function checkForCycle(projectId, newDependencies = []) {
  try {
    // Obtenir le graphe actuel des tâches
    const { graph, inDegree } = await getTaskGraph(projectId);
    console.log(newDependencies);

    // 🔥 Ajouter temporairement les nouvelles dépendances
    newDependencies.forEach(([taskId, dependsOnId]) => {

      graph[taskId].dependencies.push(dependsOnId);
      graph[dependsOnId].successors.push(taskId);
      inDegree[taskId] = (inDegree[taskId] || 0) + 1;
    });

    // 🔍 Essayer de trier topologiquement
    const queue = [];
    const sortedTasks = [];

    // Ajouter les tâches sans dépendances dans la file
    Object.keys(inDegree).forEach(taskId => {
      if (inDegree[taskId] === 0) queue.push(taskId);
    });

    while (queue.length > 0) {
      const currentId = queue.shift();
      sortedTasks.push(graph[currentId]);

      // Réduire le degré entrant des successeurs
      graph[currentId].successors.forEach(successorId => {
        inDegree[successorId]--;
        if (inDegree[successorId] === 0) queue.push(successorId);
      });
    }

    // ❌ Si toutes les tâches ne sont pas triées, il y a un cycle
    return sortedTasks.length !== Object.keys(graph).length;
  } catch (error) {
    console.error(error);
    return true; // ❌ Cycle détecté
  }
}

module.exports = { checkForCycle };
