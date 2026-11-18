// ============================================================================
// EXAMPLE MOD — GAME BALANCE
// ============================================================================
// This mod demonstrates changing actual gameplay logic by overriding
// GameMaker's global gml_* functions.
//
// HOW IT WORKS:
//   All game logic lives in global functions like gml_Script_s_throw_ball.
//   Because this script runs AFTER RetroBowl.js, redefining those functions
//   replaces the original behavior.
//
// HOW TO FIND MORE FUNCTIONS TO OVERRIDE:
//   Open html5game/RetroBowl.js and search for "function gml_Script_s_"
//   or "function gml_Object_". Any function you redefine here takes effect.
// ============================================================================

// ----------------------------------------------------------------------------
// Example 1: Override a global variable
// ----------------------------------------------------------------------------
// The engine stores some settings in global.gml*. Find them by searching
// RetroBowl.js for "global.gml".
//
// Uncomment and edit to taste:

// global.gmlmaster_ball = -4;           // master ball variable
// global.gmlpoki = false;               // disable poki integration


// ----------------------------------------------------------------------------
// Example 2: Override a gameplay function
// ----------------------------------------------------------------------------
// Let's say you want to change how XP is awarded in QB mode.
// Find the function in RetroBowl.js:
//
//   search: function gml_Script_s_qb_mode_auto_xp
//
// Then redefine it here. The original signature is:
//   function gml_Script_s_qb_mode_auto_xp(_inst, _other, argument0, argument1, argument2, argument3)
//
// Below is a SKELETON — replace the body with your own logic:
//

/*
function gml_Script_s_qb_mode_auto_xp(_inst, _other, argument0, argument1, argument2, argument3) {
    // Your custom XP logic here.
    // Call the original by copying its body from RetroBowl.js and editing it.
    console.log("[Mod] Custom QB auto XP running");
    // example: always add skill
    gml_Script_btn_click_AddSkill(_inst, _other);
}
*/


// ----------------------------------------------------------------------------
// Example 3: Change player attribute caps (simplest effective mod)
// ----------------------------------------------------------------------------
// Player attributes are stored in ds_maps with keys like "skill", "speed",
// "strength", "stamina", "max_skill", etc. The function below rounds them.
// You could override gml_Script_s_round_player_attributes to change caps:

/*
function gml_Script_s_round_player_attributes(_inst, _other, argument0) {
    // argument0 is a ds_map containing the player's attributes
    var skill = ds_map_find_value(argument0, "skill");
    var max_skill = ds_map_find_value(argument0, "max_skill");
    
    // Example: raise the max skill cap from default to 99
    if (max_skill < 99) {
        ds_map_set(argument0, "max_skill", 99);
    }
    
    ds_map_set(argument0, "skill", round(skill));
    ds_map_set(argument0, "speed", round(ds_map_find_value(argument0, "speed")));
    ds_map_set(argument0, "strength", round(ds_map_find_value(argument0, "strength")));
    ds_map_set(argument0, "stamina", round(ds_map_find_value(argument0, "stamina")));
    ds_map_set(argument0, "max_skill", round(max_skill));
    ds_map_set(argument0, "max_speed", round(ds_map_find_value(argument0, "max_speed")));
    ds_map_set(argument0, "max_strength", round(ds_map_find_value(argument0, "max_strength")));
    ds_map_set(argument0, "max_stamina", round(ds_map_find_value(argument0, "max_stamina")));
}
*/


console.log("[Mod] example_balance.js loaded (no active overrides — edit to enable)");
