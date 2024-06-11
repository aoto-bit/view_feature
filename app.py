from flask import Flask, render_template, request, jsonify
import h5py
import numpy as np
from filelock import FileLock

app = Flask(__name__)

# HDF5ファイルの設定
file_name = './database.h5'
group_name = "Maze"
dataset_name = "8_8_size"
lock = FileLock(f"{file_name}.lock")

# データ型の定義
dt = np.dtype([
    ('X', np.int32),
    ('Y', np.int32),
    ('angle', np.int32),
    ('conv1', np.float32, (32, 20, 20)),
    ('conv1_relu', np.float32, (32, 20, 20)),
    ('conv2', np.float32, (64, 9, 9)),
    ('conv2_relu', np.float32, (64, 9, 9)),
    ('conv3', np.float32, (64, 7, 7)),
    ('conv3_relu', np.float32, (64, 7, 7)),
    ('conv_flatten', np.float32, (1, 3136)),
    ('noisy_value1', np.float32, (1, 512)),
    ('noisy_value2', np.float32, (1, 51)),
    ('noisy_advantage1', np.float32, (1, 512)),
    ('noisy_advantage2', np.float32, (1, 51)),
    ('output', np.float32, (1, 3, 51))
])

@app.route('/')
def index():
    # ホームページの表示
    return render_template('index.html')

@app.route('/update_position', methods=['POST'])
def update_position():
    # POSTリクエストからデータを取得
    data = request.json
    app.logger.debug(f"Received data: {data}")

    x, y = data['x'], data['y']
    angle = data.get('angle', 0)

    return jsonify(success=True)

@app.route('/get_data', methods=['GET'])
def get_data():
    # GETリクエストからxとyの値を取得
    x = int(request.args.get('x'))
    y = int(request.args.get('y'))
    data_entry = None

    try:
        # HDF5ファイルから指定された位置のデータを検索
        with lock:
            with h5py.File(file_name, 'r') as f:
                dataset = f[group_name][dataset_name]
                app.logger.debug(f"Searching dataset for position x={x}, y={y}")
                for entry in dataset:
                    if entry['X'] == x and entry['Y'] == y:
                        data_entry = entry
                        break
                # app.logger.debug(f"Data entry found: {data_entry}")
    except Exception as e:
        app.logger.error(f"Error fetching data: {e}")
        return jsonify(error=str(e)), 500

    if data_entry is not None:
        try:
            # 検索結果をJSONレスポンスとして準備
            response = {
                'x': x,
                'y': y,
                'angle': int(data_entry['angle']),
                'conv1': data_entry['conv1'].tolist(),
                'conv1_relu': data_entry['conv1_relu'].tolist(),
                'conv2': data_entry['conv2'].tolist(),
                'conv2_relu': data_entry['conv2_relu'].tolist(),
                'conv3': data_entry['conv3'].tolist(),
                'conv3_relu': data_entry['conv3_relu'].tolist(),
                'conv_flatten': data_entry['conv_flatten'].tolist(),
                'noisy_value1': data_entry['noisy_value1'].tolist(),
                'noisy_value2': data_entry['noisy_value2'].tolist(),
                'noisy_advantage1': data_entry['noisy_advantage1'].tolist(),
                'noisy_advantage2': data_entry['noisy_advantage2'].tolist(),
                'output': data_entry['output'].tolist()
            }
            # app.logger.debug(f"Response prepared: {response}")
            return jsonify(response)
        except Exception as e:
            app.logger.error(f"Error preparing JSON response: {e}")
            return jsonify(error=f"Error preparing JSON response: {e}"), 500
    else:
        app.logger.warning(f"No data found for X: {x}, Y: {y}")
        return jsonify(error="Position not found"), 404

if __name__ == '__main__':
    # Flaskアプリケーションを起動
    app.run(debug=True, host='0.0.0.0')
