const canvasWidth = 160; // キャンバスの幅
const canvasHeight = 120; // キャンバスの高さ

function fetchObservation() {
    fetch('/get-observation')
        .then(response => response.json())
        .then(data => {
            console.log('Observation data:', data); // コンソールにデータを出力
            drawObservation(data);
        })
        .catch(error => console.error('Error fetching observation data:', error));
}

function drawObservation(data) {
    const canvas = document.getElementById('observation-canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(canvas.width, canvas.height);

    // データをリサイズ
    const resizedData = resizeData(data, 80, 60, canvasWidth, canvasHeight);

    // resizedDataを1次元配列に変換してImageDataに設定
    for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
            const index = (y * canvasWidth + x) * 4;
            imageData.data[index] = resizedData[y][x][0];       // R
            imageData.data[index + 1] = resizedData[y][x][1];   // G
            imageData.data[index + 2] = resizedData[y][x][2];   // B
            imageData.data[index + 3] = 255;                    // A
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function resizeData(data, originalWidth, originalHeight, newWidth, newHeight) {
    const resizedData = new Array(newHeight).fill().map(() => new Array(newWidth).fill().map(() => new Array(3).fill(0)));
    for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
            const origX = Math.floor(x * originalWidth / newWidth);
            const origY = Math.floor(y * originalHeight / newHeight);
            if (data[origY] && data[origY][origX]) {
                resizedData[y][x] = data[origY][origX];
            }
        }
    }
    return resizedData;
}

document.addEventListener('DOMContentLoaded', fetchObservation);
