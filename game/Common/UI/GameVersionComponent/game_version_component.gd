class_name GameVersion
extends MarginContainer

@onready var game_version: Label = %GameVersion

func _ready():
	game_version.text += ProjectSettings.get_setting("application/config/version")
