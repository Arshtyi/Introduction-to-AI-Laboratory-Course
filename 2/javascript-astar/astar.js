/**
 * Astar algorithm implementation.
 *
 * @example
 * var graph = new Graph([
 *     [1, 1, 1, 1],
 *     [0, 1, 1, 0],
 *     [0, 0, 1, 1]
 * ]);
 * var start = graph.nodes[0][0];
 * var end = graph.nodes[1][2];
 * var result = astar.search(graph.nodes, start, end);
 * // result is an array containing the shortest path
 *
 * var resultWithDiagonals = astar.search(graph.nodes, start, end, true);
 * // result now searches diagonal neighbors as well
 *
 * // Weight can easily be added by increasing the values within the graph, and where 0 is infinite (a wall)
 * var graphWithWeight = new Graph([
 *     [1, 1, 2, 30],
 *     [0, 4, 1.3, 0],
 *     [0, 0, 5, 1]
 * ]);
 * var startWithWeight = graphWithWeight.nodes[0][0];
 * var endWithWeight = graphWithWeight.nodes[1][2];
 * var resultWithWeight = astar.search(graphWithWeight.nodes, startWithWeight, endWithWeight);
 *
 * // resultWithWeight is an array containing the shortest path taking into account the weight of a node
 */
class PriorityQueue {
    constructor() {
        this.nodes = [];
    }

    enqueue(element, priority) {
        this.nodes.push({ element, priority });
        this.nodes.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.nodes.shift().element;
    }

    isEmpty() {
        return this.nodes.length === 0;
    }

    includes(element) {
        return this.nodes.some((node) => node.element === element);
    }
}
class BinaryHeap {
    constructor() {
        this.nodes = [];
    }

    enqueue(element, priority) {
        const node = { element, priority };
        this.nodes.push(node);
        this.bubbleUp(this.nodes.length - 1);
    }

    dequeue() {
        const root = this.nodes[0];
        const end = this.nodes.pop();
        if (this.nodes.length > 0) {
            this.nodes[0] = end;
            this.sinkDown(0);
        }
        return root.element;
    }

    isEmpty() {
        return this.nodes.length === 0;
    }

    bubbleUp(index) {
        const node = this.nodes[index];
        while (index > 0) {
            const parentIndex = Math.floor((index + 1) / 2) - 1;
            const parent = this.nodes[parentIndex];
            if (node.priority >= parent.priority) break;
            this.nodes[parentIndex] = node;
            this.nodes[index] = parent;
            index = parentIndex;
        }
    }

    sinkDown(index) {
        const length = this.nodes.length;
        const node = this.nodes[index];
        while (true) {
            const leftChildIdx = (index + 1) * 2 - 1;
            const rightChildIdx = (index + 1) * 2;
            let swap = null;
            let leftChild, rightChild;
            if (leftChildIdx < length) {
                leftChild = this.nodes[leftChildIdx];
                if (leftChild.priority < node.priority) swap = leftChildIdx;
            }
            if (rightChildIdx < length) {
                rightChild = this.nodes[rightChildIdx];
                if (
                    (swap === null && rightChild.priority < node.priority) ||
                    (swap !== null && rightChild.priority < leftChild.priority)
                ) {
                    swap = rightChildIdx;
                }
            }
            if (swap === null) break;
            this.nodes[index] = this.nodes[swap];
            this.nodes[swap] = node;
            index = swap;
        }
    }
    includes(element) {
        return this.nodes.some((node) => node.element === element);
    }
}

