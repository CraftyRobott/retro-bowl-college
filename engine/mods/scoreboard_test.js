
(function () {
    "use strict";

    console.log("[Scoreboard Test] Starting...");

    if (window.__scoreboardTestPatched) {
        console.warn("[Scoreboard Test] Already installed.");
        return;
    }

    var attempts = 0;
    var retryTimer = null;

    function installPatch() {
        var original = window.gml_Script_s_draw_scoreboard;

        if (typeof original !== "function") {
            attempts++;

            if (attempts >= 200) {
                clearInterval(retryTimer);
                console.error(
                    "[Scoreboard Test] Could not find HUD drawing function."
                );
            }

            return;
        }

        clearInterval(retryTimer);

        window.gml_Script_s_draw_scoreboard = function (_inst, _other) {
            var result = original.apply(this, arguments);

            try {
                draw_set_font(global.gmlfnt_small_flex);
                draw_set_halign(0);
                draw_set_valign(1);
                draw_set_alpha(1);

                gml_Script_draw_hd_text_color(
                    _inst,
                    _other,
                    16,
                    25,
                    "SCOREBOARD MOD ACTIVE",
                    65535,
                    65535,
                    65535,
                    65535,
                    1
                );
            } catch (error) {
                if (!window.__scoreboardDrawError) {
                    window.__scoreboardDrawError = true;
                    console.error(
                        "[Scoreboard Test] Drawing failed:",
                        error
                    );
                }
            }

            return result;
        };

        window.__scoreboardTestPatched = true;

        console.log(
            "[Scoreboard Test] HUD drawing function successfully patched!"
        );
    }

    retryTimer = setInterval(installPatch, 50);
    installPatch();
})();
