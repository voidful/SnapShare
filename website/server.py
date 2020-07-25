from flask import Flask, send_from_directory, Response, send_file, request
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
import os

static_dir = os.path.abspath('./build/')
app = Flask(__name__, static_folder=static_dir)
socket = SocketIO(app, cors_allowed_origins='*')
CORS(app)


@app.route('/')
def index() -> Response:
    return send_file(os.path.join(static_dir, 'index.html'))


@app.route('/<path:path>')
def static_proxy(path: str) -> Response:
    if static_dir is not None:
        return send_from_directory(static_dir, path)
    else:
        return send_file(os.path.join(static_dir, 'index.html'))


@socket.on('connect')
def on_connect():
    print('user connected')
    retrieve_active_users()


def retrieve_active_users():
    emit('retrieve_active_users', broadcast=True)


@socket.on('activate_user')
def on_active_user(data):
    user = data.get('username')
    emit('user_activated', {'user': user}, broadcast=True)


@socket.on('deactivate_user')
def on_inactive_user(data):
    user = data.get('username')
    emit('user_deactivated', {'user': user}, broadcast=True)


@socket.on('join_room')
def on_join(data):
    room = data['token']
    join_room(room)
    emit('open_room', {'room': room}, broadcast=True)
    print('join room', room)


@socket.on('send_message')
def on_chat_sent(data):
    room = data['token']
    emit('message_sent', data, room=room)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 80))
    socket.run(app, host='0.0.0.0', port=port)