var astar = {
    init: function (grid) {
        for (var x = 0, xl = grid.length; x < xl; x++) {
            for (var y = 0, yl = grid[x].length; y < yl; y++) {
                var node = grid[x][y];
                node.f = 0;
                node.g = 0;
                node.h = 0;
                node.parent = null;
                node.visited = false;
                // DO NOT REMOVE THE f, g, h, visited PROPERTIES
                // You can add your own node properties if needed for the algorithm
            }
        }
    },

    /**
     * A* search algorithm to find the shortest path from start to end.
     * MUST BE IMPLEMENTED STRICTLY ACCORDING TO THE FUNCTION SIGNATURE.
     *
     * @param   {GraphNode[][]}   grid        - The 2D array of GraphNodes representing the graph.
     * @param   {GraphNode}       start       - Start node.
     * @param   {GraphNode}       end         - End node.
     * @param   {boolean}         diagonal    - Whether diagonal movement is allowed.
     *
     * @returns {GraphNode[]}   - An array of nodes in the shortest path from start to end.
     */
    search: function (grid, start, end, diagonal) {
        astar.init(grid);
        diagonal = !!diagonal;

        // Basic implementation of the A* algorithm with multiple opportunities for optimization

        // var openList = new PriorityQueue();
        var openList = new BinaryHeap();
        var closedList = new Set();

        openList.enqueue(start, start.f);

        while (!openList.isEmpty()) {
            // Select the node with the lowest f-value from the open list as the current node
            var currentNode = openList.dequeue();

            // If current node is the end node, return the path
            if (currentNode === end) {
                var path = [];
                var temp = currentNode;

                // Implement backtracking to return the path
                while (temp.parent) {
                    path.push(temp);
                    temp = temp.parent; //不断加入父节点
                }

                return path.reverse();
            }

            // Move the current node from the open list to the closed list
            closedList.add(currentNode);

            // Explore all the neighbors of the current node
            var neighbors = astar.neighbors(grid, currentNode, diagonal);
            neighbors.forEach((neighbor) => {
                // Skip the neighbor if it is in the closed list or is a wall
                if (closedList.has(neighbor) || neighbor.isWall()) return;

                // Mark the neighbor as visited
                neighbor.visited = true;

                // Calculate the neighbor's current g, h, and f values
                var tentativeG = currentNode.g + neighbor.cost; // Use the neighbor's weight for the cost
                if (
                    diagonal &&
                    neighbor.x !== currentNode.x &&
                    neighbor.y !== currentNode.y
                ) {
                    tentativeG = currentNode.g + neighbor.cost * Math.SQRT2; // Diagonal moves cost sqrt(2) times the cost
                }
                var currentG = tentativeG;
                var currentH = astar.heuristic(neighbor, end);
                var currentF = currentG + currentH * 0.8;

                if (!openList.includes(neighbor)) {
                    // If the neighbor is not in the open list, add it
                    neighbor.g = currentG;
                    neighbor.h = currentH;
                    neighbor.f = currentF;
                    neighbor.parent = currentNode;
                    openList.enqueue(neighbor, neighbor.f);
                } else {
                    // If the neighbor is already in the open list, check if this path is better
                    if (currentG < neighbor.g) {
                        neighbor.g = currentG;
                        neighbor.h = currentH;
                        neighbor.f = currentF;
                        neighbor.parent = currentNode;
                    }
                }
            });
        }
    },

    heuristic: function (node0, node1) {
        // TODO: Implement the heuristic function
        var dx = Math.abs(node0.x - node1.x);
        var dy = Math.abs(node0.y - node1.y);
        return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
        //return dx + dy;
        //return Math.sqrt(dx * dx + dy * dy);
    },

    neighbors: function (grid, node, diagonals) {
        var result = [];
        var x = node.x;
        var y = node.y;

        // Directions array for easy neighbor calculation
        var directions = [
            { dx: 1, dy: 0 }, // East
            { dx: -1, dy: 0 }, // West
            { dx: 0, dy: 1 }, // South
            { dx: 0, dy: -1 }, // North
        ];

        if (diagonals) {
            directions.push(
                { dx: 1, dy: 1 }, // South-East
                { dx: -1, dy: -1 }, // North-West
                { dx: 1, dy: -1 }, // North-East
                { dx: -1, dy: 1 } // South-West
            );
        }

        // Iterate over all directions
        directions.forEach(function (dir) {
            var newX = x + dir.dx;
            var newY = y + dir.dy;

            // Check if the new position is within bounds
            if (grid[newX] && grid[newX][newY] && !grid[newX][newY].isWall()) {
                result.push(grid[newX][newY]);
            }
        });

        return result;
    },
};
