(function () {
  "use strict";

  var originalX = window.device_mouse_x_to_gui;
  var originalY = window.device_mouse_y_to_gui;

  if (
    typeof originalX !== "function" ||
    typeof originalY !== "function"
  ) {
    console.error("[Touch Fix] Original input functions not found.");
    return;
  }

  window.device_mouse_x_to_gui = function (id) {
    id = yyGetInt32(id);

    if (!canvas || !_bg || !_EK || !_BK) {
      return originalX.apply(this, arguments);
    }

    var pointerX = id === 0 ? _vg : (_og[id] ? _og[id].x : 0);
    var rect = canvas.getBoundingClientRect();

    if (!rect.width) {
      return originalX.apply(this, arguments);
    }

    _ag(canvas, _bg);

    return ~~((pointerX - rect.left) * (_EK / rect.width));
  };

  window.device_mouse_y_to_gui = function (id) {
    id = yyGetInt32(id);

    if (!canvas || !_bg || !_EK || !_BK) {
      return originalY.apply(this, arguments);
    }

    var pointerY = id === 0 ? _wg : (_og[id] ? _og[id].y : 0);
    var rect = canvas.getBoundingClientRect();

    if (!rect.height) {
      return originalY.apply(this, arguments);
    }

    _ag(canvas, _bg);

    return ~~((pointerY - rect.top) * (_BK / rect.height));
  };

  console.log("[Touch Fix] CSS-based GUI input mapping installed.");
})();