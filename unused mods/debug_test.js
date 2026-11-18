// ============================================================================
// MOD — BASIC LOAD TEST (CSS overlay div)
// ============================================================================
// Creates a DOM overlay div positioned over the game canvas.
// This is guaranteed to show because it's outside GameMaker's WebGL rendering.
// ============================================================================

(function () {
    "use strict";

    console.log("[Basic Mod] I AM LOADED");
    document.title = "MOD IS WORKING!!!";

    // Wait for the game container to exist, then inject overlay
    function tryInject() {
        var container = document.getElementById("gm4html5_div_id");
        if (!container) {
            console.log("[Basic Mod] Container not found, retrying...");
            setTimeout(tryInject, 300);
            return;
        }

        console.log("[Basic Mod] Container found, injecting overlay");

        // Remove any existing overlay
        var old = document.getElementById("basic-mod-overlay");
        if (old) old.remove();

        // Create overlay div
        var div = document.createElement("div");
        div.id = "basic-mod-overlay";
        div.style.position = "absolute";
        div.style.left = "0";
        div.style.top = "0";
        div.style.width = "300px";
        div.style.height = "120px";
        div.style.background = "#FF0000"; // RED
        div.style.color = "#FFFFFF";
        div.style.fontFamily = "Arial, sans-serif";
        div.style.fontSize = "20px";
        div.style.fontWeight = "bold";
        div.style.padding = "20px";
        div.style.boxSizing = "border-box";
        div.style.zIndex = "999999";
        div.style.pointerEvents = "none";
        div.innerHTML =
            "<div style='margin-bottom:8px;'>MOD WORKS!</div>" +
            "<div style='font-size:14px;opacity:0.9;'>Red box = mod is active</div>";

        container.appendChild(div);
        console.log("[Basic Mod] Overlay injected successfully");
    }

    // Try immediately and keep retrying
    tryInject();
    setTimeout(tryInject, 300);
    setTimeout(tryInject, 1000);
    setTimeout(tryInject, 3000);

})();
