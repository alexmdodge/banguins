extends Node

# High level manager of game state, in particular timing and other game related
# metadata properties live saving and persisting state between sessions.

const SECONDS_PER_MINUTE: float = 60
const MINUTES_PER_HOUR: float = 60

const GAME_TICK_SECONDS: float = 1
const GAME_TICK_MINUTES: float = GAME_TICK_SECONDS / SECONDS_PER_MINUTE
const GAME_TICK_HOURS: float = GAME_TICK_MINUTES / MINUTES_PER_HOUR

var _session_timer: Timer = Timer.new()
var _session_time_seconds: float = 0
var _total_time_seconds: float = 0

#var _spawns: Dictionary[SceneManager.Region, ATGameStateSpawns] = {}
#var _log: ATLogger = ATLogger.new("<<<GAME_MANAGER>>>")

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
#  GameManager -- Initialization
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

func _ready() -> void:
	_session_timer.wait_time = GAME_TICK_SECONDS
	_session_timer.autostart = true
	_session_timer.one_shot = false

	add_child(_session_timer)
	_session_timer.timeout.connect(_on_game_tick)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
#  GameManager -- Time
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

func _on_game_tick():
	_session_time_seconds += GAME_TICK_SECONDS
	_total_time_seconds += GAME_TICK_SECONDS

# Returns a rounded integer session time in seconds
func get_session_time_elapsed() -> int:
	return int(_session_time_seconds)

# Returns a rounded integer total game time in seconds
func get_save_time_elapsed() -> int:
	return int(_total_time_seconds)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
#  GameManager -- Save / Load
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

func save():
	return

func load_saves():
	# Retrieve list of available save files
	return

func load_save(_id: String):
	# Retrieve data for a particular save file
	return
