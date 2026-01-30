extends CanvasLayer

@onready var _send_message_btn: Button = %Button

var _config_path = "res://latest-deploy.json"
var _log: ATLogger = ATLogger.new("GameFinder")
var _socket: WebSocketPeer = WebSocketPeer.new()

enum FinderState {
	CONNECTING = 0,
	CONNECTED = 1,
	ERROR = 2,
	CLOSED = 3,
}
var _state: FinderState = FinderState.CONNECTING
var _error: String = ""

func _set_error(msg: String, err = "") -> void:
	_state = FinderState.ERROR
	_error = msg
	# TODO: Update UI with error state
	_log.error(err, err)


func _ready() -> void:
	_send_message_btn.pressed.connect(_send_test_message)

	var server = _load_json(_config_path)
	if server == null:
		_set_error("Can't find server")
		return

	var ws_url: String = server["banguins-app"]["websocketapiendpoint"]
	if !(ws_url is String):
		_set_error("Unable to retrieve websocket URL")
		return

	ws_url = ws_url + "?gameId=ABC12&userId=Godot"
	var err := _socket.connect_to_url(ws_url)
	if err != OK:
		_set_error("Unable to connect to Websocket: ", err)
		return
	
	# Show Connecting State
	_state = FinderState.CONNECTING

func _process(_delta: float) -> void:
	if _state == FinderState.CLOSED or _state == FinderState.ERROR:
		return

	# Poll socket for state and data
	_socket.poll()

	match _socket.get_ready_state():
		WebSocketPeer.STATE_CONNECTING:
			# Show Connecting State
			_log.info("Websocket starting to connect")
			pass
		
		WebSocketPeer.STATE_OPEN:
			# Read all packets
			while _socket.get_available_packet_count() > 0:
				var data: PackedByteArray = _socket.get_packet()
				var text := data.get_string_from_utf8()
				_log.info("Received Websocket data: ", text)	
			pass

		WebSocketPeer.STATE_CLOSING, WebSocketPeer.STATE_CLOSED:
			_log.info("Websocket is closing")
			_socket.close()
			_state = FinderState.CLOSED
			pass

func _exit_tree() -> void:
	if _socket.get_ready_state() == WebSocketPeer.STATE_OPEN:
		_socket.close()

func _send_test_message() -> void:
	if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		_log.warn("Unable to send test message, socket is not open")
		return

	var msg: Dictionary[String, String] = {
		"action": "sendmessage",
		"data": "Godot Test",
	}

	_socket.send_text(JSON.stringify(msg))

	
func _load_json(path: String) -> Variant:
	if not FileAccess.file_exists(path):
		_log.error("Unable to find path: ", path)
		return null
	
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		_log.error("Could not open file: ", path)
		return null

	var text := file.get_as_text()
	file.close()

	var json := JSON.new()
	var err := json.parse(text)

	if err != OK:
		_log.error("Unable to parse JSON: ", json.get_error_message())
		return null

	return json.data
