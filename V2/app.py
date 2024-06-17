import matplotlib
matplotlib.use('Agg')  # これを追加
import matplotlib.pyplot as plt

import gymnasium as gym
import miniworld

import numpy as np
from flask import Flask, render_template, send_file, jsonify

import io, math

import torch
import torch.nn as nn

# from rainbow.models.noisy_linear import NoisyLinear
# from rainbow.models.rainbow_dqn import RainbowDQN
# from rainbow.functions.resize import re_size

from surgeon_pytorch import Inspect, get_layers

from flask import request

# グローバル変数を定義
action = None
state = None

# Flaskアプリケーションの初期化
app = Flask(__name__)

# MiniWorld環境の初期化
env = gym.make('MiniWorld-Hallway-v0', render_mode='rgb_array')

state, _ = env.reset()
observation = state
# state = re_size(state, 1)
# num_atoms = 51
# Vmin = 0
# Vmax = 5
# model = RainbowDQN(state, env.action_space.n, num_atoms, Vmin, Vmax).cuda()

model = None # 任意の学習済みモデル

# モデルの読み込み
model_path = ''
model.load_state_dict(torch.load(model_path))
model.eval()  # モデルを推論モードに設定

layer_names = [i for i in get_layers(model)]

# 辞書の初期化
layer_outputs = {}

# フォワードフックを使用して各層の出力を取得
def get_activation(name):
    def hook(model, input, output):
        layer_outputs[name] = output.detach().cpu().numpy()
    return hook

# 各層にフックを登録
hooks = []
for name in layer_names:
    layer = dict([*model.named_modules()])[name]
    hooks.append(layer.register_forward_hook(get_activation(name)))

def get_viewer(state):
    global layer_outputs
    layer_outputs = {}  # 毎回初期化

    with torch.no_grad():
        _ = model(state)

    return layer_outputs

@app.route('/')
def index():
    return render_template('index.html', layer_names=layer_names)

@app.route('/get-data/<layer_name>')
def get_data(layer_name):
    global state
    layer_outputs = get_viewer(state)
    
    if layer_name not in layer_outputs:
        return "Layer not found", 404

    output = layer_outputs[layer_name]
    print(f"layer_name:{layer_name}")
    print(f"layer_shape:{layer_outputs[layer_name].shape}")
    return jsonify(output.tolist())

@app.route('/get-noisy-data')
def get_noisy_data():
    global state
    layer_outputs = get_viewer(state)
    
    noisy_layers = ['noisy_value1', 'noisy_value2', 'noisy_advantage1', 'noisy_advantage2']
    noisy_data = {layer: layer_outputs[layer].tolist() for layer in noisy_layers if layer in layer_outputs}
    
    return jsonify(noisy_data)

@app.route('/get-observation')
def get_observation():
    global observation
    observation_list = observation.tolist()  # JSONに変換できるようにリストに変換
    return jsonify(observation_list)


@app.route('/set-action', methods=['POST'])
def set_action():
    global action, state, observation
    key = request.json.get('key')
    action_list = {"left": 0, "up": 2, "right": 1}
    action = action_list.get(key)
    state, reward, done, info , _= env.step(action)

    # print(state)
    print(env.agent.dir, env.agent.pos)
    print(env.render().T)
    print
    image = Image.fromarray(env.render())
    # image.save('random_image.png')

    observation = state  # 現在の観測データを更新
    state = re_size(state, 1)

    # image = Image.fromarray(env.observation_space)
    image.save('random_image.png')

    return jsonify({'action': action, 'state': state.tolist()})

@app.route('/reset-environment', methods=['POST'])
def reset_environment():
    global state, observation, action
    state, _ = env.reset()
    observation = state
    state = re_size(state, 1)
    action = None  # リセット後のアクションはNoneに設定
    return jsonify({'state': state.tolist()})

from PIL import Image
@app.route('/get-agent-data')
def get_agent_data():
    # env.unwrapped.agentまたはenv.get_wrapper_attr('agent')を使用
    agent = env.unwrapped.agent
    # print(env.observation_space)
    position = [round(i, 2) for i in agent.pos]  # JSONに変換できるようにリストに変換
    angle = int(agent.dir * (180 / math.pi))
    return jsonify({'position': position, 'angle': angle})

@app.route('/get-model-output')
def get_model_output():
    global state
    outputs = model(state)
    outputs = outputs.detach().cpu().numpy().tolist()  # JSONに変換できるようにリストに変換
    return jsonify(outputs)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8082)
