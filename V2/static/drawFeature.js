function drawFeatureMap(data, containerId) {
    console.log(`Drawing feature map for container ${containerId}:`, data); // コンソールにデータを出力
    console.log(`Shape of feature map data:`, getShape(data)); // データの形状を出力
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const shape = getShape(data);
    if (shape.length === 2 && shape[0] === 1) {
        // 1次元データの場合の処理
        draw1DFeatureMap(data, container, shape[1]);
    } else {
        // 2次元データの場合の処理
        draw2DFeatureMap(data, container);
    }
}

function draw1DFeatureMap(data, container, length) {
    const height = Math.sqrt(length);
    const width = height;

    const canvasSize = 200; // キャンバスのサイズを大きく設定
    const imageScale = 5; // 画像のスケールを設定

    const canvas = document.createElement('canvas');
    canvas.width = width * imageScale;
    canvas.height = height * imageScale;
    const ctx = canvas.getContext('2d');

    const imageData = ctx.createImageData(width, height);

    for (let i = 0; i < length; i++) {
        const x = i % width;
        const y = Math.floor(i / width);
        const index = (y * width + x) * 4;
        const value = (data[0][i] + 1) / 2; // 0-1に正規化
        const color = interpolateColor([75, 0, 130], [255, 255, 0], value); // 青紫から黄色へ補間
        imageData.data[index] = color[0];        // R
        imageData.data[index + 1] = color[1];    // G
        imageData.data[index + 2] = color[2];    // B
        imageData.data[index + 3] = 255;         // A
    }

    ctx.putImageData(imageData, 0, 0);

    // スケールを適用して画像を描画
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = width * imageScale;
    scaledCanvas.height = height * imageScale;
    const scaledCtx = scaledCanvas.getContext('2d');
    scaledCtx.scale(imageScale, imageScale);
    scaledCtx.drawImage(canvas, 0, 0);

    container.appendChild(scaledCanvas);
}

function draw2DFeatureMap(data, container) {
    const numChannels = data[0].length; // チャンネルの数（例: 32）
    const height = data[0][0].length; // 画像の高さ（例: 20）
    const width = data[0][0][0].length; // 画像の幅（例: 20）

    const canvasSize = 200; // キャンバスのサイズを大きく設定
    const imageSpacing = 20; // 画像同士の距離を設定
    const imageScale = 5; // 画像のスケールを設定

    for (let i = 0; i < numChannels; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = width * imageScale;
        canvas.height = height * imageScale;
        canvas.style.margin = `${imageSpacing}px`;
        const ctx = canvas.getContext('2d');

        const imageData = ctx.createImageData(width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const value = (data[0][i][y][x] + 1) / 2; // 0-1に正規化
                const color = interpolateColor([75, 0, 130], [255, 255, 0], value); // 青紫から黄色へ補間
                imageData.data[index] = color[0];        // R
                imageData.data[index + 1] = color[1];    // G
                imageData.data[index + 2] = color[2];    // B
                imageData.data[index + 3] = 255;         // A
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // スケールを適用して画像を描画
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = width * imageScale;
        scaledCanvas.height = height * imageScale;
        const scaledCtx = scaledCanvas.getContext('2d');
        scaledCtx.scale(imageScale, imageScale);
        scaledCtx.drawImage(canvas, 0, 0);

        container.appendChild(scaledCanvas);
    }
}

function interpolateColor(color1, color2, factor) {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
    }
    return result;
}
