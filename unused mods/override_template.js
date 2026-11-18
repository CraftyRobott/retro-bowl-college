// ============================================================================
// OVERRIDE TEMPLATE — COPY THIS TO CREATE A NEW MOD
// ============================================================================
// Copy this file to engine/mods/my_mod.js, then add it to MOD_FILES in
// loader.js. Replace the example functions with your own overrides.
//
// STEPS:
// 1. Open html5game/RetroBowl.js
// 2. Search for the function you want to change, e.g. "function gml_Script_s_throw_ball"
// 3. Copy the ENTIRE function (from "function ..." to its closing "}")
// 4. Paste it here and edit the body
// 5. Save — the game will use your version instead of the original
// ============================================================================

// TEMPLATE: Override any gml_Script function
/*
function gml_Script_s_FUNCTION_NAME(_inst, _other, argument0, argument1) {
    // _inst   = the object instance running the code
    // _other  = the other instance (often the controller/globals object)
    // argument0, argument1... = GML script arguments
    //
    // You can call other gml_* functions, read/write ds_maps, etc.
    //
    // Example log:
    // console.log("[Mod] My mod running:", argument0);
    
    // YOUR CODE HERE
}
*/

// TEMPLATE: Override any gml_Object event
/*
function gml_Object_obj_OBJECTNAME_Create_0(_inst, _other) {
    // Runs when an object is created
    console.log("[Mod] Object created:", _inst);
}
*/

// TEMPLATE: Override a global variable
// global.gmlSOME_SETTING = your_new_value;


console.log("[Mod] override_template.js loaded (template only — no changes)");
