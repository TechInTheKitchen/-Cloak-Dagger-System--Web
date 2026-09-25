# Playtesting without editing JavaScript

Edit these files in a text editor. They are read directly by the static site; there is no build step.

| File | Controls | When changes appear |
| --- | --- | --- |
| `cloak dagger system.txt` | Full game text, ASCII headings, chapter references, letter/Chronicle popup wording | Next `rules full`, Rules, character reference, or Chronicle request; no page reload needed |
| `data/objectives.json` | Objective names, IDs, categories, box counts, variables, rewards, and major unlock requirement | Start a **New session**; it fetches both JSON files again |
| `data/uuid-rules.json` | Setup choices, numeric values, letter actions, success/failure, risk/opsec, UUID exhaustion, text filename, and terminal speed | Start a **New session** |

Existing sessions and exported saves contain their own JSON rules snapshot. They continue under those rules even after the files change. To try edited rules, export any current game you want to keep, then start a new session. Reloading alone preserves the active game's snapshot. An on-screen note shows whether it differs from the files loaded at page startup. Text is always live and is not frozen in a save.

## Safe editing workflow

1. Edit the `.txt` file for prose changes; preserve ASCII spaces in a monospaced editor.
2. Edit the appropriate JSON mechanics. Change its `revision` label (for example `playtest-2026-09-25-b`) so players can identify the version. Keep `schemaVersion` at `1`.
3. Run `node tools/validate-config.cjs`, or double-click `tools/Validate Rules.cmd`. It checks syntax, supported fields, ranges, objective references, and text-reference markers.
4. Start a new session. The server can stay running. No JavaScript edits or package installation are needed.

JSON uses double quotes, no comments, and no trailing commas. Unknown field names and unknown action types fail validation rather than being silently ignored. A configuration error leaves existing saved data intact.

The text and mechanics are intentionally separate: changing a sentence does not infer new game logic. Update both when a playtest changes the written rules. Character popups show the live document excerpt alongside a short summary of the active JSON behavior.

## Objectives

`majorUnlockBasicCompletions` is the number of distinct completed basic objectives required to unlock majors. It cannot exceed the number of basic objectives.

Each item in `objectives` has:

| Field | Meaning |
| --- | --- |
| `id` | Stable, unique lowercase identifier, such as `refine-plan`. Setup bonuses refer to this ID rather than the list position. |
| `name` | Name displayed in the GUI and terminal. |
| `kind` | `basic` or `major`. Completing all majors wins. At least one major is required. |
| `size` | Number of boxes, from 1 to 100. |
| `stat` | `cloak`, `dagger`, or `either`. |
| `effects` | Ordered list of effects applied once on completion; `[]` means no reward. |

Supported completion effects:

```json
[
  {"type": "adjust", "stat": "cloak", "amount": 2},
  {"type": "adjust", "stat": "risk", "amount": -1},
  {"type": "burnNextField"}
]
```

`adjust` accepts `cloak`, `dagger`, `risk`, or `opsec` and a positive, zero, or negative integer amount. Risk locking and the opsec maximum still apply. `burnNextField` strikes the UUID field after the last ordinarily consumed character's field without applying its characters' effects. If no following field exists, it does nothing.

Add, remove, or reorder objectives directly in the array. If removing or renaming an ID referenced in `uuid-rules.json` → `setup.structure`, update that reference too. A setup bonus must be less than that objective's `size`; initialization does not complete objectives or award completion rewards.

## UUID flow and variables

| JSON field | Meaning |
| --- | --- |
| `textFile` | Relative path to the live `.txt` file within the site. Default: `cloak dagger system.txt`. |
| `terminalLineDelayMs` | Delay per source line for `rules full`; default 140, permitted 0–5000 ms. |
| `move.successTotal` | Minimum successful total. |
| `move.successBoxes` | Normal boxes awarded on success. |
| `move.failureRisk` | Risk adjustment after failure. |
| `risk.lockAt` | Risk value at which risk becomes fixed. |
| `risk.minimum` | Lowest risk, or `null` for no floor. |
| `risk.flawIncrement` | Risk gained each time a character in the chosen flaw is burned. |
| `risk.attritionOpsec` / `risk.attritionStat` | Opsec and chosen cloak/dagger cost at the start of turns after risk locks. |
| `opsec.start` / `opsec.maximum` / `opsec.loseAt` | Starting value, cap, and defeat threshold. |
| `exhaustion.risk` | Risk adjustment when the current UUID is exhausted and replaced. |
| `numbers.multiplier` | Multiplier for ordinary digits and digits swept by a letter. Default 1. |

