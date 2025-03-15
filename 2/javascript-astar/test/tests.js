test("Sanity Checks", function () {
    ok(typeof Graph !== "undefined", "Graph exists");
    ok(typeof astar !== "undefined", "Astar exists");
});

test("Basic Horizontal", function () {

    var result1 = runSearch([[1], [1]], [0, 0], [1, 0]);
    equal(result1.text, "(1,0)", "One step down");

    var result2 = runSearch([[1], [1], [1]], [0, 0], [2, 0]);
    equal(result2.text, "(1,0)(2,0)", "Two steps down");

    var result3 = runSearch([[1], [1], [1], [1]], [0, 0], [3, 0]);
    equal(result3.text, "(1,0)(2,0)(3,0)", "Three steps down");

});

test("Basic Vertical", function () {

    var result1 = runSearch([[1, 1]], [0, 0], [0, 1]);
    equal(result1.text, "(0,1)", "One step across");

    var result2 = runSearch([[1, 1, 1]], [0, 0], [0, 2]);
    equal(result2.text, "(0,1)(0,2)", "Two steps across");

    var result3 = runSearch([[1, 1, 1, 1]], [0, 0], [0, 3]);
    equal(result3.text, "(0,1)(0,2)(0,3)", "Three steps across");

});

test("Pathfinding on binary-weight grids", function () {
    var result1 = runSearch([
        [1, 1, 1, 1],
        [0, 1, 1, 0],
        [0, 0, 1, 1]
    ], [0, 0], [2, 3]);

    equal(result1.text, "(0,1)(1,1)(1,2)(2,2)(2,3)", "Result is expected");
});

test("Pathfinding on multi-weight grids", function () {
    var result1 = runSearch([
        [1, 1, 3, 1],
        [0, 5, 1, 0],
        [0, 0, 3, 1]
    ], [0, 0], [2, 3]);

    equal(result1.text, "(0,1)(0,2)(1,2)(2,2)(2,3)", "Result is expected");
});


function runSearch(grid, start, end) {
    var graph = new Graph(grid);
    var startNode = graph.nodes[start[0]][start[1]];
    var endNode = graph.nodes[end[0]][end[1]];
    var sTime = new Date();
    var result = astar.search(graph.nodes, startNode, endNode);
    var eTime = new Date();
    return {
        result: result,
        text: pathToString(result),
        time: (eTime - sTime)
    };
}

function pathToString(result) {
    return result.map(function (node) {
        return "(" + node.x + "," + node.y + ")";
    }).join("");
}
