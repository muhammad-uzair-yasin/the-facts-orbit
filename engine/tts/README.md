# Self-generated narration (Kokoro TTS)

From Nov 2026 The Facts Orbit is narrated by the agent itself (Uzair approved, Oct 31) with the open-source
**Kokoro v1.0** model, voice **am_adam** ("Adam", US male — picked by Uzair from 26 demos on Oct 31 after rejecting af_nicole), speed **1.1** (1.0 for denser scripts; target ~155–175 wpm).
Uzair's own ElevenLabs voice stays on the AI channels.

Setup (once):
```
pip install kokoro-onnx soundfile        # add --break-system-packages in the Claude workspace
curl -L -o engine/tts/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -L -o engine/tts/voices-v1.0.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```
(Model files are ~350 MB and are not committed. GitHub releases are reachable from the Claude workspace; Hugging Face is not.)

Narrate an episode:
```
python3 engine/tts/narrate.py episodes/<ep>/script.txt episodes/<ep> --voice am_adam --speed 1.1
python3 engine/gen_words.py episodes/<ep>/sents.json episodes/<ep>/narration.mp3 episodes/<ep>/words.ts
```
narrate.py synthesizes each phrase separately and writes exact phrase timings to sents.json, so no silencedetect step is needed.
