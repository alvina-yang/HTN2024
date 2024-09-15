from flask import Flask, request, jsonify
from terifai.bot import TerifaiBot  # Import your existing bot implementation

app = Flask(__name__)
bot = None

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/connect', methods=['POST'])
def connect():
    global bot
    if bot is None:
        data = request.json
        room_url = data.get('room_url')
        token = data.get('token')
        if not room_url or not token:
            return jsonify({"error": "Missing room_url or token"}), 400
        
        bot = TerifaiBot(room_url, token)
        bot.start()
        return jsonify({"status": "connected"}), 200
    else:
        return jsonify({"error": "Bot already connected"}), 409

@app.route('/disconnect', methods=['POST'])
def disconnect():
    global bot
    if bot:
        bot.stop()
        bot = None
        return jsonify({"status": "disconnected"}), 200
    else:
        return jsonify({"error": "No active bot connection"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)