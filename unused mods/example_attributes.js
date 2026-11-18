// ============================================================================
// EXAMPLE MOD — PLAYER ATTRIBUTES
// ============================================================================
// Demonstrates overriding functions that handle player attributes, training,
// and progression. Edit the function bodies below to change how players grow.
//
// Find more functions in RetroBowl.js by searching for:
//   "function gml_Script_s_player"
//   "function gml_Script_s_qb_mode"
//   "function gml_Script_s_training"
// ============================================================================

// ----------------------------------------------------------------------------
// Example: Override attribute rounding / caps
// ----------------------------------------------------------------------------
// Original function: gml_Script_s_round_player_attributes
// It rounds each attribute and its max. You can change the caps here.

/*
function gml_Script_s_round_player_attributes(_inst, _other, argument0) {
    // argument0 is a ds_map: {skill, speed, strength, stamina, max_skill, ...}
    
    // Read current values
    var skill = ds_map_find_value(argument0, "skill");
    var speed = ds_map_find_value(argument0, "speed");
    var strength = ds_map_find_value(argument0, "strength");
    var stamina = ds_map_find_value(argument0, "stamina");
    
    // Example: soft-cap attributes at 90 instead of default
    var cap = 90;
    if (skill > cap) skill = cap;
    if (speed > cap) speed = cap;
    if (strength > cap) strength = cap;
    if (stamina > cap) stamina = cap;
    
    ds_map_set(argument0, "skill", round(skill));
    ds_map_set(argument0, "speed", round(speed));
    ds_map_set(argument0, "strength", round(strength));
    ds_map_set(argument0, "stamina", round(stamina));
    
    // Also round the max values
    ds_map_set(argument0, "max_skill", round(ds_map_find_value(argument0, "max_skill")));
    ds_map_set(argument0, "max_speed", round(ds_map_find_value(argument0, "max_speed")));
    ds_map_set(argument0, "max_strength", round(ds_map_find_value(argument0, "max_strength")));
    ds_map_set(argument0, "max_stamina", round(ds_map_find_value(argument0, "max_stamina")));
}
*/


// ----------------------------------------------------------------------------
// Example: Override QB mode auto-XP distribution
// ----------------------------------------------------------------------------
// Original function: gml_Script_s_qb_mode_auto_xp
// It randomly picks which attribute to upgrade when a player gains XP.

/*
function gml_Script_s_qb_mode_auto_xp(_inst, _other, argument0, argument1, argument2, argument3) {
    // argument0..3 are booleans for [skill, speed, strength, stamina] availability
    
    // Example: ALWAYS upgrade skill (first available), never random
    if (yyGetBool(argument0)) {
        gml_Script_btn_click_AddSkill(_inst, _other);
        return;
    }
    if (yyGetBool(argument1)) {
        gml_Script_btn_click_AddSpeed(_inst, _other);
        return;
    }
    if (yyGetBool(argument2)) {
        gml_Script_btn_click_AddStrength(_inst, _other);
        return;
    }
    if (yyGetBool(argument3)) {
        // stamina handler would go here
    }
}
*/


console.log("[Mod] example_attributes.js loaded (no active overrides — edit to enable)");
