import * as tf from '@tensorflow/tfjs';

import '@/styles/pages/PracticeLab.css'
import {h} from "@/utils/dom";
import gridComponent from '@/components/Grid';


export default function PracticeLab() {
    let model = null;

    tf.loadLayersModel('my_model/my_model.json').then(
        loadedModel => {
            model = loadedModel;
            alert('Model Loaded');
        });

    async function predictImage(grid) {
        if (!model) {
            alert('Model Not Loaded');
            return;
        }

        const flatArray = grid.flatMap(row => row);
        const inputTensor = tf.tensor4d(flatArray, [1, 28, 28, 1]);
        const prediction = model.predict(inputTensor);
        const result = await prediction.data();

        inputTensor.dispose();
        return result.indexOf(Math.max(...result));
    }

    const grid = gridComponent();
    const prediction = h("p", {innerText: "Digit Prediction", class: "prediction-text"},);

    return h("div", {class: "practice-lab-container"},
        [
            h("h1", {innerText: "MNIST Digit Recognizer", class: "practice-lab-title"},),
            h("h2", {innerText: "Draw a digit in the box below and click Predict", class: "practice-lab-subtitle"}),
            h("div", {class: "grid-container"}, [grid,]),
            h("div", {class: "practice-lab-button-container"},
                [
                    h("button", {
                        innerText: "Clear",
                        class: "clear-button",
                        onClick: grid.clear,
                    }),
                    h("button", {
                        innerText: "Predict",
                        class: "predict-button",
                        onClick: () => predictImage(grid.getGrid())
                            .then(result => prediction.innerText = `Prediction: ${result}`),
                    })
                ]
            ),
            h("div", {class: "prediction-container"}, [prediction,]),
        ]
    )
}
