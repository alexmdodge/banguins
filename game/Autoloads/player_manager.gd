extends Node

var _log: ATLogger = ATLogger.new("PlayerManager")

# High level manager of all player state like inventory, classes, party, quests, etc.
# var inventory: Inventory = Inventory.new()

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
#  PlayerManager -- Inventory
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

func add_loot_to_inv(): #loot: Loot):
	_log.info("Updating loot value")
	_emit_updated()

func _emit_updated():
	_log.verbose("Updating all subscribers")
	get_tree().call_group("PlayerManagerSubscriber", "player_manager_updated")
