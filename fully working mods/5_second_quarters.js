
(function () {
    "use strict";

    var TAG = "[5 Second Quarters]";
    var FIVE_SEC_VALUE = 2;
    var RESET_STAGE = 13;

    if (window.__fiveSecondQuartersInstalled) {
        console.warn(TAG, "Already installed. Reload the game before installing an updated version.");
        return;
    }

    console.log(TAG, "Installing...");

    var scripts = window.JSON_game && window.JSON_game.Scripts;

    if (
        !scripts ||
        typeof scripts[778] !== "function" ||
        typeof scripts[779] !== "function"
    ) {
        console.error(TAG, "Match Length scripts unavailable.");
        return;
    }

    // Cycle through the native 1, 2, and 3 minute options,
    // with 5 seconds as the additional option.
    function nextValue(current) {
        if (current === -1) return 0;
        if (current === 0) return 1;
        if (current === 1) return FIVE_SEC_VALUE;
        return -1;
    }

    // Normal match-length option.
    var originalNormalOption = scripts[778];

    scripts[778] = function (_inst, _other) {
        var managers = GetWithArray(YYASSET_REF(0x00000062));

        for (var key in managers) {
            if (!Object.prototype.hasOwnProperty.call(managers, key)) continue;

            var manager = managers[key];

            manager.gmlop_matchlength = nextValue(
                Number(manager.gmlop_matchlength)
            );

            gml_Script_s_update_options(manager, _inst);

            if (Number(manager.gmlop_matchlength) === FIVE_SEC_VALUE) {
                yyInst(manager, _inst, 100301).gmltext = "5 sec";
            }

            console.log(TAG, "Normal setting:", manager.gmlop_matchlength);
        }
    };

    // Exhibition match-length option.
    var originalExhibitionOption = scripts[779];

    scripts[779] = function (_inst, _other) {
        var managers = GetWithArray(YYASSET_REF(0x00000062));

        for (var key in managers) {
            if (!Object.prototype.hasOwnProperty.call(managers, key)) continue;

            var manager = managers[key];

            var current = Number(
                ds_map_find_value(
                    manager.gmlmap_options,
                    "exh_op_matchlength"
                )
            );

            var next = nextValue(current);

            ds_map_set(
                manager.gmlmap_options,
                "exh_op_matchlength",
                next
            );

            gml_Script_s_update_options_exh(manager, _inst);

            if (next === FIVE_SEC_VALUE) {
                yyInst(manager, _inst, 100809).gmltext = "5 sec";
            }

            console.log(TAG, "Exhibition setting:", next);
        }
    };

    // Set every active game clock to 0:05.
    function setFiveSecondClock(clock) {
        clock.gmlminutes = 0;
        clock.gmlseconds = 5;
        clock.gmltime_subtract = 0;
    }

    function resetAllGameClocks() {
        var clocks = GetWithArray(YYASSET_REF(0x00000069));
        var count = 0;

        for (var key in clocks) {
            if (!Object.prototype.hasOwnProperty.call(clocks, key)) continue;

            setFiveSecondClock(clocks[key]);
            count++;
        }

        return count;
    }

    // Patch the actual native quarter clock reset.
    // The original function runs first, so its normal quarter-transition
    // logic completes before we change the resulting clock to 0:05.
    function patchCommentaryReset() {
        var original = window.gml_Script_s_update_commentary;

        if (typeof original !== "function") {
            console.error(TAG, "s_update_commentary function unavailable.");
            return false;
        }

        if (window.__fiveSecondCommentaryPatched) {
            console.error(TAG, "Commentary reset is already patched. Reload the game.");
            return false;
        }

        window.gml_Script_s_update_commentary = function (_inst, _other) {
            var shouldReset = false;

            try {
                var manager = yyInst(
                    _inst,
                    _other,
                    YYASSET_REF(0x00000062)
                );

                shouldReset = !!(
                    manager &&
                    Number(manager.gmlop_matchlength) === FIVE_SEC_VALUE &&
                    Number(_inst.gmlcomm_stage) === RESET_STAGE
                );
            } catch (error) {
                console.error(TAG, "Could not inspect commentary stage:", error);
            }

            // Let the original game code perform its entire reset first.
            var result = original.apply(this, arguments);

            if (shouldReset) {
                try {
                    var count = resetAllGameClocks();

                    console.log(
                        TAG,
                        "Native quarter reset completed. Set",
                        count,
                        "clock object(s) to 0:05. Quarter:",
                        _inst.gmlquarter
                    );
                } catch (error) {
                    console.error(TAG, "Could not apply five-second reset:", error);
                }
            }

            return result;
        };

        window.__fiveSecondCommentaryPatched = true;

        console.log(
            TAG,
            "Commentary reset patched. Waiting for stage 20."
        );

        return true;
    }

    // Find and patch the main controller's creation event.
    // This initializes the first quarter without interfering with later resets.
    function patchController() {
        if (!window._i3 || !window._i3._ce2) {
            return false;
        }

        var definitions = window._i3._ce2;

        var entry = Object.values(definitions).find(function (obj) {
            return obj && obj._WF === "obj_controller";
        });

        if (!entry) {
            return false;
        }

        if (entry.__fiveSecondCreatePatched) {
            return true;
        }

        var originalCreate = entry.CreateEvent;

        if (typeof originalCreate !== "function") {
            console.error(TAG, "Controller CreateEvent unavailable.");
            return false;
        }

        entry.CreateEvent = function (_inst, _other) {
            var result = originalCreate.apply(this, arguments);

            try {
                var manager = yyInst(
                    _inst,
                    _other,
                    YYASSET_REF(0x00000062)
                );

                if (
                    manager &&
                    Number(manager.gmlop_matchlength) === FIVE_SEC_VALUE
                ) {
                    var count = resetAllGameClocks();

                    _inst.__fiveSecondClockInitialized = true;

                    console.log(
                        TAG,
                        "Controller created. Initialized",
                        count,
                        "clock object(s) to 0:05."
                    );
                }
            } catch (error) {
                console.error(TAG, "Controller creation error:", error);
            }

            return result;
        };

        entry.__fiveSecondCreatePatched = true;

        console.log(
            TAG,
            "Controller creation event patched. Object ID:",
            entry._EQ
        );

        return true;
    }

    if (!patchCommentaryReset()) {
        console.error(TAG, "Could not install commentary patch.");
        return;
    }

    console.log(TAG, "Waiting for game object registry...");

    var attempts = 0;
    var maxAttempts = 1000;

    var registryCheck = setInterval(function () {
        attempts++;

        if (patchController()) {
            clearInterval(registryCheck);

            window.__fiveSecondQuartersInstalled = true;

            console.log(TAG, "Installed successfully.");
            return;
        }

        if (attempts >= maxAttempts) {
            clearInterval(registryCheck);

            console.error(
                TAG,
                "Timed out waiting for the game object registry."
            );
        }
    }, 50);
})();
