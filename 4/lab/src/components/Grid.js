import '@/styles/components/Grid.css'
import {h} from "@/utils/dom";

export default function Grid(cell_size = 16) {
    let isDrawing = false;
    let gridArray = Array.from({length: 28}, () => Array(28).fill(0));

    let initialized = false;

    function updateGrid(i, j) {
        const newGrid = gridArray.map(row => [...row]);
        newGrid[i][j] = 1;
        if (i + 1 < gridArray.length) newGrid[i + 1][j] = 1;
        if (j + 1 < gridArray[0].length) newGrid[i][j + 1] = 1;
        gridArray = newGrid;
        render()
    }

    const pointerDown = (i, j) => {
        isDrawing = true;
        updateGrid(i, j);
    };

    const pointerMove = (i, j) => {
        if (isDrawing) {
            updateGrid(i, j);
        }
    };

    const pointerUp = () => {
        isDrawing = false;
    };

    const gridContainer = h("div");

    function render() {
        if (!initialized) {
            gridContainer.addEventListener('mouseup', pointerUp);

            gridArray.forEach((row, i) => {
                const rowContainer =
                    h("div", {
                        id: `${i}`,
                        class: "grid-row",
                        style: {
                            height: `${cell_size}px`,
                        },
                    });

                row.forEach((pixel, j) => {
                    rowContainer.appendChild(
                        h("button", {
                            id: `${i}-${j}`,
                            class: ["pixel", {"active_pixel": pixel},],
                            style: {
                                width: `${cell_size}px`,
                                height: `${cell_size}px`,
                            },
                            onMouseDown: () => pointerDown(i, j),
                            onMouseMove: () => pointerMove(i, j),
                        })
                    );
                });
                gridContainer.appendChild(rowContainer);
            })

            initialized = true;
        } else {
            gridArray.forEach((row, i) => {
                row.forEach((pixel, j) => {
                    const cell = document.getElementById(`${i}-${j}`);
                    cell.classList.toggle('active_pixel', pixel);
                })
            })
        }
    }

    render();
    return Object.assign(gridContainer,
        {
            getGrid: () => gridArray,
            setGrid: newGridArray => {
                gridArray = newGridArray;
                render();
            },
            clear: () => {
                gridArray = Array.from({length: 28}, () => Array(28).fill(0));
                render();
            }
        }
    );
}
