function drawNoisyLayers(data, containerId) {
    console.log(`Drawing noisy layers for container ${containerId}:`, data); // コンソールにデータを出力
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const canvasWidth = Math.max(...Object.values(data).map(layer => layer[0].length)) * 2; // 最大データ長に基づいてキャンバスの幅を設定
    const canvasHeight = Object.keys(data).length * 40 * 2; // 各レイヤーの偶数行と奇数行のためにキャンバスの高さを設定

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.margin = `20px`;
    const ctx = canvas.getContext('2d');

    let yOffset = 20;

    for (const layer in data) {
        const layerData = data[layer];
        const maxVal = Math.max(...layerData[0]);
        const minVal = Math.min(...layerData[0]);
        const range = maxVal - minVal;

        // 偶数行に画像を描画
        for (let i = 0; i < layerData[0].length; i++) {
            const x = i * canvas.width / layerData[0].length;
            const normalizedValue = (layerData[0][i] - minVal) / range;
            const color = interpolateColor([75, 0, 130], [255, 255, 0], normalizedValue); // 青紫から黄色へ補間
            ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            ctx.fillRect(x, yOffset, 2, 10); // 数直線として描画
        }

        yOffset += 40; // 次の行のためのオフセットを調整

        // 奇数行に数直線を描画
        ctx.strokeStyle = '#000000'; // 黒色で数直線を描画
        ctx.beginPath();
        ctx.moveTo(0, yOffset + 5);
        ctx.lineTo(canvas.width, yOffset + 5);
        ctx.stroke();

        // 0とデータサイズの値を描画
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.fillText('0', 0, yOffset + 20);
        ctx.fillText(layerData[0].length, canvas.width - ctx.measureText(layerData[0].length.toString()).width, yOffset + 20);

        yOffset += 40; // 次の行のためのオフセットを調整
    }

    container.appendChild(canvas);
}

function interpolateColor(color1, color2, factor) {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
    }
    return result;
}
