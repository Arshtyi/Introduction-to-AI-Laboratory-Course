import * as tf from "@tensorflow/tfjs";
import * as vis from "@tensorflow/tfjs-vis";

function getModel() {
    const model = tf.sequential();
    const IMAGE_WIDTH = 28;
    const IMAGE_HEIGHT = 28;
    const IMAGE_CHANNELS = 1;
    model.add(
        tf.layers.conv2d({
            inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
            padding: "same",
            kernelSize: 3,
            filters: 32,
            activation: "relu",
        })
    );
    model.add(tf.layers.avgPooling2d({ poolSize: 2, strides: 2 }));
    model.add(
        tf.layers.conv2d({
            filters: 64,
            kernelSize: 3,
            padding: "same",
            activation: "relu",
        })
    );
    model.add(tf.layers.avgPooling2d({ poolSize: 2, strides: 2 }));
    model.add(tf.layers.flatten());
    model.add(
        tf.layers.dense({
            units: 128,
            activation: "relu",
        })
    );
    model.add(
        tf.layers.dense({
            units: 64,
            activation: "relu",
        })
    );
    model.add(
        tf.layers.dense({
            units: 10, // Assuming 10 classes for output
            activation: "softmax", // Using softmax for multi-class classification
        })
    );
    const optimizer = tf.train.adam();
    model.compile({
        optimizer: optimizer,
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
    });
    return model;
}

async function train(model, data) {
    if (!data.loaded) return;

    const metrics = ["loss", "val_loss", "acc", "val_acc"];
    const container = {
        name: "Model Training",
        tab: "Model",
        styles: { height: "1000px" },
    };
    const fitCallbacks = vis.show.fitCallbacks(container, metrics);

    const BATCH_SIZE = 550;
    const TRAIN_DATA_SIZE = 5500;
    const TEST_DATA_SIZE = 1000;

    const trainSet = tf.tidy(() => {
        const d = data.nextTrainBatch(TRAIN_DATA_SIZE);
        return {
            xs: d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]),
            labels: d.labels,
        };
    });

    const trainXs = trainSet.xs;
    const trainYs = trainSet.labels;

    const testSet = tf.tidy(() => {
        const d = data.nextTestBatch(TEST_DATA_SIZE);
        return {
            xs: d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]),
            labels: d.labels,
        };
    });

    const testXs = testSet.xs;
    const testYs = testSet.labels;

    return model.fit(trainXs, trainYs, {
        batchSize: BATCH_SIZE,
        validationData: [testXs, testYs],
        epochs: 10,
        shuffle: true,
        callbacks: fitCallbacks,
    });
}

async function doPrediction(model, data, testDataSize = 500) {
    const IMAGE_WIDTH = 28;
    const IMAGE_HEIGHT = 28;

    const testSet = tf.tidy(() => {
        const d = data.nextTestBatch(testDataSize);
        return {
            xs: d.xs.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1]),
            labels: d.labels,
        };
    });

    const testXs = testSet.xs;

    const labels = testSet.labels.argMax(-1);
    const preds = model.predict(testXs).argMax(-1);

    testXs.dispose();
    return [preds, labels];
}

export { getModel, train, doPrediction };
