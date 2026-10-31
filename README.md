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
