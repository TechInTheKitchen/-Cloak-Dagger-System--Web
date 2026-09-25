# cloak\dagger\system — local web client

Unofficial solo play interface for Ruminastro's game, version 0.5. The PDF is unchanged. The text file has had its whitespace restored from the PDF, with every non-whitespace character preserved. The previous extraction is in `reference/original-extraction.txt`. Original game © 2026 Ruminastro, CC BY-NC 4.0. The original game's statement about being human-made describes the game, not this web adaptation.

## License, original attribution, and written approval

The original contributions to this web adaptation are licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). See [LICENSE.txt](LICENSE.txt) for the license and attribution notice and a link to the full legal terms.

The original game, **cloak\dagger\system v0.5**, is © 2026 [Ruminastro](https://ruminastro.itch.io/) and is also licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). The supplied game text and PDF retain their original wording and notices; only the text extraction whitespace has been repaired from the PDF.

The project maintainer obtained written approval from Ruminastro to try adapting the game into a web-based client. The approval correspondence has not been supplied with this project or reproduced here; this reference does not assert an approval date, additional permission terms, or endorsement.

The adaptation adds the interface, UUID and rules automation, scratchpad, local saves, and terminal presentation. The inherited hosting server and launcher retain their existing [MIT notice](HOSTING-LICENSE.txt).

## Author playtesting

Edit `data/objectives.json` for objectives and `data/uuid-rules.json` for UUID actions, setup, and flow values. Both drive the actual game behavior. See [AUTHORING.md](AUTHORING.md) for fields, examples, supported actions, and save compatibility. Run `tools/Validate Rules.cmd` to validate edits. New sessions fetch the current JSON; existing saves keep their rules snapshot. Rules displays and `rules full` fetch the live `.txt` file every time.

## Start locally

Double-click `tools/Open Local Site.cmd`. Requires Node.js. It opens the first free localhost port from 8765 to 8775; keep the server window running. Or run `node tools/local-server.cjs --no-open` from this folder. Opening index.html directly does not load the rules text correctly.

The server and launcher are adapted from your Obsidian GitHub Web Hosting project. Its MIT notice is preserved in `HOSTING-LICENSE.txt`. The server binds only to 127.0.0.1. This application needs no npm installation, remote fonts, external scripts, account, or backend service.

## Play

1. Read Rules and make the three setup choices. Initialize locks those choices and generates a cryptographic UUID v4. Define your setting and 3–6 personages in the scratchpad.
2. Select an objective and its permitted variable. Read next opens the original character rule; Burn confirms the action. Only the next unburned UUID character can be consumed normally.
3. Numbers add to the total. Letters offer their relevant choices. `b` can extend the allowance, `d` is assigned to a number during resolution, `e` offers unburned characters for extraction, and `f` burns all remaining fours. Burning a stored copy does not consume the normal reading allowance.
4. Resolve when ready or stop before a letter. Burning `c` or exhausting a UUID forces resolution. A total of 16 succeeds. Objective effects, risk, and opsec are tracked automatically. Exhausted UUIDs are replaced automatically and raise risk by 1; `uuid` is a display command, not a free reroll.
5. Scene, Report, and Epilogue prompts show the original text. Add an entry to the scratchpad or acknowledge one already written before beginning the next move. Additional queued prompts are available with `chronicle` or **+ Entry**.

Select scratchpad text and use bold, italic, underline, strikethrough, or a bullet list. Pasted content is plain text. The game and notes autosave in this browser's local storage. Export periodically for a portable JSON backup. Import validates the game state and strips active markup from notes. Local storage belongs to the exact URL and port; another browser, a different port, clearing browser data, or private browsing can make a save unavailable. Export/import transfers it.

Undo reverses game actions in the current page session. It does not undo scratchpad edits; use normal editor undo for text. Starting a new session clears the current game and notes, with an export button offered first.

Type `rules full` to print the complete, unchanged original game text in the terminal, one source line every 140 milliseconds. Spaces, tabs, and line breaks are preserved; long lines scroll horizontally without wrapping, keeping the ASCII art aligned. Use `stop` or the Stop output button to interrupt; `clear` also cancels and removes the output. Scroll upward to read without being pulled back to the bottom. Running `rules full` again restarts the transmission. This reference output is temporary and is not added to your saved game or export.

Terminal commands: `help`, `status`, `read`, `resolve`, `copy`, `move 1` through `move 9`, `rules`, `rules full`, `stop`, `chronicle`, `uuid`, `history`, `undo`, `export`, `clear`. These commands operate the game only, not hostile operating systems. Scanlines can be turned off with the terminal title-bar button.

## Original-profile adaptation decisions to review

The source is experimental and does not settle every interaction explicitly. This first implementation leaves its text intact and makes these client decisions explicit:

- Completed objectives stay completed (no repeat cycles); the major objectives unlock after four distinct basic completions.
- Multiple `a` characters still mean two boxes, rather than stacking extra boxes. Each `b` grants the original variable's value for that move.
- `d` choices wait until resolution so a later number in the same move can be selected; a number is doubled at most once. A `d` with no numerical target has no effect.
- Fours consumed by `f` are eligible for `d` and do not spend the ordinary allowance. They do not move the active field used for Scorched earth; that field is the last ordinarily consumed character's field. If there is no following field, no field is struck.
- An extracted character triggers its usual effect and flaw risk, and is consumed outside the normal allowance. A full extract slot cannot be overwritten.
- Risk is allowed below zero because the supplied text gives no minimum. Risk locks at 16, opsec caps at 4, and a nonpositive cloak/dagger gives no ordinary character allowance.

These are implementation choices for playtesting, not changes to the original rules. There is no automation for the story aspects journaling the player's resposibility.