# 🌵 DEAD EYE DUEL — Real-Time Mexican Standoff Quick-Draw Game

**DEAD EYE DUEL** is a mobile-first, two-player real-time duel game built entirely with React (Vite), PeerJS (WebRTC), Tailwind CSS, Framer Motion, and the Web Audio API.

No custom backend, no database, zero server code. All signaling runs peer-to-peer over WebRTC using the free public PeerJS cloud broker.

---

## 🤠 Game Concept & Flow

Two gunslingers face each other in a Mexican standoff with phones in their pockets.
A signal plays, each pulls out their phone and "shoots" by flicking/aiming the phone like a revolver. Whoever fires first wins the round. Best of 3 rounds wins the match and claims the title of **"EL PISTOLERO"**.

### Flow & Screens
1. **HOME**: Choose your gunslinger name and Calavera avatar. Toggle procedural sound effects and secret **Tequila Mode** (heat-wave screen wobble).
2. **CREATE ROOM**: Host generates a clean 4-character room code (e.g., `X7K2`) used as the PeerJS ID (`deadeye-X7K2`). Copy invite link (`/?room=X7K2`) or share natively.
3. **JOIN ROOM**: Rival enters code or clicks the invite link to enter the cantina.
4. **LOBBY**: Shows both gunslingers facing each other. Run sensor diagnostics, grant iOS motion permissions, or toggle "Tap to shoot". When both are `LISTO` (Ready), host fires starting shot.
5. **DUEL ROUND**:
   - **Phase 1 "HOLSTER"**: "Put your phone away. Hands down." Tense 3... 2... 1... countdown with heartbeat sound and haptic pulses.
   - **Phase 2 "WAIT"**: Screen goes pitch black with staring eyes peering across the screen. A random delay of 2.2 to 5.8 seconds chosen by the Host. **Firing during this phase = FALSE START = instant round loss.**
   - **Phase 3 "DRAW!"**: Screen flashes red, trumpet fanfare blasts, and huge **¡FUEGO!** appears. First valid shot wins!
   - **Phase 4 "RESULT"**: Revolver recoils with muzzle flash, cylinder rotates +60°, persistent bullet hole punctures the screen, and reaction times are compared in milliseconds (`287ms vs 312ms`).
6. **MATCH END**: First to 2 points wins match. Celebratory mariachi fanfare + confetti shower for the winner, round history log, rematch button.

---

## 🔫 The Weapon: Colt Peacemaker .45

Drawn in pure scalable vector graphics (SVG):
- Long octagonal steel barrel with front sight blade and ejector tube.
- Blued engraved frame with screw accents and curved trigger guard.
- **Visibly rotating 6-chamber cylinder** that advances 60° on every shot with ratchet sounds.
- **Cocking hammer** that cocks back during the draw and snaps forward on trigger pull.
- **Heavy recoil kickback** and explosive multi-point muzzle flash with smoke ring.

---

## 📱 How Shooting Works

### 1. Motion Sensor Gesture (Pull from pocket)
- Uses the `DeviceMotionEvent` and `DeviceOrientationEvent` API.
- Detects sudden upward acceleration spike (`> 13.5 m/s²`) followed by pitch tilt facing forward (`50° - 130°`).
- Sensitivity is tunable via the slider in the Lobby.
- **iOS 13+ Support**: Includes an explicit `DeviceMotionEvent.requestPermission()` prompt button in the lobby triggered on user tap.

### 2. Tap to Shoot / Desktop Fallback
- Tap or click anywhere on the screen, or hit `SPACEBAR`.
- Automatically activates on desktop browsers or when motion permissions are not granted.

### 3. Haptics
- Uses `navigator.vibrate` for heartbeat pulses, gun recoil kicks, and false start buzzes on supported devices.

---

## 🎶 Procedural Web Audio API Synthesizer

Zero external MP3/WAV files required. 100% synthesized in real time with sub-millisecond latency:
- **Gunshot**: Exponential white/pink noise burst + steep 4.5kHz lowpass sweep + sub-bass 180Hz->32Hz chest punch.
- **Revolver Cock**: Dual-stage metal clicks at 2600Hz and 3400Hz.
- **Cylinder Spin**: Rapid 6-stage ratchet clicks.
- **Heartbeat**: Rhythmic "lub-dub" low sine kicks during holster countdown.
- **Trumpet Draw Stinger**: Ennio Morricone / Mariachi brass chords (C5, E5, G5) on **¡FUEGO!**.
- **Mariachi Win Fanfare**: Triumphant Mexican brass melody.
- **Western Whistle**: Dual sine oscillator glide with 5.5Hz vibrato.
- **Desert Wind**: Modulated pink noise bandpass filter simulating desert breeze.
- **Ricochet**: High pitch slide (2600Hz -> 220Hz).

---

## ⚖️ Fairness & Network Synchronization

1. **Host Authoritative Timing**: The host generates the random draw delay and schedules `hostDrawAt`.
2. **Ping/Pong Clock Synchronization**: Runs 5 samples upon connection to calculate median clock offset (`opponentClock - hostClock`) and round-trip time (RTT).
3. **Local Reaction Time Calculation**: Each device calculates `reactionMs = localShotTime - localDrawScheduledAt`.
4. **Draw Window**: If both players shoot within `15ms` of each other, it is recorded as a simultaneous draw and replayed.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🧪 Testing

### Option A: Two Browser Tabs on One Computer
1. Open `http://localhost:5173` in Tab 1 (Host).
2. Click **CREATE ROOM**. Copy the 4-letter room code (e.g. `K9W2`).
3. Open `http://localhost:5173/?room=K9W2` (or click Join Room and enter `K9W2`) in Tab 2 (Rival).
4. Both players click **READY TO DRAW**.
5. Host clicks **START DUEL MATCH**.
6. When **¡FUEGO!** appears, press `SPACE` or click the screen to test reaction times!

### Option B: Two Phones on the Same Wi-Fi
1. Start the Vite server: `npm run dev -- --host`
2. Open the network IP shown (e.g., `http://192.168.1.X:5173`) on both phones.
3. *Note on Motion Sensors*: Browsers require **HTTPS** for `DeviceMotionEvent`. For local testing with motion sensors on real phones, use a secure tunnel such as [ngrok](https://ngrok.com) or [Cloudflare Tunnels]:
   ```bash
   ngrok http 5173
   ```
   Open the HTTPS ngrok URL on both phones, click **ENABLE SENSORS**, put the phones in your pockets, and duel!

---

## 🌐 Deploy to Vercel or Netlify (HTTPS Required for Sensors)

Because device motion sensors require a secure HTTPS context:

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

---

## 🛠 WebRTC NAT & TURN Configuration

By default, the game uses public Google and Twilio STUN servers (`stun:stun.l.google.com:19302`, `stun:global.stun.twilio.com:3478`).

If two players are on different strict corporate cellular networks or symmetric NATs, a TURN server can be added in `src/hooks/usePeer.js`:

```javascript
config: {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Optional TURN server credentials:
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'user',
    //   credential: 'password'
    // }
  ]
}
```

---

## 🌵 Polish & Easter Eggs
- **Tequila Mode**: Click the cactus button in the top left of the home screen to activate a drunken heat-wave screen distortion.
- **Persistent Bullet Holes**: Every gunshot creates a bullet impact crater with fracture cracks that persists throughout the match.
- **6 Calavera Avatars**: El Pistolero, La Calavera, El Bandido, Don Roberto, La Muerte, and Señorita Sombra.
- **Wooden Scoreboard**: Scratched tally marks for best-of-3 score keeping.

