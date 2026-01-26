extends MarginContainer

@onready var toggle_fullscreen: TextureButton = %ToggleFullscreen

func _ready() -> void:
	if DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN:
		toggle_fullscreen.button_pressed = true

	toggle_fullscreen.toggled.connect(_on_fullscreen_toggled)

func _on_fullscreen_toggled(toggled_on: bool):
	if toggled_on:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
	else:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
