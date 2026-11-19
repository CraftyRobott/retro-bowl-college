
(function () {
    "use strict";

    var MODS_DIR = "engine/mods";
    var FALLBACK_MODS = [];

    var modsLoaded = false;
    var pageLoaded = false;
    var gameStarted = false;

    function tryStartGame() {
        if (!modsLoaded || !pageLoaded || gameStarted) {
            return;
        }

        gameStarted = true;

        console.log("[Mod] Starting game after mods loaded...");

        if (typeof GameMaker_Init === "function") {
            GameMaker_Init();
        } else {
            console.error("[Mod] GameMaker_Init not found!");
        }
    }

    window.addEventListener("load", function () {
        pageLoaded = true;
        tryStartGame();
    });

    function loadMod(src) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", src, false);

        try {
            xhr.send();
        } catch (e) {
            console.error("[Mod] XHR error:", src, e);
            return;
        }

        if (xhr.status === 200 || xhr.status === 0) {
            try {
                var script = document.createElement("script");
                script.text = xhr.responseText;
                document.head.appendChild(script);
                document.head.removeChild(script);

                console.log("[Mod] Loaded OK:", src);
            } catch (e) {
                console.error("[Mod] Mod execution error:", src, e);
            }
        } else {
            console.warn("[Mod] Failed to load:", src, xhr.status);
        }
    }

    function discoverMods(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", MODS_DIR + "/", true);

        xhr.onload = function () {
            if (xhr.status === 200 || xhr.status === 0) {
                var modFiles = [];
                var regex = /href="([^"]*\.js)"/gi;
                var match;

                while ((match = regex.exec(xhr.responseText)) !== null) {
                    var file = match[1];

                    if (file !== "loader.js") {
                        modFiles.push(file);
                    }
                }

                modFiles.sort();
                console.log("[Mod] Auto-discovered mods:", modFiles);
                callback(modFiles);
            } else {
                callback(FALLBACK_MODS);
            }
        };

        xhr.onerror = function () {
            callback(FALLBACK_MODS);
        };

        xhr.send();
    }

    console.log("[Mod] Mod loader starting...");

    discoverMods(function (modFiles) {
        modFiles.forEach(function (file) {
            loadMod(MODS_DIR + "/" + file);
        });

        console.log("[Mod] All mods loaded.");

        modsLoaded = true;
        tryStartGame();
    });
})();
