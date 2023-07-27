from flask import Flask
from flask_socketio import SocketIO

from utils.progress_logger import ProgressLogger

try:
    from ai.audio import AudioAI
    audioAI: AudioAI | None = None
    supports_audio_ai = True
except:
    supports_audio_ai = False
    pass

MAX_BUFFER_SIZE = 50 * 1024 * 1024 # 50MB
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(
    app,
    cors_allowed_origins='*',
    async_mode='threading',
    logger=False,
    engineio_logger=False,
    max_http_buffer_size=MAX_BUFFER_SIZE
)

@socketio.on('connect')
def connect():
    print('client has connected')

def runner(data):
    socketio.emit('get_progress', { 'data': 'test2' })
    # TODO WHAT IF THROWS
    if data['type'] == 'music':
        # TODO IF DOESN'T SUPPORT IT SHOULD SAY SO
        if not supports_audio_ai:
            pass

        global audioAI
        if audioAI is None:
            audioAI = AudioAI()
        with ProgressLogger(socketio, audioAI):
            audioAI.generate(data)
    socketio.emit('new_job')

@socketio.on('new_job')
def new_job(data):
    runner(data)
        
if __name__ == '__main__':
    socketio.run(app, host='127.0.0.1', port=5000)
