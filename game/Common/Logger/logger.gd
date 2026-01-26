class_name ATLogger

var name: String = ""
var group: String = ""

# Handles localized logging via groups and other components

func _init(logger_name: String):
	name = logger_name

func set_group(target_group: String):
	group = target_group;

func set_default_group():
	group = ""

func error(arg1 = "", arg2 = "", arg3 = "", arg4 = "", arg5 = "", arg6 = "", arg7 = "", arg8 = ""):
	if !LogManager.is_active_log_level(LogManager.LogLevel.Error):
		return

	if !LogManager.is_active_log_group(group):
		return
	
	push_error(name + ":: " + str(arg1) + str(arg2) + str(arg3) + str(arg4) + str(arg5) + str(arg6) + str(arg7) + str(arg8))

func warn(arg1 = "", arg2 = "", arg3 = "", arg4 = "", arg5 = "", arg6 = "", arg7 = "", arg8 = ""):
	if !LogManager.is_active_log_level(LogManager.LogLevel.Warning):
		return

	if !LogManager.is_active_log_group(group):
		return
	
	push_warning(name + ":: " + str(arg1) + str(arg2) + str(arg3) + str(arg4) + str(arg5) + str(arg6) + str(arg7) + str(arg8))

func info(arg1 = "", arg2 = "", arg3 = "", arg4 = "", arg5 = "", arg6 = "", arg7 = "", arg8 = ""):
	if !LogManager.is_active_log_level(LogManager.LogLevel.Info):
		return

	if !LogManager.is_active_log_group(group):
		return
	
	var base_str = name + ":: " + str(arg1) + str(arg2) + str(arg3) + str(arg4) + str(arg5) + str(arg6) + str(arg7) + str(arg8)
	print_rich("[color=green]" + base_str + "[/color]")

func debug(arg1 = "", arg2 = "", arg3 = "", arg4 = "", arg5 = "", arg6 = "", arg7 = "", arg8 = ""):
	if !LogManager.is_active_log_level(LogManager.LogLevel.Debug):
		return

	if !LogManager.is_active_log_group(group):
		return
	
	print(name + ":: " + str(arg1) + str(arg2) + str(arg3) + str(arg4) + str(arg5) + str(arg6) + str(arg7) + str(arg8))

func verbose(arg1 = "", arg2 = "", arg3 = "", arg4 = "", arg5 = "", arg6 = "", arg7 = "", arg8 = ""):
	if !LogManager.is_active_log_level(LogManager.LogLevel.Verbose):
		return

	if !LogManager.is_active_log_group(group):
		return
	
	var base_str = name + ":: " + str(arg1) + str(arg2) + str(arg3) + str(arg4) + str(arg5) + str(arg6) + str(arg7) + str(arg8)
	print_rich("[color=gray]" + base_str + "[/color]")
