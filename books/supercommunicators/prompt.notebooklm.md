# NotebookLM prompt — Supercommunicators (Charles Duhigg)

**Slug:** `supercommunicators` · **Genre:** nonfiction · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Supercommunicators" by Charles Duhigg.

THE ANGLE (non-obvious lens — commit to it):
- The arguable thesis: connection has almost nothing to do with being articulate. Our worst misunderstandings are two people confidently having DIFFERENT KINDS of conversations at the same time — and a "supercommunicator" is simply the person working hardest to detect which conversation you're really in, then matching it. The whole episode proves that connection is a learnable skill of attention, not a gift of charisma.
- The phrase-that-pays, returned to every beat: "What's this really about?"

STRUCTURE (follow strictly):
1. COLD OPEN (0:00-0:25): drop mid-scene — one partner comes home venting about a brutal day; the other, trying to help, starts problem-solving; both walk away hurt. Name the invisible mistake: they were in two different conversations. No greetings, no "welcome back", no "today we're looking at".
2. THESIS: state it plainly (above).
3. SETUP: the three kinds of every conversation — Practical ("What's this really about?"), Emotional ("How do we feel?"), Social ("Who are we?") — and the Matching Principle: you only truly connect when you're in the SAME kind of conversation.
4. BEATS: 8 beats, each ONE specific claim + a concrete case from the book. DEVELOP each fully — do NOT list them quickly. Anchor beats to these:
   - The "quiet negotiation": every conversation silently opens by deciding what kind it is; we usually get it wrong by assuming ours is the right one.
   - The Matching Principle in the wild: the psychologist screening astronaut candidates for people who could read and match the room, not the smartest or calmest.
   - The Practical conversation is never only practical — beneath logistics sit control, values, hidden agendas; "what's this really about" has two answers (the topic AND the need).
   - The Emotional conversation & reciprocal vulnerability: Jim Lawler, the CIA officer, wins over the agent he's recruiting not by arguing but by admitting his own doubt first — matching feeling, not facts.
   - Deep questions & Arthur Aron's Fast Friends Procedure (the "36 questions"): asking about values and feelings, not facts, turns strangers intimate — and people underestimate how much others want to be asked.
   - Looping for understanding: ask, summarize back what you heard, ask "did I get it right?" — proving you're listening is what actually changes the other person.
   - Neural entrainment: Beau Sievers' Dartmouth work — connected people's brains literally sync; the person who ALIGNS a group listens most and dominates least, the opposite of the "loudest in the room."
   - The Social "Who are we?" conversation & hard talks online: identities hijack conversations about guns, politics, race; the study where opponents connected only after each side's identity was acknowledged out loud.
5. COUNTERPOINT: one honest criticism — does naming conversation-types and "looping" risk turning empathy into a technique or a manipulation? Is it always clear whether the method CAUSES connection or just describes people who were already warm? Let the two hosts genuinely disagree here.
6. PAYOFF: land it — the supercommunicator isn't the best talker in the room; it's the one who keeps asking "what's this really about?" Connection is attention, and attention can be practiced.

DEPTH ENGINE (run this on EVERY beat — this is how the episode earns its length):
a) drop us into a scene in present tense with one vivid sensory detail; voice the people;
b) land the point ("here's what that means for you");
c) add a SECOND concrete example, number, or angle from the book;
d) take one honest "wait - but then..." turn where the two hosts genuinely disagree;
e) tie it back to the recurring phrase-that-pays before moving to the next beat.

LENGTH (target 45-60 minutes, minimum 45 — never shorter): give each beat 4-6 real minutes. BUT never pad to hit the number. Do NOT repeat a point you already made, do NOT restate the thesis over and over, do NOT stall with filler, throat-clearing, or "as we said earlier". Earn the length by going DEEPER, not longer on the same ground: a fresh example, a sharper objection, a genuine disagreement between the two hosts, a real "wait — but then..." turn. If you truly run out of things to say about a beat, MOVE ON rather than recycle it. Sound like two sharp people who honestly can't stop talking about this book — not a summary stretched to fill time. Do NOT signal an ending ("to wrap up", "in short", "so to sum up") before the final PAYOFF.

HARD RULES:
- English only (US audience). Two hosts in real conversation — disagree, interrupt, build on each other.
- Use ONLY facts from the book and its real, well-documented cases. NEVER invent quotes, numbers, studies, or events; if unsure of a detail, stay general instead of fabricating.
- NEVER mention "sources", "notebook", "documents", or that this is AI; never break character — you are two people who could not stop thinking about this book.
- No generic praise, no plot-recap for its own sake. Prefer specific over abstract: names, concrete scenes, numbers.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/supercommunicators.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/supercommunicators.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=supercommunicators --title="Supercommunicators" --author="Charles Duhigg" --genre=nonfiction
```
