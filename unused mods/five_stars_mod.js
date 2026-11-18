// ============================================================================
// MOD — ALL PLAYERS 5 STARS
// ============================================================================
// Overrides gml_Script_s_get_player_rating and gml_Script_s_get_player_potential
// to always return 5, making every player show 5 stars.
//
// HOW IT WORKS:
//   The game calculates player star rating from attributes (stamina+speed+
//   strength+skill) divided by position max, clamped 1-10. By overriding
//   these global functions, every player gets 5 stars regardless of actual
//   attributes.
//
// HOW TO USE:
//   1. Save this file as engine/mods/five_stars_mod.js
//   2. Add "five_stars_mod.js" to MOD_FILES in engine/mods/loader.js
//   3. Refresh the game
// ============================================================================

(function () {
    "use strict";

    // Store originals in case we want to reference them
    var orig_get_player_rating = gml_Script_s_get_player_rating;
    var orig_get_player_potential = gml_Script_s_get_player_potential;

    // Override: always return 5 stars for rating
    gml_Script_s_get_player_rating = function (_inst, _other, argument0) {
        // argument0 is the player ds_map
        // Return 5 for all players
        return 5;
    };

    // Override: always return 5 stars for potential
    gml_Script_s_get_player_potential = function (_inst, _other, argument0) {
        // argument0 is the player ds_map
        // Return 5 for all players
        return 5;
    };

    console.log("[Mod] five_stars_mod.js loaded — all players will show 5 stars");
    console.log("[Mod] Overrode gml_Script_s_get_player_rating and gml_Script_s_get_player_potential");

    window.mod_five_stars_config = {
        rating: 5,
        potential: 5,
        enabled: true
    };

})();
