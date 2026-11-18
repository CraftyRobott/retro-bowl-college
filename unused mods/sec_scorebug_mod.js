// ============================================================================
// MOD — ESPN SEC STYLE SCOREBOARD (canvas fillText hook)
// ============================================================================
// Hooks canvas fillText to capture scoreboard text and draw ESPN SEC style
// scoreboard overlay. Suppresses original scoreboard text at top of screen.
// ============================================================================

(function () {
    "use strict";

    // ------------------------------------------------------------------------
    // CONFIG — ESPN SEC on ESPN look
    // ------------------------------------------------------------------------
    var CONFIG = {
        barHeight: 44,
        bgGradient: "linear-gradient(to bottom, #1a1a1a, #000000)",
        colorMain: "#ffffff",
        colorDim: "#808080",
        colorClockLow: "#ffff00",
        fontFamily: "Arial, Helvetica, sans-serif",
        showTeamAbbrev: true,
        showScore: true,
        showQuarter: true,
        showClock: true,
    };

    // ------------------------------------------------------------------------
    // STATE — captured scoreboard data from fillText hook
    // ------------------------------------------------------------------------
    var state = {
        team1: "--",
        team2: "--",
        score1: "0",
        score2: "0",
        quarter: "1st",
        clock: "0:00",
        clockLow: false
    };

    // ------------------------------------------------------------------------
    // DOM OVERLAY
    // ------------------------------------------------------------------------
    var overlay = null;
    var leftDiv = null;
    var centerDiv = null;
    var rightDiv = null;

    function createOverlay() {
        var container = document.getElementById("gm4html5_div_id");
        if (!container) return false;

        var old = document.getElementById("sec-scorebug-overlay");
        if (old) old.remove();

        overlay = document.createElement("div");
        overlay.id = "sec-scorebug-overlay";
        overlay.style.position = "absolute";
        overlay.style.left = "0";
        overlay.style.top = "0";
        overlay.style.width = "100%";
        overlay.style.height = CONFIG.barHeight + "px";
        overlay.style.background = CONFIG.bgGradient;
        overlay.style.zIndex = "999999";
        overlay.style.pointerEvents = "none";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "space-between";
        overlay.style.padding = "0 16px";
        overlay.style.boxSizing = "border-box";

        leftDiv = document.createElement("div");
        leftDiv.style.display = "flex";
        leftDiv.style.flexDirection = "column";
        leftDiv.style.alignItems = "flex-start";
        leftDiv.style.justifyContent = "center";
        overlay.appendChild(leftDiv);

        centerDiv = document.createElement("div");
        centerDiv.style.display = "flex";
        centerDiv.style.flexDirection = "column";
        centerDiv.style.alignItems = "center";
        centerDiv.style.justifyContent = "center";
        overlay.appendChild(centerDiv);

        rightDiv = document.createElement("div");
        rightDiv.style.display = "flex";
        rightDiv.style.flexDirection = "column";
        rightDiv.style.alignItems = "flex-end";
        rightDiv.style.justifyContent = "center";
        overlay.appendChild(rightDiv);

        container.appendChild(overlay);
        return true;
    }

    function updateOverlay() {
        if (!overlay) return;

        if (leftDiv) {
            var html = "";
            if (CONFIG.showTeamAbbrev && state.team1 !== "--") {
                html += "<div style='font-size:11px;color:" + CONFIG.colorDim + ";text-transform:uppercase;letter-spacing:1px;font-weight:bold;white-space:nowrap;'>" + state.team1 + "</div>";
            }
            if (CONFIG.showScore) {
                html += "<div style='font-size:20px;font-weight:bold;color:" + CONFIG.colorMain + ";'>" + state.score1 + "</div>";
            }
            leftDiv.innerHTML = html;
        }

        if (centerDiv) {
            var html = "";
            if (CONFIG.showQuarter) {
                html += "<div style='font-size:12px;font-weight:bold;color:" + CONFIG.colorMain + ";white-space:nowrap;'>" + state.quarter + "</div>";
            }
            if (CONFIG.showClock) {
                var clockColor = state.clockLow ? CONFIG.colorClockLow : CONFIG.colorMain;
                html += "<div style='font-size:18px;font-weight:bold;color:" + clockColor + ";white-space:nowrap;'>" + state.clock + "</div>";
            }
            centerDiv.innerHTML = html;
        }

        if (rightDiv) {
            var html = "";
            if (CONFIG.showScore) {
                html += "<div style='font-size:20px;font-weight:bold;color:" + CONFIG.colorMain + ";'>" + state.score2 + "</div>";
            }
            if (CONFIG.showTeamAbbrev && state.team2 !== "--") {
                html += "<div style='font-size:11px;color:" + CONFIG.colorDim + ";text-transform:uppercase;letter-spacing:1px;font-weight:bold;white-space:nowrap;'>" + state.team2 + "</div>";
            }
            rightDiv.innerHTML = html;
        }
    }

    // ------------------------------------------------------------------------
    // HOOK: canvas fillText — capture scoreboard text
    // ------------------------------------------------------------------------
    function hookFillText() {
        setTimeout(function () {
            var canvas = document.getElementById("canvas");
            if (!canvas) {
                hookFillText();
                return;
            }
            var ctx = canvas.getContext("2d");
            if (!ctx) return;

            var origFillText = ctx.fillText.bind(ctx);
            ctx.fillText = function (text, x, y, maxWidth) {
                // Capture scoreboard text at top of screen (y < 60)
                if (y < 60 && text && text.trim().length > 0) {
                    parseScoreboardText(text, x, y);
                    // Suppress original scoreboard text
                    return;
                }
                return origFillText(text, x, y, maxWidth);
            };

            console.log("[Mod] fillText hooked — ESPN SEC scoreboard active");
        }, 1000);
    }

    // ------------------------------------------------------------------------
    // PARSE captured text into scoreboard state
    // ========================================================================
    // Scoreboard text format (approximate):
    //   Team1Abbrev Score1   Quarter   Clock   Score2 Team2Abbrev
    //   e.g.: "WYO 14"   "2nd"   "0:45"   "21"   "HAW"
    // ========================================================================
    function parseScoreboardText(text, x, y) {
        text = text.trim();

        // Quarter text (contains "nd", "rd", "st", "th")
        if (/^\d+(st|nd|rd|th)$/.test(text)) {
            state.quarter = text;
            return;
        }

        // Clock text (M:SS format)
        if (/^\d:\d\d$/.test(text)) {
            state.clock = text;
            var parts = text.split(":");
            var m = parseInt(parts[0]);
            var s = parseInt(parts[1]);
            state.clockLow = (m === 0 && s < 11);
            return;
        }

        // Score text (just a number, 1-3 digits)
        if (/^\d{1,3}$/.test(text)) {
            // Determine if it's score1 (left side, x < center) or score2 (right side, x > center)
            if (x < 400) {  // left half
                state.score1 = text;
            } else {         // right half
                state.score2 = text;
            }
            return;
        }

        // Team abbreviation (2-4 chars, uppercase)
        if (/^[A-Z][A-Z][A-Z]?$/.test(text) && text.length <= 4) {
            if (x < 400) {
                state.team1 = text;
            } else {
                state.team2 = text;
            }
            return;
        }
    }

    // ------------------------------------------------------------------------
    // INIT
    // ------------------------------------------------------------------------
    function tryInit() {
        if (!createOverlay()) {
            setTimeout(tryInit, 300);
            return;
        }
        console.log("[Mod] sec_scorebug_mod: CSS overlay injected");
        hookFillText();
        updateOverlay();
    }

    tryInit();

    // ------------------------------------------------------------------------
    // UPDATE LOOP
    // ------------------------------------------------------------------------
    function updateLoop() {
        updateOverlay();
        requestAnimationFrame(updateLoop);
    }

    var updateStarted = false;
    setInterval(function () {
        if (overlay && !updateStarted) {
            updateStarted = true;
            updateLoop();
        }
    }, 500);

    console.log("[Mod] sec_scorebug_mod.js loaded — ESPN SEC style scoreboard via fillText hook");

    window.mod_sec_scorebug_config = CONFIG;

})();
