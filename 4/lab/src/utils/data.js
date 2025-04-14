import * as tf from '@tensorflow/tfjs';

const CONFIG = {
    IMAGE_SIZE: 28 * 28,
    NUM_CLASSES: 10,
    NUM_DATASET_ELEMENTS: 65000,
    TRAIN_TEST_RATIO: 5 / 6,
    MNIST_IMAGES_PATH: "mnist_dataset/mnist_images.png",
    MNIST_LABELS_PATH: "mnist_dataset/mnist_labels_uint8",
}

const NUM_TRAIN_ELEMENTS = Math.floor(CONFIG.TRAIN_TEST_RATIO * CONFIG.NUM_DATASET_ELEMENTS);
const NUM_TEST_ELEMENTS = CONFIG.NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS;

export class MnistData {
    constructor() {
        this.loaded = false;
        this.shuffledTrainIndex = 0;
        this.shuffledTestIndex = 0;
    }

    async load() {
        await Promise.all([this.loadImage(), this.loadLabel()]);

        this.trainIndices = tf.util.createShuffledIndices(NUM_TRAIN_ELEMENTS);
        this.testIndices = tf.util.createShuffledIndices(NUM_TEST_ELEMENTS);

        this.trainImages = this.datasetImages.slice(0, CONFIG.IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
        this.testImages = this.datasetImages.slice(CONFIG.IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
        this.trainLabels = this.datasetLabels.slice(0, NUM_TRAIN_ELEMENTS * CONFIG.NUM_CLASSES);
        this.testLabels = this.datasetLabels.slice(NUM_TRAIN_ELEMENTS * CONFIG.NUM_CLASSES);
        this.loaded = true;
    }

    async loadImage() {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const imgRequest = new Promise((resolve, reject) => {
            img.src = CONFIG.MNIST_IMAGES_PATH;
            img.onload = () => {
                img.width = img.naturalWidth;
                img.height = img.naturalHeight;
                this.processImageData(img, canvas);
                resolve();
            };
        });
        await imgRequest;
    }

    async processImageData(img, canvas) {
        const datasetBytesBuffer = new ArrayBuffer(CONFIG.NUM_DATASET_ELEMENTS * CONFIG.IMAGE_SIZE * 4);
        const chunkSize = 5000;
        canvas.width = img.width;
        canvas.height = chunkSize;

        const ctx = canvas.getContext('2d');
        for (let i = 0; i < CONFIG.NUM_DATASET_ELEMENTS / chunkSize; i++) {
            const datasetBytesView =
                new Float32Array(
                    datasetBytesBuffer,
                    i * CONFIG.IMAGE_SIZE * chunkSize * 4,
                    CONFIG.IMAGE_SIZE * chunkSize
                );
            ctx.drawImage(img, 0, i * chunkSize, img.width, chunkSize, 0, 0, img.width, chunkSize);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let j = 0; j < imageData.data.length / 4; j++) {
                datasetBytesView[j] = imageData.data[j * 4] / 255;
            }
        }
        this.datasetImages = new Float32Array(datasetBytesBuffer);
    }

    async loadLabel() {
        const labelRequest = new Promise(async (resolve, reject) => {
            const label = await fetch(CONFIG.MNIST_LABELS_PATH)
            await this.processLabelData(label);
            resolve();
        })
        await labelRequest;
    }

    async processLabelData(label) {
        const labelData = await label.arrayBuffer();
        this.datasetLabels = new Uint8Array(labelData);
    }

    nextTrainBatch(batchSize) {
        return this.nextBatch(batchSize, [this.trainImages, this.trainLabels],
            () => {
                this.shuffledTrainIndex = (this.shuffledTrainIndex + 1) % this.trainIndices.length;
                return this.trainIndices[this.shuffledTrainIndex];
            });
    }

    nextTestBatch(batchSize) {
        return this.nextBatch(batchSize, [this.testImages, this.testLabels],
            () => {
                this.shuffledTestIndex = (this.shuffledTestIndex + 1) % this.testIndices.length;
                return this.testIndices[this.shuffledTestIndex];
            });
    }

    nextBatch(batchSize, data, getNextIndex) {
        const batchImagesArray = new Float32Array(batchSize * CONFIG.IMAGE_SIZE);
        const batchLabelsArray = new Uint8Array(batchSize * CONFIG.NUM_CLASSES);

        for (let i = 0; i < batchSize; i++) {
            const idx = getNextIndex();
            const image = data[0].slice(idx * CONFIG.IMAGE_SIZE, (idx + 1) * CONFIG.IMAGE_SIZE);
            const label = data[1].slice(idx * CONFIG.NUM_CLASSES, (idx + 1) * CONFIG.NUM_CLASSES);

            batchImagesArray.set(image, i * CONFIG.IMAGE_SIZE);
            batchLabelsArray.set(label, i * CONFIG.NUM_CLASSES);
        }

        const xs = tf.tensor2d(batchImagesArray, [batchSize, CONFIG.IMAGE_SIZE]);
        const labels = tf.tensor2d(batchLabelsArray, [batchSize, CONFIG.NUM_CLASSES]);

        return {xs, labels};
    }
}
