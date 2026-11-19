
(function () {
    "use strict";

    console.log("[SEC HUD] Initializing compact broadcast scorebug...");

    if (window.__secEspnHudPatched) {
        console.warn("[SEC HUD] Already installed.");
        return;
    }

    var attempts = 0;
    var retryTimer = null;

    function install() {
        var original = window.gml_Script_s_draw_scoreboard;

        if (typeof original !== "function") {
            attempts++;

            if (attempts >= 200) {
                clearInterval(retryTimer);
                console.error("[SEC HUD] Could not find scoreboard function.");
            }

            return;
        }

        clearInterval(retryTimer);

        window.gml_Script_s_draw_scoreboard = function (_inst, _other) {
            try {
                if (global.gmldebug_aa_hide_ui) {
                    return;
                }

                var w = display_get_gui_width();
                var h = display_get_gui_height();

                // Original responsive scale, reduced by 50%.
                var baseScale = Math.max(0.75, Math.min(1.25, w / 732));
                var scale = baseScale * 0.3;

                // Half the original scoreboard width.
                var barW = (w - (36 * baseScale)) * 0.5;
                var barH = 76 * scale;

                // Center horizontally and keep near the bottom.
                var barX = (w - barW) / 2;
                var barY = h - barH - (12 * scale);
                var barRight = barX + barW;

                // Layout proportions.
                var leftEnd = barX + barW * 0.39;
                var centerEnd = barX + barW * 0.61;

                // Neutral broadcast palette.
                var BLACK = 0x151515;
                var DARK = 0x202020;
                var PANEL = 0x303030;
                var LIGHT = 0x454545;
                var WHITE = 16777215;
                var GRAY = 0xAAAAAA;
                var ACCENT = 0x777777;

                // Live game information.
                var away = ds_map_find_value(_inst.gmlteam[0], "tla");
                var home = ds_map_find_value(_inst.gmlteam[1], "tla");

                var awayScore = String(_inst.gmlteam_score[0]);
                var homeScore = String(_inst.gmlteam_score[1]);

                var clock = gml_Script_s_get_string_time(
                    _inst, _other,
                    _inst.gmlminutes,
                    _inst.gmlseconds
                );

                var quarter = gml_Script_s_str(
                    _inst, _other,
                    "quarter_" + String(_inst.gmlquarter)
                );

                var down = gml_Script_s_get_string_downand(
                    _inst, _other
                );

                // BACKGROUND
                draw_set_alpha(1);

                draw_rectangle_colour(
                    barX - scale, barY - scale,
                    barRight + scale, barY + barH + scale,
                    BLACK, BLACK, BLACK, BLACK, 0
                );

                draw_rectangle_colour(
                    barX, barY,
                    barRight, barY + barH,
                    DARK, DARK, DARK, DARK, 0
                );

                // Away panel.
                draw_rectangle_colour(
                    barX, barY,
                    leftEnd, barY + barH,
                    PANEL, PANEL, PANEL, PANEL, 0
                );

                // Center panel.
                draw_rectangle_colour(
                    leftEnd, barY,
                    centerEnd, barY + barH,
                    BLACK, BLACK, BLACK, BLACK, 0
                );

                // Home panel.
                draw_rectangle_colour(
                    centerEnd, barY,
                    barRight, barY + barH,
                    PANEL, PANEL, PANEL, PANEL, 0
                );

                // Top accent.
                draw_rectangle_colour(
                    barX, barY,
                    barRight, barY + (3 * scale),
                    ACCENT, ACCENT, ACCENT, ACCENT, 0
                );

                // Separators.
                draw_rectangle_colour(
                    leftEnd - scale, barY + (9 * scale),
                    leftEnd, barY + barH - (9 * scale),
                    LIGHT, LIGHT, LIGHT, LIGHT, 0
                );

                draw_rectangle_colour(
                    centerEnd, barY + (9 * scale),
                    centerEnd + scale, barY + barH - (9 * scale),
                    LIGHT, LIGHT, LIGHT, LIGHT, 0
                );

                // TEXT
                draw_set_font(global.gmlfnt_small_flex);
                draw_set_valign(1);
                draw_set_alpha(1);

                // Away team.
                draw_set_halign(0);
                draw_set_color(WHITE);

                gml_Script_draw_hd_text(
                    _inst, _other,
                    barX + (20 * scale),
                    barY + (barH * 0.52),
                    String(away)
                );

                // Away score.
                draw_set_halign(2);

                gml_Script_draw_hd_text(
                    _inst, _other,
                    leftEnd - (17 * scale),
                    barY + (barH * 0.52),
                    awayScore
                );

                // Home score.
                draw_set_halign(0);

                gml_Script_draw_hd_text(
                    _inst, _other,
                    centerEnd + (17 * scale),
                    barY + (barH * 0.52),
                    homeScore
                );

                // Home team.
                draw_set_halign(2);

                gml_Script_draw_hd_text(
                    _inst, _other,
                    barRight - (20 * scale),
                    barY + (barH * 0.52),
                    String(home)
                );

// Draw smaller HUD text without changing the other text.
function drawSmallHudText(x, y, text) {
    var textScale = global.gmlhd_fonts ? 0.175 : 0.4;

    draw_text_transformed(
        x, y, String(text),
        textScale, textScale, 0
    );
}

                // CENTER GAME INFORMATION
                var centerX = (leftEnd + centerEnd) / 2;

               // Down and distance - smaller.
draw_set_halign(1);
draw_set_color(GRAY);

if (down !== "") {
    drawSmallHudText(
        centerX,
        barY + (15 * scale),
        down
    );
}

// Game clock - unchanged.
draw_set_color(WHITE);

gml_Script_draw_hd_text(
    _inst, _other,
    centerX,
    barY + (40 * scale),
    String(clock)
);

// Quarter - smaller.
draw_set_color(GRAY);

drawSmallHudText(
    centerX,
    barY + (70 * scale),
    quarter
);

                // Restore drawing state.
                draw_set_color(WHITE);
                draw_set_alpha(1);
                draw_set_halign(0);
                draw_set_valign(1);

            } catch (error) {
                if (!window.__secHudErrorLogged) {
                    window.__secHudErrorLogged = true;
                    console.error("[SEC HUD] Drawing error:", error);
                }
            }
        };

        window.__secEspnHudPatched = true;
        console.log("[SEC HUD] Compact broadcast scorebug installed!");
    }

    retryTimer = setInterval(install, 50);
    install();
})();
