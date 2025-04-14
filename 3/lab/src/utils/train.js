import * as mathjs from "mathjs";
import * as tf from "@tensorflow/tfjs";
import * as vis from "@tensorflow/tfjs-vis";
import { performPCA, projectData } from "@/utils/pca";
import { download } from "@/utils/misc";

let pcaData = null;

/**
 * Downsamples a 3D array of data by applying a specified function to sub-matrices.
 * The function takes each 2x2 block of the input data, processes it through the provided
 * `func`, and outputs a downsampled version of the input data.
 *
 * @param {Array} data - A 3D array representing the image or data to be downsampled.
 *                       The array is expected to be of the form [height][width][channels],
 *                       where `height` is the number of rows, `width` is the number of columns,
 *                       and `channels` is the depth of each pixel (e.g., RGB channels).
 * @param {Function} func - A function to apply to each 2x2 block of data. It takes a submatrix
 *                           (2x2 block of pixels) for each channel and returns a processed value.
 *                           The submatrix passed to `func` will be a 2x2 array, with each
 *                           element being a value from the original data (for each channel).
 *
 * @returns {Array} - A 3D array representing the downsampled data. The output will have reduced
 *                    dimensions (height/2 and width/2), and each value in the output array
 *                    will be the result of applying `func` to a 2x2 block from the input data.
 */
function downSample(data, func) {
    let height = data.length;
    let width = data[0].length;
    let channels = data[0][0].length;

    let result = [];
    for (let i = 0; i < height - 1; i += 2) {
        let row = [];
        for (let j = 0; j < width - 1; j += 2) {
            let pixel = [];
            for (let k = 0; k < channels; k++) {
                // Create a 2x2 submatrix for the current channel
                const subMatrix = [
                    data[i][j][k],
                    data[i][j + 1][k],
                    data[i + 1][j][k],
                    data[i + 1][j + 1][k],
                ];

                pixel.push(func(subMatrix));
            }
            row.push(pixel);
        }
        result.push(row);
    }
    return result;
}

/**
 * Processes the given data by applying downsampling and flattening it.
 *
 * This function first converts the data into a regular array format and then applies a
 * downsampling function (`downSample`) to each element using the `mathjs.max` function
 * to reduce each 2x2 block. The result is then flattened into a 1D array.
 *
 * @param {Array} data - The input data to be processed. This could be a 3D array or
 *                       another data structure that can be converted into an array using
 *                       the `.array()` method.
 * @returns {Promise<Array>} - A promise that resolves to a flattened, downsampled array
 *                              where each element has been processed by the `downSample` function.
 */
async function processData(data) {
    const dataArray = await data.array();
    function customReducer(values) {
        // 结合最大值和平均值的混合策略
        return 0.8 * mathjs.max(values) + 0.2 * mathjs.mean(values);
    }
    const sampled = dataArray.map((d) => downSample(d, customReducer));
    const flattened = sampled.map((d) => d.flat(Infinity));

    return flattened;
}
function augmentData(data) {
    // 可以实现一些简单的数据增强，如微小旋转、缩放或噪声添加
    return data.map((image) => {
        // 添加少量随机噪声
        return image.map((pixel) => pixel + (Math.random() - 0.5) * 0.1);
    });
}

/**
 * Processes test data by downsampling, centering, and projecting it using PCA.
 *
 * This function processes the test data by first applying the `processData` function,
 * which downsamples and flattens the data. It then centers the processed data by subtracting
 * the mean (from `pcaData.mean`) and projects it onto the principal components obtained
 * from PCA (via `pcaData.principalComponents`).
 *
 * @param {Array} data - The input test data to be processed, which will be downsampled,
 *                       centered, and projected.
 * @returns {Promise<Array>} - A promise that resolves to the projected test data,
 *                              after centering and applying the PCA transformation.
 */
async function processTestData(data, pcaData) {
    const processed = await processData(data);
    const centered = mathjs.subtract(processed, pcaData.mean);
    const projected = projectData(centered, pcaData.principalComponents);

    return projected;
}

/**
 * Creates and compiles a simple neural network model using TensorFlow.js.
 *
 * This function defines a sequential neural network model with a single dense layer.
 * The layer has 10 units, uses the 'softmax' activation function, and expects an
 * input shape of size 50. The model is compiled using the Adam optimizer, and
 * categorical cross-entropy is used as the loss function. Accuracy is tracked as
 * a metric during training.
 *
 * @returns {tf.LayersModel} - A compiled TensorFlow.js model with one dense layer
 *                             and the specified optimizer, loss function, and metrics.
 */
