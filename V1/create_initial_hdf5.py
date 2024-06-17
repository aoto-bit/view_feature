import h5py
import numpy as np
from filelock import FileLock

# HDF5ファイルの設定
file_name = './database.h5'
group_name = "Maze"
dataset_name = "8_8_size"
lock = FileLock(f"{file_name}.lock")

# 拡張されたデータ型の定義
dt = np.dtype([
    ('X', np.int32),
    ('Y', np.int32),
    ('angle', np.int32),
    ('first_person_view', np.float32, (60, 100)),
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

def create_initial_data():
    initial_data = []
    # 8x8のグリッドと24の角度の初期データを作成
    for x in range(8):
        for y in range(8):
            for angle in range(24):
                data = (
                    x, 
                    y, 
                    angle,
                    np.random.rand(60, 100).astype(np.float32),
                    np.random.rand(32, 20, 20).astype(np.float32),
                    np.random.rand(32, 20, 20).astype(np.float32),
                    np.random.rand(64, 9, 9).astype(np.float32),
                    np.random.rand(64, 9, 9).astype(np.float32),
                    np.random.rand(64, 7, 7).astype(np.float32),
                    np.random.rand(64, 7, 7).astype(np.float32),
                    np.random.rand(1, 3136).astype(np.float32),
                    np.random.rand(1, 512).astype(np.float32),
                    np.random.rand(1, 51).astype(np.float32),
                    np.random.rand(1, 512).astype(np.float32),
                    np.random.rand(1, 51).astype(np.float32),
                    np.random.rand(1, 3, 51).astype(np.float32)
                )
                initial_data.append(data)
    return initial_data

initial_data = create_initial_data()  # 初期データを生成

with lock:  # ロックを取得してHDF5ファイルにアクセス
    with h5py.File(file_name, 'a') as f:  # 'a'モードを使用してファイルが存在する場合は追記
        # グループが存在するか確認
        if group_name in f:
            group = f[group_name]
        else:
            # グループが存在しない場合は新規作成
            group = f.create_group(group_name)
            print(f"Created new group '{group_name}'")

        # データセットが存在するか確認
        if dataset_name in group:
            # データセットが存在する場合
            response = input(f"The dataset '{dataset_name}' already exists in group '{group_name}'. Do you want to overwrite it? (yes/no): ").strip().lower()
            if response == 'yes':
                del group[dataset_name]  # 既存のデータセットを削除
                dataset = group.create_dataset(dataset_name, shape=(0,), maxshape=(None,), dtype=dt)
                print(f"Overwritten dataset '{dataset_name}' in group '{group_name}'")
            else:
                print(f"Kept existing dataset '{dataset_name}' in group '{group_name}'")
                dataset = group[dataset_name]  # 既存のデータセットを使用
        else:
            # データセットが存在しない場合は新規作成
            dataset = group.create_dataset(dataset_name, shape=(0,), maxshape=(None,), dtype=dt)
            print(f"Created new dataset '{dataset_name}' in group '{group_name}'")
        
        # 初期データを一つずつデータセットに追加
        for data in initial_data:
            dataset.resize((dataset.shape[0] + 1,))
            dataset[-1] = data

print("Initial data added one by one.")  # 初期データの追加完了を表示
