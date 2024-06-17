const outputCanvasWidth = 600; // キャンバスの幅
const outputCanvasHeight = 400; // キャンバスの高さ

function drawOutput(data, canvasId) {
    const canvas = document.getElementById(canvasId);
    canvas.width = outputCanvasWidth;
    canvas.height = outputCanvasHeight;
    const ctx = canvas.getContext('2d');

    // クリアキャンバス
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = ['red', 'green', 'blue'];
    const labels = ['Output 1', 'Output 2', 'Output 3'];

    // データの長さを取得
    const length = data[0][0].length;

    // x座標を計算
    const xStep = canvas.width / length;

    // y座標のスケールを計算
    const yMax = 1;
    const yMin = 0;
    const yRange = yMax - yMin;
    const yScale = canvas.height / yRange;

    data[0].forEach((output, index) => {
        ctx.beginPath();
        ctx.strokeStyle = colors[index];
        output.forEach((value, i) => {
            const x = i * xStep;
            const y = canvas.height - (value - yMin) * yScale;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    });

    // 横軸と縦軸のラベル
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText('Action Value', canvas.width / 2 - 50, canvas.height - 10);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Action Probability', -canvas.height / 2 - 50, 20);
    ctx.restore();

    // 凡例を描画
    labels.forEach((label, index) => {
        ctx.fillStyle = colors[index];
        ctx.fillText(label, canvas.width + 10, 20 * (index + 1));
    });
}
