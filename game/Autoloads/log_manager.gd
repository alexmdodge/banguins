class_name ATLogManager
extends Node

enum LogLevel {
	Error = 0,
	Warning = 1,
	Info = 2,
	Debug = 3,
	Verbose = 4,
}

static var level = LogLevel.Debug
static var groups: Array[String] = ['']

# FIXME: For some reason the web build template syntax isn't working. For now
# any builds that are run just assume release
static var is_debug_mode = OS.has_feature("template")

func set_log_level(new_level: LogLevel) -> void:
	level = new_level

func add_log_group(new_group: String) -> void:
	if groups.has(new_group):
		return

	groups.append(new_group)

func remove_log_group(old_group: String) -> void:
	if !groups.has(old_group):
		return

	groups.erase(old_group)

func is_active_log_group(check_group: String) -> bool:
	return groups.has(check_group)

func is_active_log_level(check_level: int) -> bool:
	# Always list errors as active
	if check_level == 0:
		return true

	# Otherwise disallow logging in non-debug builds
	if !OS.is_debug_build():
		return false

	return check_level <= level
