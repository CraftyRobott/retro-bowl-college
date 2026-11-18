// ============================================================================
// MOD — CUSTOM SCOREBUG (HUD)
// ============================================================================
// Replaces the default Retro Bowl College scoreboard HUD with a fully
// customizable one.
//
// HOW TO USE:
//   1. Save this file as engine/mods/scorebug_mod.js
//   2. Add "scorebug_mod.js" to the MOD_FILES array in engine/mods/loader.js
//   3. Refresh the game
//
// WHAT IT OVERRIDES:
//   gml_Script_s_draw_scoreboard  <- the function that draws the top HUD
//                                    (score, quarter, clock, timeouts)
//
// CONFIGURATION:
//   Edit the CONFIG object below to change colors, position, and what to show.
// ============================================================================

(function () {
    "use strict";

    // ------------------------------------------------------------------------
    // CONFIG — change these to customize your scorebug
    // ------------------------------------------------------------------------
    var CONFIG = {
        // Position (pixels from top-left of the game canvas)
        x: 0,
        y: 0,

        // Background bar
        showBackground: true,
        bgColor: 0,          // 0 = black (GameMaker color int)
        bgHeight: 16,

        // What to display
        showTeamNames: true,
        showScores: true,
        showQuarter: true,
        showClock: true,
        showTimeouts: true,

        // Colors (GameMaker color integers; 16777215 = white, 0 = black)
        colorTeam1: 16777215,
        colorTeam2: 16777215,
        colorClock: 16777215,
        colorQuarter: 16777215,

        // Font (set to -1 to use the default global font)
        font: -1,   // e.g. global.gmlfnt_small_flex

        // Clock warning color (when under 11 seconds)
        clockWarningColor: 65535,  // yellow
        clockWarningSeconds: 11,

        // Custom prefix text shown before score (empty for none)
        prefix: "",

        // Show college overtime round when applicable
        showOvertimeRound: true,
    };

    // ------------------------------------------------------------------------
    // HELPERS — mirror GameMaker drawing functions
    // ------------------------------------------------------------------------
    function getFont() {
        if (CONFIG.font !== -1) return CONFIG.font;
        return yyGetBool(typeof global !== "undefined" && global.gmlfnt_small_flex !== "undefined")
            ? global.gmlfnt_small_flex
            : -1;
    }

    function drawHdText(x, y, text, color, alpha) {
        if (alpha === undefined) alpha = 1;
        gml_Script_draw_hd_text_color(
            _inst_mod, _other_mod,
            x, y, text,
            color, color, color, color, alpha
        );
    }

    function textWidth(text) {
        return gml_Script_string_hd_width(_inst_mod, _other_mod, text);
    }

    // Store references so helpers can access _inst / _other
    var _inst_mod = null;
    var _other_mod = null;

    // ------------------------------------------------------------------------
    // OVERRIDE: gml_Script_s_draw_scoreboard
    // ------------------------------------------------------------------------
    function gml_Script_s_draw_scoreboard(_inst, _other) {
        _inst_mod = _inst;
        _other_mod = _other;

        // Skip during practice (let QB training handle its own)
        if (yyGetBool(yyInst(_inst, _other, YYASSET_REF(0x00000062)).gmlgamepractice)) {
            gml_Script_s_draw_scoreboard_qb_training(_inst, _other);
            return;
        }
        if (yyGetBool(global.gmldebug_aa_hide_ui)) {
            return;
        }

        var fx = CONFIG.x;
        var fy = CONFIG.y;

        // Background bar
        if (CONFIG.showBackground) {
            draw_set_alpha(1);
            draw_rectangle_colour(
                fx, fy,
                yyfplus(fx, display_get_gui_width()),
                yyfplus(fy, CONFIG.bgHeight),
                CONFIG.bgColor, CONFIG.bgColor, CONFIG.bgColor, CONFIG.bgColor, 0
            );
        }

        // Team names + scores (left side)
        if (CONFIG.showTeamNames || CONFIG.showScores) {
            var gmlteam0 = ds_map_find_value(_inst.gmlteam[__yy_gml_array_check_index(0, _inst.gmlteam)], "tla");
            var gmlteam1 = ds_map_find_value(_inst.gmlteam[__yy_gml_array_check_index(1, _inst.gmlteam)], "tla");
            var gmlscore0 = string(_inst.gmlteam_score[__yy_gml_array_check_index(0, _inst.gmlteam_score)]);
            var gmlscore1 = string(_inst.gmlteam_score[__yy_gml_array_check_index(1, _inst.gmlteam_score)]);

            var leftText = CONFIG.prefix;
            if (CONFIG.showTeamNames) leftText = yyfplus(leftText, gmlteam0);
            if (CONFIG.showScores) leftText = yyfplus(leftText, " " + gmlscore0);
            if (CONFIG.showTeamNames && CONFIG.showScores) leftText = yyfplus(leftText, "   ");

            var rightText = "";
            if (CONFIG.showScores) rightText = yyfplus(rightText, gmlscore1 + " ");
            if (CONFIG.showTeamNames) rightText = yyfplus(rightText, gmlteam1);

            draw_set_font(getFont());
            draw_set_halign(0);
            draw_set_valign(1);
            drawHdText(fx, yyfplus(fy, 8), leftText, CONFIG.colorTeam1);

            // Right-align the second team's text at the right edge
            var rw = textWidth(rightText);
            drawHdText(yyfminus(display_get_gui_width(), yyfplus(rw, 16)),
                       yyfplus(fy, 8), rightText, CONFIG.colorTeam2);
        }

        // Quarter + clock (centered)
        var cx = yyfdivide(display_get_gui_width(), 2);
        var cy = yyfplus(fy, 8);

        if (CONFIG.showQuarter) {
            var gmlqtr = yyfplus(__yy_gml_errCheck(gml_Script_s_str(_inst, _other, yyfplus("quarter_", string(_inst.gmlquarter)))), " ");
            if (CONFIG.showOvertimeRound && yyGetBool(_inst.gmlcollege_overtime)) {
                if (yyGetBool(yyfgreaterequal(_inst.gmlquarter, 5)) && yyGetBool(yyfgreater(_inst.gmlcollege_overtime_round, 1))) {
                    gmlqtr = yyfplus(yyfplus(string(_inst.gmlcollege_overtime_round), " "), gmlqtr);
                }
            }
            var qw = textWidth(gmlqtr);
            drawHdText(yyfminus(cx, yyfdivide(qw, 2)), cy, gmlqtr, CONFIG.colorQuarter);
        }

        if (CONFIG.showClock) {
            var gmltime = yyfplus(" ", __yy_gml_errCheck(gml_Script_s_get_string_time(_inst, _other, _inst.gmlminutes, _inst.gmlseconds)));
            var clockColor = CONFIG.colorClock;
            if (yyfequal(_inst.gmlminutes, 0) && yyfless(_inst.gmlseconds, CONFIG.clockWarningSeconds)) {
                clockColor = CONFIG.clockWarningColor;
                draw_set_color(clockColor);
            }
            var tw = textWidth(gmltime);
            drawHdText(yyfminus(cx, yyfdivide(tw, 2)), yyfplus(cy, 12), gmltime, clockColor);
        }

        // Timeouts (below score line, left-aligned under team 1)
        if (CONFIG.showTimeouts) {
            var __yy__v1390 = GetWithArray(YYASSET_REF(0x00000069));
            for (var __yy__v1391 in __yy__v1390) {
                if (!__yy__v1390.hasOwnProperty(__yy__v1391)) continue;
                var __yy__v1392 = __yy__v1390[__yy__v1391];
                var txx = fx;
                var txy = yyfplus(fy, 24);

                if (yyGetBool(global.gmlexhibition) && yyGetBool(yyfequal(yyInst(_inst, _other, YYASSET_REF(0x00000062)).gmlplayerteamindex, -1))) {
                    var gmli = 0;
                    for (; yyfless(gmli, __yy__v1392.gmltimeouts); g_yyPrePostObject__ = gmli, gmli = g_yyPrePostObject__ instanceof Long ? gmli.add(1) : ++gmli, g_yyPrePostObject__) {
                        draw_line_width(txx, txy, yyfplus(txx, 6), txy, 2);
                        txx = yyfplus(txx, 8);
                    }
                    txx = yyfplus(fx, textWidth(leftText));
                    var gmli2 = 0;
                    for (; yyfless(gmli2, __yy__v1392.gmltimeouts_p2); g_yyPrePostObject__ = gmli2, gmli2 = g_yyPrePostObject__ instanceof Long ? gmli2.add(1) : ++gmli2, g_yyPrePostObject__) {
                        draw_line_width(txx, txy, yyfplus(txx, 6), txy, 2);
                        txx = yyfplus(txx, 8);
                    }
                } else {
                    if (yyfequal(__yy__v1392.gmlhuman_team, 1)) {
                        txx = yyfplus(txx, textWidth(leftText));
                    }
                    var gmli = 0;
                    for (; yyfless(gmli, gml_Script_s_count_timeouts(__yy__v1392, _inst)); g_yyPrePostObject__ = gmli, gmli = g_yyPrePostObject__ instanceof Long ? gmli.add(1) : ++gmli, g_yyPrePostObject__) {
                        draw_line_width(txx, txy, yyfplus(txx, 6), txy, 2);
                        txx = yyfplus(txx, 8);
                    }
                }
                break; // only draw for the active game state
            }
        }

        _inst_mod = null;
        _other_mod = null;
    }

    // Expose for debugging
    window.mod_scorebug_config = CONFIG;

    console.log("[Mod] scorebug_mod.js loaded — custom scorebug active");

})();