The UUID remains a real version 4 UUID with five standard fields, decimal digit values, and left-to-right consumption. The extract slot holds one character. These structural rules are not editable settings.

## Letter actions

Every key `a` through `f` must have a rule in `letters`. Its `name` is a display label. Its `action` selects behavior; it is not tied to the key's original letter. For example, assign `extract` to `a` to make `a` display the extract chooser and execute extraction.

| `action` | Additional fields | Behavior |
| --- | --- | --- |
| `amplify` | `boxes` | Raises the successful award to at least this many boxes. Multiple amplifiers use the largest award, without stacking. |
| `extend` | `variableMultiplier` | Offers optional additional allowance equal to the move's starting variable × this multiplier. |
| `chronicle` | `scenes` | Queues this number of Scene prompts after resolution. |
| `double` | `multiplier` | Queues multiplication of one numeric contribution at resolution. Each number may be targeted once; despite the action name, the multiplier can be 3, etc. |
| `extract` | none | Offers an unburned character to store, if the single slot is empty. |
| `sweep` | `digit`, `emptyTotal` | Burns all remaining copies of the string digit, e.g. `"4"`, outside the normal allowance; if none remain, adjusts total by `emptyTotal`. |
| `none` | none | No special effect. The chosen mortal flaw can still increase risk. |

Any letter may also have `resolveImmediately: true` to force resolution after its action. Omitting it means false. By default only `c` has it.

Example: change `d` to triple a number, retaining its document reference:

```json
"d": {
  "name": "triple",
  "action": "double",
  "multiplier": 3,
  "reference": {"start": "d =", "end": "e ="}
}
```

When changing an action, remove the previous action's extra fields and supply those required by the new action. You can combine the supported choices and tune their values without JS. An entirely new kind of mechanic requires adding an engine handler; arbitrary scripts and formulas are not executed from JSON.

## Text references and ASCII formatting

`numbers.reference` and each letter's `reference` select an excerpt of the live text using exact `start` and `end` markers at the beginning of source lines (optional indentation is allowed) (start included, end excluded). If you rename the markers in the text, update them in JSON. Missing markers produce an explicit reference warning. `tools/validate-config.cjs` also checks them.

Chapter navigation recognizes lines starting `CH.1 -` through `CH.6 -`. Chronicle references recognize `You'll write a Scene`, `You'll write a Report`, `You'll write an Epilogue`, and `That's the whole game.` Keep these markers for the current built-in navigation.

The repaired text was recovered from the original PDF's literal monospaced character glyphs. The repair only changes whitespace: all non-whitespace characters match the initially supplied extraction. The original PDF is unchanged; the previous extraction is kept in `reference/original-extraction.txt`. The terminal and rules viewer preserve spacing and use horizontal scrolling instead of wrapping ASCII headings. Any later author edits to the `.txt` file become the displayed text.

## Setup

Edit `setup.wing`, `setup.structure`, and `setup.flaw`. Their arrays drive the setup menus automatically, including the displayed numbers. You can add or remove choices.

- A wing has `label`, `cloak`, `dagger`, and `risk`.
- A structure has `label`, `objective` (stable ID), `boxes`, and `risk` (adjustment).
- A flaw has `label` and `letters` (unique a–f characters, or an empty string for none).

## Existing saves and verification

Pre-JSON saves can be migrated under the supplied original `ruminastro-0.5` profile with the original objective IDs and order. Import those before editing the profile. Thereafter each save contains its own configuration; do not manually edit that snapshot to migrate an active game to new rules. Start a fresh session instead. New imports validate their embedded rules before replacing the current game.

`node --test tools/test-engine.cjs` tests the shipped original profile as well as altered test profiles. After intentionally changing balance values, original-profile assertions may differ; `node tools/validate-config.cjs` is the general validator for your edited files.
