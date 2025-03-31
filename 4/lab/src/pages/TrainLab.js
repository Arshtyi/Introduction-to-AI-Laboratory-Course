import * as vis from '@tensorflow/tfjs-vis';

import '@/styles/pages/TrainLab.css';
import {h} from "@/utils/dom";
import {drawData} from "@/utils/misc";
import {MnistData} from '@/utils/data.js';
import {getModel, train, doPrediction} from "@/utils/train";
import TutorialComponent from "@/components/Tutorial";

export default function TrainLab() {
    const data = new MnistData();
    const model = getModel();
    const classNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

    let examples = null;

    let trained = false;

    async function showAccuracy(model, data) {
        if (!data.loaded)
            return;

        const [preds, labels] = await doPrediction(model, data);
        const classAccuracy = await vis.metrics.perClassAccuracy(labels, preds);
        const container = {name: 'Accuracy', tab: 'Evaluation'};
        await vis.show.perClassAccuracy(container, classAccuracy, classNames);

        labels.dispose();
    }

    async function showConfusion(model, data) {
        if (!data.loaded)
            return;

        const [preds, labels] = await doPrediction(model, data);
        const confusionMatrix = await vis.metrics.confusionMatrix(labels, preds);
        const container = {name: 'Confusion Matrix', tab: 'Evaluation'};
        await vis.render.confusionMatrix(container, {values: confusionMatrix, tickLabels: classNames});

        labels.dispose();
    }

    const load = () => {
        data.load().then(() => {
            const xs = data.nextTestBatch(16).xs;
            xs.reshape([16, 28, 28, 1]).array().then(reshaped => {
                examples = reshaped;
                examples.map(d => d.flat(Infinity)).forEach(example => {
                    drawData(example, 50, 50, [28, 28, 1])
                        .then(canvas => vis.visor().surface({
                            name: "Original Image",
                            tab: "Input Data"
                        }).drawArea.appendChild(canvas));
                })
            });
            alert("Data Loaded");
        })
    };

    const trainStart = () => {
        if (data.loaded) {
            vis.show.modelSummary({name: 'Model Architecture', tab: 'Model'}, model).then(() =>
                train(model, data).then(() => {
                    alert("Training Completed");
                    trained = true;
                    model.save("downloads://my_model").then();
                })
            );
        }
    }

    const evaluateStart = () => {
        if (trained) {
            showAccuracy(model, data).then(() => {
                showConfusion(model, data).then(() => alert("Evaluation Completed"));
            });
        }
    }

    const tutorial = TutorialComponent('train-lab.html');

    tutorial.getBottomBar().appendChild(
        h("div", {class: ["train-lab-control",]},
            [
                h("div", {class: ["train-lab-button-container", "train-control-button",]},
                    [
                        h("button", {innerText: "Toggle", onClick: () => vis.visor().toggle()}),
                        h("button", {
                            innerText: "Load",
                            onClick: load,
                        }),
                    ]
                ),
                h("div", {class: ["train-lab-button-container", "train-control-button",]},
                    [
                        h("button", {
                            innerText: "Train",
                            onClick: trainStart,
                        }),
                        h("button", {
                            innerText: "Evaluate",
                            onClick: evaluateStart,
                        }),
                    ]
                ),
            ]
        )
    )

    return tutorial;
}
