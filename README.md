# Deal or No Deal — Multiplayer

Shared studio display and phone controllers for 1–12 contestants. Includes QR joining, optional contestant photos, numerical challenges, ranked case selection, two-player elimination rounds, first-to-accept banker offers, final swaps and winner scoring. Includes the supplied studio imagery and films.

## Railway setup

1. Create a Railway service from this repository. The Dockerfile builds the frontend and starts the Node server automatically.
2. Add a persistent **volume mounted at `/data`** to this service.
3. Add variable **`OPENAI_API_KEY`**. Optional: `OPENAI_MODEL` (default `gpt-4.1-mini`).
4. Generate a public Railway domain and open it on the TV. Create a room; contestants scan its QR code.

The app listens on Railway's `PORT`. `DATA_DIR=/data` is set in the Dockerfile. Rooms and global question history live in `/data/game.sqlite`. Attach the volume before playing if you want history retained. Keep **one service replica**: SQLite and in-process action ordering are designed for a single instance. Railway healthcheck: `/health`.

No ChatGPT login or OpenAI Developers plugin is required on Railway. The OpenAI key is read only by the server and must never be committed. No key means built-in question fallback.

## Question history

Questions are recorded globally when a challenge starts, including their answer, explanation, source, room and timestamp. A unique normalized fingerprint rejects exact repeats; token similarity screens close rephrasings. The generator sees previous questions and is asked to choose different facts. Novel paraphrases can still evade similarity screening; this is not a guarantee against all semantic repetition. When built-in trivia is exhausted or generation is unavailable, fresh arithmetic questions keep play moving. Keep the volume to retain history across deployments; replacing/removing it loses history.

## Rules implemented

- Thirty-second closest-answer challenges; equal distance is broken by server receipt time, then receipt sequence. Missing answers rank last.
- Every player chooses a different case. Unclaimed cases are the elimination/swap pool.
- The top two active contestants each eliminate one case. Solo tests eliminate one per round.
- First deal acceptance locks that contestant's score and retires them from further challenges/offers. Other players play on. All must pass before an unaccepted offer closes.
- With one or two unclaimed cases left, the final offer precedes a swap-order challenge. Swapping returns the old case to the pool.
- Reveal cases one by one. Unsold players score their case value. Highest score wins; lower deals are forfeited. Equal top scores share victory.
- Only the room creator advances the game. The creator can also join as a contestant.

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

New rooms run automatically after **Start the show**. The server advances the opening, questions, rankings, case reveals, banker calls, offers, final swaps and final reveals. Missing case choices select randomly after 45 seconds; missing swaps keep the case; offers expire to No Deal after 25 seconds. Challenge answers open for 30 seconds after the host finishes reading.

Host narration uses the same `OPENAI_API_KEY`, with stock voice `onyx` and model `gpt-4o-mini-tts`. Optional overrides: `OPENAI_TTS_VOICE` and `OPENAI_TTS_MODEL`. Generated WAVs are cached under `/data/narration` on the existing volume. Narration falls back to browser speech if the API is unavailable. The voice is AI-generated and does not imitate Howie; the supplied Howie recording plays after the offer narration.

Only the main room-creator display speaks. QR links open quiet phone controllers to avoid echo. Sound is on by default; if the browser blocks playback, tap **Enable studio sound** once. All game advances remain server-driven even when the display disconnects. Existing rooms created before this update retain their old state; **create a fresh room** for the broadcast flow.

The TV uses the studio image with case hotspots and the supplied prize-board artwork. Cropped banker footage removes the contestant by framing the upper banker window. Case openings use the supplied close-up footage with the actual game value overlaid. `npm run dev` serves the last built frontend; run `npm run build` after editing it.
