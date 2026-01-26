extends Node

# WARNING: Regions must be uniquely identified via integer enum values
enum Region {
	GAME_LANDING = 0,
}

# WARNING: Regions must be appended on end, otherwise all array references to
# doors will not be referenced correctly
var Regions = {
	Region.GAME_LANDING: "res://Areas/GameLanding/game_landing.tscn",
}

var last_active_scene_path: String = ""
var active_scene: Node = null
var active_region: Region = Region.GAME_LANDING

# The starting region is currently the Game Landing
var scene_history: Array[int] = [Region.GAME_LANDING]


# Called when the node enters the scene tree for the first time.
func _ready():
	for region in Regions.keys():
		var areaPath = Regions[region]
		var errorMsg: String = "Unable to load region: " + areaPath;
		assert(ResourceLoader.exists(areaPath), errorMsg);

	var root = get_tree().root
	# Using a negative index counts from the end, so this gets the last child node of `root`.
	active_scene = root.get_child(-1)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	pass

func load_last_region():
	var last_scene = scene_history.back()

	if last_scene != null:
		load_region(last_scene)

# func load_game_over():
	# load_region(Region.GAME_OVER)

# Defer loading the scene to ensure no crashes when cleaning
# up. Will free the previous scene, and load the next
func load_region(path: Region):
	var scene_path = Regions[path] as String
	scene_history.append(path)
	active_region = path

	_deferred_load_scene_by_path.call_deferred(scene_path)

func _deferred_load_scene_by_path(path: String):
	last_active_scene_path = path

	await _cleanup_and_free_active()

	# Load the new scene.
	var s = ResourceLoader.load(path)

	# Instance the new scene.
	active_scene = s.instantiate()

	# Add it to the active scene, as child of root.
	get_tree().root.add_child(active_scene)

func _cleanup_and_free_active():
	if active_scene.has_method("cleanup"):
		await active_scene.cleanup()

	# It is now safe to remove the current scene.
	active_scene.free()
