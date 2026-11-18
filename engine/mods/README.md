# Retro Bowl College — Code Modding System

This folder contains a **code modding system** for the HTML5 build. Unlike the
`data/` folder (which only edits text/JSON), this lets you change the **actual
game code** — throw accuracy, XP gain, attribute caps, AI behavior, UI logic,
and more.

## How it works

GameMaker:Studio HTML5 exports all game logic as **global JavaScript
functions**:

```
gml_Script_s_throw_ball(...)      <- reusable game scripts
gml_Script_s_qb_mode_auto_xp(...) <- QB mode XP
gml_Object_obj_foo_Create_0(...)  <- object creation events
gml_Object_obj_bar_Step_0(...)    <- per-frame step events
global.gmlmaster_ball = -4        <- global variables
```

Because these are all in the global scope, a script loaded **after**
`html5game/RetroBowl.js` can simply **redefine** any function to replace the
original behavior.

Load order in `index_nopoki.html`:

```
1. html5game/RetroBowl.js   <- base engine (DO NOT EDIT)
2. engine/mods/loader.js    <- this loader
3. engine/mods/*.js         <- your mods (alphabetical / listed order)
```

## How to make a mod

1. **Copy** `override_template.js` to a new file, e.g. `my_mod.js`.
2. **Open** `html5game/RetroBowl.js` and search for the function you want to
   change, e.g. `function gml_Script_s_throw_ball`.
3. **Copy the entire function** (from `function ...` to its closing `}`).
4. **Paste** it into your mod file and edit the body.
5. **Add** your filename to the `MOD_FILES` array in `loader.js`.
6. **Refresh** the game.

## Finding functions to mod

Use this PowerShell command inside `D:\retro-bowl-college-html5\` to list every
moddable function:

```powershell
$text = Get-Content html5game\RetroBowl.js -Raw
$funcs = @()
$pos = 0
while (($pos = $text.IndexOf('function gml_', $pos)) -ge 0) {
    $end = $text.IndexOf('(', $pos)
    $name = $text.Substring($pos + 11, $end - $pos - 11)
    if ($funcs -notcontains $name) { $funcs += $name }
    $pos++
}
$funcs | Sort-Object
```

Or grep for a topic:

```powershell
Select-String -Path html5game\RetroBowl.js -Pattern 'function gml_Script_s_throw'
Select-String -Path html5game\RetroBowl.js -Pattern 'function gml_Script_s_xp'
Select-String -Path html5game\RetroBowl.js -Pattern 'function gml_Script_s_accuracy'
```

## Example mods included

| File | What it demonstrates |
|------|---------------------|
| `example_balance.js` | Overriding `global.*` variables + skeletons for XP/attribute functions |
| `example_attributes.js` | Skeletons for player attribute caps and QB auto-XP |
| `override_template.js` | Blank template to copy for your own mods |

All examples are **disabled by default** (commented out). Edit them to enable.

## Tips

- `_inst` = the object instance; `_other` = usually the controller/globals.
- Player attributes live in `ds_map`s with keys `"skill"`, `"speed"`,
  `"strength"`, `"stamina"`, `"max_skill"`, etc.
- Use `console.log("[Mod] ...")` to debug — open browser DevTools (F12).
- If a mod breaks the game, remove it from `MOD_FILES` in `loader.js` and
  refresh.

## Limitations

- The engine (`RetroBowl.js`) is 9.3 MB of compiled GameMaker output. Some
  logic is hard to read due to GameMaker's verbose JS (`yyGetBool`,
  `yyfless`, `ds_map_find_value`, etc.), but it is fully functional JS.
- Overriding a function replaces it entirely — copy the original body first,
  then edit only what you need.
- Some functions call each other; if you override a function that's called by
  another you didn't override, behavior may change unexpectedly.
