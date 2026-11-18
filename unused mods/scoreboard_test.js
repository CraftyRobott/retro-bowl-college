// ============================================================================
// MOD — DIAGNOSTIC: Check gmlg_m state during match
// ============================================================================

(function () {
    "use strict";

    console.log("[DIAG2] Will check gmlg_m state in 3 seconds...");
    console.log("[DIAG2] Start a match now!");

    setTimeout(function () {
        if (typeof global === "undefined") {
            console.log("[DIAG2] global is undefined");
            return;
        }

        console.log("[DIAG2] typeof global.gmlg_m:", typeof global.gmlg_m);
        
        if (!global.gmlg_m) {
            console.log("[DIAG2] gmlg_m not found, checking other globals...");
            // Check common global names
            ["gmlg_m", "gmlrm", "gmlc", "gmlcontroller", "gmlmatch", "gmlcontroller", "gmlmyteam"].forEach(function(key) {
                if (global[key] !== undefined) {
                    console.log("[DIAG2] " + key + " exists, type:", typeof global[key]);
                }
            });
            return;
        }

        var gm = global.gmlg_m;
        console.log("[DIAG2] gmlg_m keys:", Object.keys(gm));

        // Check team data
        if (gm.gmlteam) {
            console.log("[DIAG2] gmlteam length:", gm.gmlteam.length);
            if (gm.gmlteam[0]) console.log("[DIAG2] gmlteam[0]:", JSON.stringify(gm.gmlteam[0]).slice(0, 200));
            if (gm.gmlteam[1]) console.log("[DIAG2] gmlteam[1]:", JSON.stringify(gm.gmlteam[1]).slice(0, 200));
        }

        // Check scores
        if (gm.gmlscores1) console.log("[DIAG2] gmlscores1:", JSON.stringify(gm.gmlscores1));
        if (gm.gmlscores2) console.log("[DIAG2] gmlscores2:", JSON.stringify(gm.gmlscores2));
        
        // Check quarter/clock
        console.log("[DIAG2] gmlquarter:", gm.gmlquarter);
        console.log("[DIAG2] gmlminutes:", gm.gmlminutes);
        console.log("[DIAG2] gmlseconds:", gm.gmlseconds);

    }, 3000);

})();
