import {h} from "@/utils/dom";
import * as tf from "@tensorflow/tfjs";

async function drawData(data, width, height, shape) {
    const canvas =
        h("canvas", {
            width: width,
            height: height,
            style: {
                width: `${width}px`,
                height: `${height}px`,
                margin: "4px",
            }
        })
    await tf.browser.toPixels(tf.tensor(data).reshape(shape), canvas);
    return canvas;
}

function drawImage(img, width, height) {
    const canvas =
        h("canvas", {
            width: width,
            height: height,
            style: {margin: "4px",}
        })
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellWidth = canvas.width / img[0].length;
    const cellHeight = canvas.height / img.length;

    img.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell === 1) {
                ctx.fillStyle = 'white';
                ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
            }
        });
    });
    return canvas;
}

function download(obj, filename) {
    const json = JSON.stringify(obj);
    const blob = new Blob([json], {type: 'application/json'});
    const href = URL.createObjectURL(blob);

    const a = h("a");
    a.href = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
}

export {
    download,
    drawData,
    drawImage,
}
