
(function () {
    "use strict";

    console.log("[Mod Test] Installing instance creation monitor");

    try {
        if (typeof window._181 !== "function") {
            console.error("[Mod Test] Room manager constructor unavailable");
            return;
        }

        var originalCreate = window._181.prototype._1n;

        if (typeof originalCreate !== "function") {
            console.error("[Mod Test] _1n method unavailable");
            return;
        }

        window._181.prototype._1n = function (x, y, objectId) {
            var instance = originalCreate.apply(this, arguments);

            if (objectId === 83) {
                console.log("[Mod Test] SCOREBOARD INSTANCE CREATED", {
                    x: x,
                    y: y,
                    instanceId: instance && instance.id,
                    objectName: instance && instance._WF,
                    objectId: instance && instance._EQ
                });
            }

            return instance;
        };

        console.log("[Mod Test] Instance creation monitor installed");

    } catch (error) {
        console.error("[Mod Test] Monitor installation failed:", error);
    }
})();