function getModel() {
    const model = tf.sequential();

    // 添加隐藏层
    model.add(
        tf.layers.dense({
            units: 128,

            activation: "relu",
            inputShape: [50],
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
        })
    );

    // 添加Dropout层防止过拟合
    model.add(tf.layers.dropout({ rate: 0.3 }));

    // 第二个隐藏层
    model.add(
        tf.layers.dense({
            units: 64,
            activation: "relu",
        })
    );

    // 输出层
    model.add(
        tf.layers.dense({
            units: 10,
            activation: "softmax",
        })
    );

    // 使用学习率衰减的Adam优化器
    const learningRate = 0.001;
    const optimizer = tf.train.adam(learningRate);

    model.compile({
        optimizer: optimizer,
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
    });

    return model;
}

/**
 * Trains the given model on the provided dataset using PCA (Principal Component Analysis)
 * for dimensionality reduction. It prepares the training and testing data, processes them,
 * and fits the model on the training data while validating it on a separate test set.
 *
 * @param {tf.LayersModel} model - The TensorFlow.js model to be trained.
 * @param {Object} data - The dataset object that provides methods to retrieve batches of training and test data.
 * @returns {Promise<tf.History>} - A promise that resolves to the model's training history (loss, accuracy, etc.) after fitting.
 */
async function train(model, data) {
    if (!data.loaded) return;

    const metrics = ["loss", "val_loss", "acc", "val_acc"];
    const container = {
        name: "Model Training",
        tab: "Model",
        styles: { height: "1000px" },
    };
    const fitCallbacks = vis.show.fitCallbacks(container, metrics);
    // 创建早停回调
    const earlyStopCallback = {
        bestValLoss: Infinity, // 初始化为无穷大
        patience: 0, // 初始化耐心计数器
        onEpochEnd: (epoch, logs) => {
            // 如果验证损失改善，重置耐心计数
            if (logs.val_loss < earlyStopCallback.bestValLoss) {
                earlyStopCallback.bestValLoss = logs.val_loss;
                earlyStopCallback.patience = 0;
            } else {
                // 否则增加耐心计数
                earlyStopCallback.patience++;
                if (earlyStopCallback.patience >= 5) {
                    model.stopTraining = true;
                    console.log("提前停止训练");
                }
            }
        },
    };

    const BATCH_SIZE = 128;
    const TRAIN_DATA_SIZE = 10000;
    const TEST_DATA_SIZE = 500;

    const trainSet = tf.tidy(() => {
        const d = data.nextTrainBatch(TRAIN_DATA_SIZE);
        return {
            xs: d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]),
            labels: d.labels,
        };
    });

    pcaData = performPCA(await processData(trainSet.xs), 50);
    download(pcaData, "pca_data.json");

    const trainXs = tf.tensor2d(pcaData.projected);
    const trainYs = trainSet.labels;

    const testSet = tf.tidy(() => {
        const d = data.nextTestBatch(TEST_DATA_SIZE);
        return {
            xs: d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]),
            labels: d.labels,
        };
    });

    const testXs = tf.tensor2d(await processTestData(testSet.xs, pcaData));
    const testYs = testSet.labels;

    return model.fit(trainXs, trainYs, {
        batchSize: BATCH_SIZE,
        validationData: [testXs, testYs],
        epochs: 20,
        shuffle: true,
        callbacks: [fitCallbacks, earlyStopCallback],
    });
}

/**
 * Makes predictions on the test dataset using the trained model.
 *
 * @param {tf.LayersModel} model - The trained model used for making predictions.
 * @param {Object} data - The dataset object that provides methods to retrieve test data.
 * @param {number} [testDataSize=500] - The number of test samples to be used for making predictions.
 * @returns {Promise<Array>} - A promise that resolves to an array containing the predicted labels and the true labels.
 */
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

    const testXs = tf.tensor2d(await processTestData(testSet.xs, pcaData));

    const labels = testSet.labels.argMax(-1);
    const preds = model.predict(testXs).argMax(-1);

    testXs.dispose();
    return [preds, labels];
}

export {
    processData,
    processTestData,
    downSample,
    getModel,
    train,
    doPrediction,
};
