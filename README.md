# Deal or No Deal — Multiplayer

Shared studio display and phone controllers for 1–12 contestants. Includes QR joining, optional contestant photos, short Lucky Tap rounds, ranked case selection, two-player elimination rounds, first-to-accept banker offers, final swaps and winner scoring. Includes the supplied studio imagery and films.

## Railway setup

1. Create a Railway service from this repository. The Dockerfile builds the frontend and starts the Node server automatically.
2. Add a persistent **volume mounted at `/data`** to this service.
3. Add variable **`OPENAI_API_KEY`**. Optional: `OPENAI_MODEL` (default `gpt-4.1-mini`).
4. Generate a public Railway domain and open it on the TV. Create a room; contestants scan its QR code.

The app listens on Railway's `PORT`. `DATA_DIR=/data` is set in the Dockerfile. Rooms and global question history live in `/data/game.sqlite`. Attach the volume before playing if you want history retained. Keep **one service replica**: SQLite and in-process action ordering are designed for a single instance. Railway healthcheck: `/health`.

No ChatGPT login or OpenAI Developers plugin is required on Railway. The OpenAI key is read only by the server and must never be committed. No key means browser speech fallback; Lucky Tap itself needs no API call.

## Lucky Tap

Each round uses one shared, concealed target on a normalized square phone board. Everyone gets one tap in 10 seconds after the host speaks; all taps being locked ends the round early. The target is revealed with the results. Distance decides order, then server receipt time and sequence break ties. Players without taps rank last. The top two eliminate cases; initial and final rounds set case-picking and swap order.

A direct hit within the tiny centre target earns one private peek credit. On their phone, the player can inspect any unopened case except their own, including another player's case. The case stays closed and its value is never announced on the TV. Initial-selection credits wait until the player owns a case; unused credits and private peek history persist with the room. Random objects and positions change each round. Trivia generation is no longer used; old question history remains on the volume for compatibility.

## Rules implemented

- Ten-second Lucky Tap challenges replace trivia. A direct hit earns a private peek.
- Every player chooses a different case. Unclaimed cases are the elimination/swap pool.
- The top two active contestants each eliminate one case. Solo tests eliminate one per round.
- First deal acceptance locks that contestant's score; they remain eligible for challenges and eliminations, but cannot accept another offer. Other players play on. All must pass before an unaccepted offer closes.
- With one or two unclaimed cases left, the final offer precedes a swap-order challenge. Swapping returns the old case to the pool.
- Reveal cases one by one. Unsold players score their case value. Highest score wins; lower deals are forfeited. Equal top scores share victory.
- The room creator starts the show; the server advances it automatically. The creator can also join as a contestant.

## Local use

Node 24 or newer:

```sh
npm ci
npm run build
npm test
npm start
```

Open http://localhost:3000. Local data defaults to `./data`. Set `DATA_DIR` to override. The repository contains no live rooms, player photos, question history or API credentials. The Sites-hosted prototype is separate from this Railway deployment.

## Broadcast update

New rooms run automatically after **Start the show**. The server advances the opening, tap rounds, rankings, case reveals, banker calls, offers, final swaps and final reveals. Missing case choices select randomly after 45 seconds; missing swaps keep the case; offers expire to No Deal after 25 seconds. Tap boards open for 10 seconds after the host finishes speaking.

Host narration uses the same `OPENAI_API_KEY`, with stock voice `onyx` and model `gpt-4o-mini-tts`. Optional overrides: `OPENAI_TTS_VOICE` and `OPENAI_TTS_MODEL`. Generated WAVs are cached under `/data/narration` on the existing volume. Narration falls back to browser speech if the API is unavailable. The voice is AI-generated and does not imitate Howie; the supplied Howie recording plays after the offer narration.

Only the main room-creator display speaks. QR links open quiet phone controllers to avoid echo. Sound is on by default; if the browser blocks playback, tap **Enable studio sound** once. All game advances remain server-driven even when the display disconnects. Existing rooms created before this update retain their old state; **create a fresh room** for the broadcast flow.

The TV uses the studio image with case hotspots and the supplied prize-board artwork. Cropped banker footage removes the contestant by framing the upper banker window. Case openings use the supplied close-up footage with the actual game value overlaid. `npm run dev` serves the last built frontend; run `npm run build` after editing it.

## HDTV / real-footage update

The main display now fits a 16:9 HDTV frame with safe-margin player HUDs and no host transcript. Move the pointer to the top edge to reveal room and fullscreen controls. Phone controllers keep their responsive layout.

Four edited case-opening clips rotate in a shuffled order before repeating. Only model/case footage is retained; the original case number and printed prize are replaced by the actual game number/value. No constructed-case scene precedes the video. Banker calls use a real ringing sound. The banker scene stays on screen through the offer; the price sits above the window and acceptance adds DEAL plus the accepting player’s name/photo. The trimmed Howie prompt plays immediately when the offer appears, with no intervening narration.

The narrator uses a more energetic direction and pace. A new audio-cache version regenerates old lines in the new style. Deal-takers remain eligible for **all** tap rounds and eliminations; only unsold players are eligible to accept offers or swap cases. Historical/demographic question prompts require a named date/season and geographic/counting convention. Arithmetic is filtered out and never used as fallback.

## Visual corrections and reaction matching

The ordinary banker scene is now the default. The accepted-deal image is used only after an actual acceptance. Choice and transition instruction cards are removed from the TV display; the phone still carries instructions and the studio retains its highlighted cases and active-player HUD. A compact Keep Case control remains available during swaps for single-device play.

Reveals now prefer footage showing the exact original amount where available: one cent, $300, $10,000, $50,000, $200,000, and $500,000. Other amounts use footage from the same small/medium/large prize group, varying within that group. This matches the models' existing reactions without synthesizing or altering their expressions. Lucky Tap now replaces the trivia selection mechanic.

## Round offers and host pacing

Only contestants who actually opened a case in the current elimination round and have no existing deal can accept or decline its banker offer, including the final offer. A skipped opening does not qualify. All eligible declines close the offer immediately; if no opener is eligible, the game automatically continues. Deal holders still tap and eliminate.

The host explains each procedure once per room, then uses shorter, varied commentary about the public board, contestants and leading deal. Explanation history persists with the room. The stage, ordinary banker and accepted-deal still backgrounds have been edited to remove the blue-shirt contestant while retaining the studio composition. Original archival video footage is unchanged.
