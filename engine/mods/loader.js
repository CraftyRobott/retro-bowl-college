// ============================================================================
// RETRO BOWL COLLEGE — MOD LOADER (AUTO-DISCOVER)
// ============================================================================
// Automatically discovers all .js files in engine/mods/ by fetching the
// folder's directory listing from the local server. No hardcoded file list
// needed — just drop a new .js mod file into engine/mods/ and it will load.
//
// Load order (in index_nopoki.html):
//   1. html5game/RetroBowl.js      <- base engine (DO NOT EDIT)
//   2. engine/mods/loader.js       <- this file (auto-discovers mods)
//   3. engine/mods/*.js            <- your mods (alphabetical order)
// ============================================================================

(function () {
    "use strict";

    // Folder where mod files live (relative to this HTML page).
    var MODS_DIR = "engine/mods";

    // Fallback list in case directory listing is not available.
    // Add filenames here only if auto-discovery fails.
    var FALLBACK_MODS = [];

    // Fetch the directory listing and parse all .js file links.
    function discoverMods(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", MODS_DIR + "/", true);
        xhr.onload = function () {
            if (xhr.status === 200 || xhr.status === 0) {
                var html = xhr.responseText;
                // Find all href="something.js" links in the directory listing
                var modFiles = [];
                var regex = /href="([^"]*\.js)"/gi;
                var match;
                while ((match = regex.exec(html)) !== null) {
                    var file = match[1];
                    // Skip the loader itself
                    if (file !== "loader.js") {
                        modFiles.push(file);
                    }
                }
                // Sort alphabetically for consistent load order
                modFiles.sort();
                console.log("[Mod] Auto-discovered mods:", modFiles);
                callback(modFiles);
            } else {
                console.warn("[Mod] Directory listing unavailable (status " + xhr.status + "), using fallback.");
                callback(FALLBACK_MODS);
            }
        };
        xhr.onerror = function () {
            console.warn("[Mod] Directory listing request failed, using fallback.");
            callback(FALLBACK_MODS);
        };
        xhr.send();
    }

    // Load a script file synchronously so mods are defined before the game starts.
    function loadMod(src, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", src, false); // synchronous
        try {
            xhr.send();
        } catch (e) {
            console.error("[Mod] XHR error loading " + src + ":", e);
            if (callback) callback();
            return;
        }
        if (xhr.status === 200 || xhr.status === 0) {
            try {
                var script = document.createElement("script");
                script.text = xhr.responseText;
                document.head.appendChild(script);
                document.head.removeChild(script);
                console.log("[Mod] Loaded OK: " + src);
            } catch (e) {
                console.error("[Mod] Eval error in " + src + ":", e);
            }
        } else {
            console.warn("[Mod] Failed to load (status " + xhr.status + "): " + src);
        }
        if (callback) callback();
    }

    console.log("[Mod] Mod loader starting...");
    discoverMods(function (modFiles) {
        var i = 0;
        function loadNext() {
            if (i >= modFiles.length) {
                console.log("[Mod] All mods loaded.");
                return;
            }
            loadMod(MODS_DIR + "/" + modFiles[i], function () {
                i++;
                loadNext();
            });
        }
        loadNext();
    });

})();
