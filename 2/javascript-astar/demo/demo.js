window.log = function () {
    if (this.console) {
        console.log(Array.prototype.slice.call(arguments));
    }
};

$(function () {

    var $grid = $("#search_grid");
    var $selectWallFrequency = $("#selectWallFrequency");
    var $selectGridSize = $("#selectGridSize");
    var $checkDebug = $("#checkDebug");
    var $searchDiagonal = $("#searchDiagonal");

    var opts = {
        wallFrequency: $selectWallFrequency.val(),
        gridSize: $selectGridSize.val(),
        debug: $checkDebug.is("checked"),
        diagonal: $searchDiagonal.is("checked")
    };

    var grid = new GraphSearch($grid, opts, astar.search);

    $("#btnGenerate").click(function () {
        grid.initialize();
    });

    $selectWallFrequency.change(function () {
        grid.setOption({wallFrequency: $(this).val()});
        grid.initialize();
    });

    $selectGridSize.change(function () {
        grid.setOption({gridSize: $(this).val()});
        grid.initialize();
    });

    $checkDebug.change(function () {
        var checked = $(this).is(":checked");
        grid.setOption({debug: checked});
        if (!checked) {
            var weights = grid.graph.input.flat();
            grid.$cells.each(function (i) {
                $(this).html(weights[i]);
            })
        }
    });

    $searchDiagonal.change(function () {
        grid.setOption({diagonal: $(this).is(":checked")});
    });
    $("#generateWeights").click(function () {
        if ($("#generateWeights").prop("checked")) {
            $('#weightsKey').slideDown();
            grid.initialize()
        } else {
            $('#weightsKey').slideUp();
            grid.initialize();
        }
    });

});

var css = {start: "start", finish: "finish", wall: "wall", active: "active"};

function GraphSearch($graph, options, implementation) {
    this.$graph = $graph;
    this.search = implementation;
    this.opts = $.extend({wallFrequency: .1, debug: true, gridSize: 10}, options);
    this.initialize();
}

GraphSearch.prototype.setOption = function (opt) {
    this.opts = $.extend(this.opts, opt);
    console.log(opt["debug"] || opt["debug"] === false)
    if (opt["debug"] != null) {
        this.drawDebugInfo(opt["debug"]);
    }
};

GraphSearch.prototype.initialize = function () {

    var self = this;
    this.grid = [];
    var nodes = [];
    var $graph = this.$graph;

    $graph.empty();

    var cellWidth = ($graph.width() / this.opts.gridSize) - 2;
    var cellHeight = ($graph.height() / this.opts.gridSize) - 2;
    var $cellTemplate = $("<span />").addClass("grid_item").width(cellWidth).height(cellHeight);
    var startSet = false;

    var addRandomWeights = $("#generateWeights").prop("checked")
    if (addRandomWeights) {
        var weights = [];
        while (weights.length < 3) {
            var num = Math.floor(Math.random() * 9) + 1;
            if (!weights.includes(num)) weights.push(num);
        }
        weights.sort((a, b) => a - b);

        weights.forEach((w, i) => {
            $("#legend" + (i + 1)).text("Weight of " + w)
        })
    }


    for (var x = 0; x < this.opts.gridSize; x++) {
        var $row = $("<div class='clear' />");

        var nodeRow = [];
        var gridRow = [];

        for (var y = 0; y < this.opts.gridSize; y++) {
            var id = "cell_" + x + "_" + y;
            var $cell = $cellTemplate.clone();
            $cell.attr("id", id).attr("x", x).attr("y", y);
            $row.append($cell);
            gridRow.push($cell);

            const isWall = Math.floor(Math.random() * (1 / self.opts.wallFrequency));
            if (isWall === 0) {
                nodeRow.push(GraphNodeType.WALL);
                $cell.addClass(css.wall);
            } else {
                var weight_index = addRandomWeights ? Math.floor(Math.random() * 3) : -1;
                var cell_weight = (weight_index < 0 ? 1 : weights[weight_index]);
                nodeRow.push(cell_weight);
                $cell.addClass('weight' + (weight_index < 0 ? 1 : weight_index + 1));
                $cell.html(cell_weight);
                if (!startSet) {
                    $cell.addClass(css.start);
                    startSet = true;
                }
            }
        }
        $graph.append($row);

        this.grid.push(gridRow);
        nodes.push(nodeRow);
    }

    this.graph = new Graph(nodes);

    this.$cells = $graph.find(".grid_item");
    this.$cells.click(function () {
        self.cellClicked($(this))
    });
};

GraphSearch.prototype.cellClicked = function ($end) {

    var end = this.nodeFromElement($end);

    if ($end.hasClass(css.wall) || $end.hasClass(css.start)) {
        log("clicked on wall or start...", $end);
        return;
    }

    this.$cells.removeClass(css.finish);
    $end.addClass("finish");
    var $start = this.$cells.filter("." + css.start);
    var start = this.nodeFromElement($start);

    var sTime = new Date();
    var path = this.search(this.graph.nodes, start, end, this.opts.diagonal);
    var fTime = new Date();

    if (!path || path.length === 0) {
        $("#message").text("couldn't find a path (" + (fTime - sTime) + "ms)");
        this.animateNoPath();
    } else {
        $("#message").text("search took " + (fTime - sTime) + "ms.");
        if (this.opts.debug) {
            this.drawDebugInfo(this.opts.debug);
        }
        this.animatePath(path);
    }
};

GraphSearch.prototype.drawDebugInfo = function (show) {
    this.$cells.html(" ");
    var that = this;
    if (show) {
        that.$cells.each(function (i) {
            var node = that.nodeFromElement($(this));
            var debug = false;
            if (node.visited) {
                debug = "F: " + node.f + "<br />G: " + node.g + "<br />H: " + node.h;
            }

            if (debug) {
                $(this).html(debug);
            }
        });
    }
};

GraphSearch.prototype.nodeFromElement = function ($cell) {
    return this.graph.nodes[parseInt($cell.attr("x"))][parseInt($cell.attr("y"))];
};

GraphSearch.prototype.animateNoPath = function () {
    var $graph = this.$graph;
    var jiggle = function (lim, i) {
        if (i >= lim) {
            $graph.css("top", 0).css("left", 0);
            return;
        }
        if (!i) i = 0;
        i++;
        $graph.css("top", Math.random() * 6).css("left", Math.random() * 6);
        setTimeout(function () {
            jiggle(lim, i)
        }, 5);
    };
    jiggle(15);
};

GraphSearch.prototype.animatePath = function (path) {
    var grid = this.grid;
    var timeout = 1000 / grid.length;
    var elementFromNode = function (node) {
        return grid[node.x][node.y];
    };

    var removeClass = function (path, i) {
        if (i >= path.length) return;
        elementFromNode(path[i]).removeClass(css.active);
        setTimeout(function () {
            removeClass(path, i + 1)
        }, timeout * path[i].cost);
    }
    var addClass = function (path, i) {
        if (i >= path.length) {
            return removeClass(path, 0);
        }
        elementFromNode(path[i]).addClass(css.active);
        setTimeout(function () {
            addClass(path, i + 1)
        }, timeout * path[i].cost);
    };

    addClass(path, 0)
    this.$graph.find("." + css.start).removeClass(css.start);
    this.$graph.find("." + css.finish).removeClass(css.finish).addClass(css.start);
};
