
(function () {
    "use strict";

    var BASE_WIDTH = 480;
    var BASE_HEIGHT = 270;
    var MAX_SCALE = 4;
    var TAG = "[Integer Scaling]";

    var gameCanvas = document.getElementById("canvas");

    if (!gameCanvas || typeof window_set_size !== "function" ||
        typeof _pF3 !== "function") {
        console.error(TAG, "Required GameMaker functions not found.");
        return;
    }

    var originalWindowSetSize = window_set_size;
    var originalResize = _pF3;

    function getTarget() {
        var dpr = window.devicePixelRatio || 1;
        var vw = window.innerWidth || 852;
        var vh = window.innerHeight || 393;

        var scale = Math.floor(Math.min(
            vw * dpr / BASE_WIDTH,
            vh * dpr / BASE_HEIGHT
        ));

        scale = Math.max(1, Math.min(MAX_SCALE, scale));

        return {
            scale: scale,
            dpr: dpr,
            width: BASE_WIDTH * scale,
            height: BASE_HEIGHT * scale,
            cssWidth: BASE_WIDTH * scale / dpr,
            cssHeight: BASE_HEIGHT * scale / dpr
        };
    }

    function applyCSS(t) {
        var s = gameCanvas.style;

        s.position = "absolute";
        s.width = t.cssWidth + "px";
        s.height = t.cssHeight + "px";
        s.left = "50%";
        s.top = "50%";
        s.right = "";
        s.bottom = "";
        s.margin = "0";
        s.transform = "translate(-50%, -50%)";
        s.maxWidth = "none";
        s.maxHeight = "none";
        s.imageRendering = "pixelated";
        s.touchAction = "none";
    }

    function syncMetrics() {
        if (typeof _ag === "function" && typeof _bg !== "undefined") {
            _ag(gameCanvas, _bg);
        }
    }

    function applyIntegerOutput() {
        var t = getTarget();

        if (gameCanvas.width !== t.width ||
            gameCanvas.height !== t.height) {
            originalWindowSetSize.call(window, t.width, t.height);
        }

        applyCSS(t);
        syncMetrics();

        return t;
    }

    window_set_size = function () {
        return applyIntegerOutput();
    };

    _pF3 = function () {
        var result = originalResize.apply(this, arguments);
        applyIntegerOutput();
        return result;
    };

    var target = applyIntegerOutput();

    console.log(TAG, "Installed.", target);

    var notice = document.createElement("div");
    notice.textContent = "INTEGER SCALE " + target.scale + "x";

    notice.style.cssText =
        "position:fixed;left:8px;top:8px;z-index:2147483647;" +
        "padding:5px 7px;background:rgba(0,0,0,.8);" +
        "color:white;font:11px monospace;pointer-events:none;";

    document.body.appendChild(notice);

    setTimeout(function () {
        if (notice.parentNode) notice.parentNode.removeChild(notice);
    }, 6000);

})();
