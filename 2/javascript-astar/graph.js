/**
 * Graph class for pathfinding algorithms (e.g., A* search).
 * Represents a grid-based weighted graph where each cell is a node.
 *
 * @class Graph
 * @param {number[][]}  grid    - 2D array representing the graph's weights.
 *                              `grid[row][col]` represents the cost of traversing a cell at (row, col).
 *                              `0` typically represents a wall and other number indicates movement costs.
 *
 * @example
 * // Example 1: 0/1 grid
 * const grid1 = [
 *   [1, 1, 1],
 *   [1, 0, 1],
 *   [1, 1, 1]
 * ];
 * const graph1 = new Graph(grid1);
 *
 * // Example 2: grid with varying weights
 * const grid2 = [
 *   [1, 3, 5],
 *   [1, 0, 1],
 *   [1, 2, 1]
 * ];
 * const graph2 = new Graph(grid2);
 */
function Graph(grid) {
    this.input = grid;
    this.nodes = grid.map((row, x) =>
        row.map((cost, y) => new GraphNode(x, y, cost))
    );
}

Graph.prototype.toString = function () {
    var graphString = "\n";
    var nodes = this.nodes;
    var rowDebug, row, y, l;
    for (var x = 0, len = nodes.length; x < len; x++) {
        rowDebug = "";
        row = nodes[x];
        for (y = 0, l = row.length; y < l; y++) {
            rowDebug += row[y].cost + " ";
        }
        graphString = graphString + rowDebug + "\n";
    }
    return graphString;
};

/**
 * Enum for graph node types.
 * Defines the weight values assigned to different node types in the graph.
 */
var GraphNodeType = {
    OPEN: 1,
    WALL: 0,
};

/**
 * GraphNode class used in the Graph.
 * Represents a single node in the graph.
 *
 * @class GraphNode
 * @param {number}  x       - The x-coordinate of the node.
 * @param {number}  y       - The y-coordinate of the node.
 * @param {number}  cost    - The type or the weight of the node.
 *
 * @example
 * // Example 1: Create a wall node with coordinates (0, 0).
 * const node1 = new GraphNode(0, 0, GraphNodeType.WALL);
 *
 * // Example 2: Create an node with coordinates (1, 2) and weight 3.
 * const node2 = new GraphNode(1, 2, 3);
 */
function GraphNode(x, y, cost) {
    this.x = x;
    this.y = y;
    this.cost = cost;
}

GraphNode.prototype.toString = function () {
    return "[" + this.x + " " + this.y + "]";
};

/**
 * Check if the node is a wall.
 *
 * @returns {boolean}  - Whether the node is a wall.
 */
GraphNode.prototype.isWall = function () {
    return this.cost === GraphNodeType.WALL;
};
