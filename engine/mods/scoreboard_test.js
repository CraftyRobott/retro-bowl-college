
(function () {
    "use strict";

    console.log("[SEC HUD] Initializing uniform-color broadcast scorebug...");

    if (window.__secEspnHudPatched) {
        console.warn("[SEC HUD] Already installed.");
        return;
    }

    var attempts = 0;
    var retryTimer = null;

    // Cache each team's extracted primary shirt color.
    var cachedTeamUniformColors = {};

    function getTeamUniformColor(_inst, _other, _team) {
        try {
            if (!_team) {
                throw new Error("Team data unavailable");
            }

            var shirtHex = ds_map_find_value(_team, "colshirt");

            if (shirtHex === undefined || shirtHex === null) {
                throw new Error("Team colshirt value not found");
            }

            shirtHex = String(shirtHex).trim().replace(/^[$#]/, "");

            if (!/^[0-9a-fA-F]{6}$/.test(shirtHex)) {
                throw new Error("Invalid shirt color: " + shirtHex);
            }

            var teamId = String(ds_map_find_value(_team, "tla"));

            if (
                cachedTeamUniformColors[teamId] &&
                cachedTeamUniformColors[teamId].hex === shirtHex
            ) {
                return cachedTeamUniformColors[teamId].color;
            }

            var rawColor = gml_Script_s_hex_string_to_col(
                _inst, _other, shirtHex
            );

            var convertedColor = gml_Script_s_rgb_to_bgr(
                _inst, _other, rawColor
            );

            cachedTeamUniformColors[teamId] = {
                hex: shirtHex,
                color: convertedColor
            };

            console.log("[SEC HUD] Team uniform color found:", {
                team: teamId,
                shirtHex: shirtHex
            });

            return convertedColor;

        } catch (error) {
            if (!window.__secUniformColorErrorLogged) {
                window.__secUniformColorErrorLogged = true;
                console.warn("[SEC HUD] Could not read team shirt color:", error);
            }

            return make_color_rgb(119, 119, 119);
        }
    }

    // Lighten a color while preserving its packed channel layout.
    function lightenColor(color, amount) {
        var r = color & 255;
        var g = (color >> 8) & 255;
        var b = (color >> 16) & 255;

        r = Math.min(255, Math.round(r + (255 - r) * amount));
        g = Math.min(255, Math.round(g + (255 - g) * amount));
        b = Math.min(255, Math.round(b + (255 - b) * amount));

        return r | (g << 8) | (b << 16);
    }

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

                // Original responsive scale, reduced to 30%.
                var baseScale = Math.max(0.75, Math.min(1.25, w / 732));
                var scale = baseScale * 0.3;

                // Half-width scoreboard, centered horizontally near the bottom.
                var barW = (w - (36 * baseScale)) * 0.5;
                var barH = 76 * scale;
                var barX = (w - barW) / 2;
                var barY = h - barH - (12 * scale);
                var barRight = barX + barW;

                // Panel proportions.
                var leftEnd = barX + barW * 0.39;
                var centerEnd = barX + barW * 0.61;

                // Neutral broadcast palette.
                var BLACK = 0x151515;
                var DARK = 0x202020;
                var LIGHT = 0x454545;
                var WHITE = 16777215;
                var GRAY = 0xAAAAAA;

                // Live game information.
                var awayTeam = _inst.gmlteam[0];
                var homeTeam = _inst.gmlteam[1];

                var away = ds_map_find_value(awayTeam, "tla");
                var home = ds_map_find_value(homeTeam, "tla");

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

                var down = gml_Script_s_get_string_downand(_inst, _other);

                // Get each team's primary shirt color independently.
                var awayPanelColor = getTeamUniformColor(
                    _inst, _other, awayTeam
                );

                var homePanelColor = getTeamUniformColor(
                    _inst, _other, homeTeam
                );

                // Create slightly lighter versions for the top gradient.
                var awayAccentColor = lightenColor(awayPanelColor, 0.22);
                var homeAccentColor = lightenColor(homePanelColor, 0.22);

                // BACKGROUND
                draw_set_alpha(1);

                // Outer border.
                draw_rectangle_colour(
                    barX - scale, barY - scale,
                    barRight + scale, barY + barH + scale,
                    BLACK, BLACK, BLACK, BLACK, 0
                );

                // Main background.
                draw_rectangle_colour(
                    barX, barY,
                    barRight, barY + barH,
                    DARK, DARK, DARK, DARK, 0
                );

                // Away panel - away uniform color.
                draw_rectangle_colour(
                    barX, barY,
                    leftEnd, barY + barH,
                    awayPanelColor, awayPanelColor,
                    awayPanelColor, awayPanelColor, 0
                );

                // Center panel.
                draw_rectangle_colour(
                    leftEnd, barY,
                    centerEnd, barY + barH,
                    BLACK, BLACK, BLACK, BLACK, 0
                );

                // Home panel - home uniform color.
                draw_rectangle_colour(
                    centerEnd, barY,
                    barRight, barY + barH,
                    homePanelColor, homePanelColor,
                    homePanelColor, homePanelColor, 0
                );

                // Top accent - gradient between lighter team colors.
                draw_rectangle_colour(
                    barX, barY,
                    barRight, barY + (3 * scale),
                    awayAccentColor,
                    homeAccentColor,
                    homeAccentColor,
                    awayAccentColor,
                    0
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

                var teamTextY = barY + (barH * 0.52);

                // Away team abbreviation.
                var awayTextX = barX + (20 * scale);

                draw_set_halign(0);
                draw_set_color(WHITE);

                gml_Script_draw_hd_text(
                    _inst, _other,
                    awayTextX,
                    teamTextY,
                    String(away)
                );

                // Away score.
                draw_set_halign(2);

                gml_Script_draw_hd_text(
                    _inst, _other,
                    leftEnd - (17 * scale),
                    teamTextY,
                    awayScore
                );

                // Home score.
                draw_set_halign(0);

                gml_Script_draw_hd_text(
                    _inst, _other,
                    centerEnd + (17 * scale),
                    teamTextY,
                    homeScore
                );

                // Home team abbreviation.
                var homeTextX = barRight - (20 * scale);

                draw_set_halign(2);

                gml_Script_draw_hd_text(
                    _inst, _other,
                    homeTextX,
                    teamTextY,
                    String(home)
                );

                // Draw smaller HUD text.
                function drawSmallHudText(x, y, text) {
                    var textScale = global.gmlhd_fonts ? 0.175 : 0.4;

                    draw_text_transformed(
                        x, y, String(text),
                        textScale, textScale, 0
                    );
                }

                // CENTER GAME INFORMATION
                var centerX = (leftEnd + centerEnd) / 2;

                // Down and distance.
                draw_set_halign(1);
                draw_set_color(GRAY);

                if (down !== "") {
                    drawSmallHudText(
                        centerX,
                        barY + (15 * scale),
                        down
                    );
                }

                // Game clock.
                draw_set_color(WHITE);

                gml_Script_draw_hd_text(
                    _inst, _other,
                    centerX,
                    barY + (40 * scale),
                    String(clock)
                );

                // Quarter.
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
        console.log("[SEC HUD] Uniform-color broadcast scorebug installed!");
    }

    retryTimer = setInterval(install, 50);
    install();
})();
