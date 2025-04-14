import * as vis from '@tensorflow/tfjs-vis';

import '@/styles/pages/DataLab.css'
import {h} from "@/utils/dom";
import {MnistData} from '@/utils/data.js';
import {drawData, drawImage} from "@/utils/misc";
import TutorialComponent from "@/components/Tutorial";
import gridComponent from '@/components/Grid';


export default function DataLab() {
    const data = new MnistData();
    let labelText = NaN;

    const tutorial = TutorialComponent('data-lab.html');
    const grid = gridComponent(6);
    const label = h("p", {innerText: "Digital Label: NaN"});
    let digitalSurfaces = null;

    function showExamples(data) {
        data.nextTestBatch(28).xs.array().then(examples =>
            examples.forEach(example => drawData(example, 28, 28, [28, 28, 1]).then(canvas => {
                vis.visor().surface({name: 'MNIST Examples', tab: 'Input Data'}).drawArea.appendChild(canvas);
                vis.visor().setActiveTab("Input Data");
            }))
        );
    }

    const digitalClick = (digital) => {
        labelText = digital;
        label.innerText = `Digital Label: ${digital}`;
    };

    const showExample = () => {
        if (!data.loaded) {
            data.load().then(() => {
                showExamples(data);
                if (!digitalSurfaces) {
                    digitalSurfaces = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i =>
                        vis.visor().surface({
                            name: `Digital ${i}`, tab: "My Data"
                        })
                    );
                }

            });
        } else {
            showExamples(data);
        }
    };

    const submit = () => {
        if (data.loaded && !isNaN(labelText)) {
            vis.visor().setActiveTab("My Data");
            digitalSurfaces[labelText].drawArea.appendChild(drawImage(grid.getGrid(), 28, 28));
        }
    };

    tutorial.getBottomBar().appendChild(
        h("div", {class: "data-lab-container"},
            [
                grid,
                h("div", {class: "data-lab-control"},
                    [
                        label,
                        h("div", {class: "data-lab-button-container",},
                            ([0, 1, 2, 3, 4].map(i =>
                                h("button", {innerText: i, onClick: () => digitalClick(i),})
                            ))
                        ),
                        h("div", {class: "data-lab-button-container",},
                            ([5, 6, 7, 8, 9].map(i =>
                                h("button", {innerText: i, onClick: () => digitalClick(i),})
                            ))
                        ),
                        h("div", {class: ["data-lab-button-container", "data-control-button",]},
                            [
                                h("button", {innerText: "Toggle", onClick: () => vis.visor().toggle(),}),
                                h("button", {
                                    innerText: "Example",
                                    onClick: showExample
                                }),
                            ]
                        ),
                        h("div", {class: ["data-lab-button-container", "data-control-button",]},
                            [
                                h("button", {
                                    innerText: "Clear",
                                    onClick: grid.clear,
                                }),
                                h("button", {
                                    innerText: "Submit",
                                    onClick: submit,
                                }),
                            ]
                        ),
                    ]
                )
            ]
        )
    );

    return tutorial;
}
