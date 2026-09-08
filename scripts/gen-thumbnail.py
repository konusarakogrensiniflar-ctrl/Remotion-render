"""
gen-thumbnail.py — generate the thumbnail hero image (Flux) + cut-out (rembg)
from a youtube-meta.<slug>.json thumbnail brief.

Prompt styles rotate per slug so adjacent videos never share the same look.
Use --candidates=3 to generate 3 options and auto-pick the sharpest.

Usage: python scripts/gen-thumbnail.py books/<slug>/youtube-meta.json [--candidates=N]
"""
import requests, base64, os, sys, time, json, hashlib

ROOT = os.path.join(os.path.dirname(__file__), "..")
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(ROOT, ".env"))
except Exception:
    pass

API_KEY = os.environ.get("NVIDIA_API_KEY")
if not API_KEY:
    print("ERROR: NVIDIA_API_KEY not found"); sys.exit(1)
INVOKE_URL = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b"

# Flux is bad at rendering text — suppress it in every prompt so Remotion handles all text.
NO_TEXT_SUFFIX = ", no text, no words, no letters, no writing, no typography, no labels, no captions, no titles"

# ── DIVERSE PROMPT STYLES ────────────────────────────────────────────────────
# Rotated per slug hash so two adjacent books never share the same photographic feel.
FLUX_STYLES = [
    "cinematic studio portrait, professional lighting, medium close-up, vivid colors, sharp focus, poster quality",
    "vintage 70mm film still, warm grain, golden hour, Kodak Portra tones, shallow depth of field",
    "stark editorial photograph, high contrast, desaturated background, single strong key light",
    "dramatic chiaroscuro, Rembrandt lighting, deep blacks, painterly quality, museum portrait",
    "bright commercial portrait, clean solid-color background, pop of accent color, lifestyle feel",
    "cold blue moonlit scene, moody atmosphere, muted tones, cinematic anamorphic bokeh",
]

def slug_hash(s):
    h = int(hashlib.md5(s.encode()).hexdigest(), 16)
    return h / (2**128)

def pick_style(slug):
    """Deterministic style from slug so it's repeatable but distributed."""
    idx = int(slug_hash(slug) * len(FLUX_STYLES))
    return FLUX_STYLES[idx % len(FLUX_STYLES)]

# ── ARGS ─────────────────────────────────────────────────────────────────────
candidates = 1
meta_path = None
for arg in sys.argv[1:]:
    if arg.startswith("--candidates="):
        candidates = int(arg.split("=")[1])
    else:
        meta_path = arg

if not meta_path:
    print("Usage: python scripts/gen-thumbnail.py <meta-json> [--candidates=N]")
    sys.exit(1)

with open(os.path.join(ROOT, meta_path), "r", encoding="utf-8") as f:
    meta = json.load(f)

thumb = meta["thumbnail"]
subject = thumb["subject"]
img_rel = thumb["image"]
cut_rel = thumb.get("cut")

# Extract slug from path for style rotation
slug = meta_path.split("/")[-1].replace("youtube-meta.", "").replace(".json", "")
if "slug" in meta:
    slug = meta["slug"]
elif "slug" in thumb:
    slug = thumb["slug"]

style = thumb.get("fluxStyle") or pick_style(slug)
print(f"  slug: {slug}")
print(f"  style: {style}")
print(f"  subject: {subject}")

# Build prompt WITHOUT the old hardcoded suffix — style rotates per book.
# The subject from plan-meta already contains the specific person/object/scene.
prompt = f"{subject}. {style}, eye-catching, no watermark, 8k" + NO_TEXT_SUFFIX
print(f"  prompt: {prompt[:120]}...")

def gen(rel, prompt, tag="hero"):
    out = os.path.join(ROOT, "public", rel)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    payload = {"prompt": prompt, "width": 1024, "height": 1024, "steps": 4}
    headers = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}
    for attempt in range(1, 5):
        try:
            print(f"[{tag}] attempt {attempt}", flush=True)
            r = requests.post(INVOKE_URL, headers=headers, json=payload, timeout=120)
            if r.status_code == 200:
                arts = r.json().get("artifacts") or []
                b64 = arts[0].get("base64") if arts else None
                if b64:
                    with open(out, "wb") as fh:
                        fh.write(base64.b64decode(b64))
                    print(f"  [OK] {rel} ({os.path.getsize(out)/1024:.0f} KB)"); return True
            print(f"  [ERR] HTTP {r.status_code}: {r.text[:140]}")
        except Exception as e:
            print(f"  [ERR] {e}")
        time.sleep(8 * attempt)
    return False

def image_sharpness(path):
    """Laplacian variance — higher = sharper."""
    try:
        from PIL import Image, ImageFilter
        import numpy as np
        img = Image.open(path).convert("L")
        arr = np.array(img.filter(ImageFilter.Kernel((3,3), [-1,-1,-1,-1,8,-1,-1,-1,-1], scale=1, offset=128)))
        return float(arr.var())
    except Exception:
        return 0

if candidates > 1:
    print(f"\nGenerating {candidates} candidates, will auto-pick sharpest...\n")
    best_path = None
    best_score = -1
    for c in range(candidates):
        suffix = f"_candidate_{c}"
        cand_rel = img_rel.replace(".png", f"{suffix}.png")
        if gen(cand_rel, prompt, tag=f"candidate-{c}"):
            cand_path = os.path.join(ROOT, "public", cand_rel)
            score = image_sharpness(cand_path)
            print(f"  sharpness[{c}]: {score:.1f}")
            if score > best_score:
                best_score = score
                best_path = cand_path
    if best_path:
        import shutil
        final = os.path.join(ROOT, "public", img_rel)
        shutil.copy2(best_path, final)
        print(f"\n  [PICK] best candidate → {img_rel} (sharpness={best_score:.1f})")
        # clean up candidates
        for c in range(candidates):
            suffix = f"_candidate_{c}"
            cand = os.path.join(ROOT, "public", img_rel.replace(".png", f"{suffix}.png"))
            if os.path.exists(cand):
                os.remove(cand)
    else:
        print("All candidates failed"); sys.exit(1)
else:
    if not gen(img_rel, prompt):
        print("hero generation failed"); sys.exit(1)

# ── CUT-OUT ──────────────────────────────────────────────────────────────────
if cut_rel:
    try:
        from rembg import remove, new_session
        from PIL import Image
        # u2net_human_seg is better for people; u2net for mixed subjects
        model = "u2net_human_seg" if any(k in subject.lower() for k in ["woman", "man", "girl", "boy", "person", "face", "child", "warrior", "soldier"]) else "u2net"
        print(f"  cutout model: {model}")
        session = new_session(model)
        img = Image.open(os.path.join(ROOT, "public", img_rel)).convert("RGBA")
        out = remove(img, session=session, post_process_mask=True)
        # trim to subject bbox with padding
        bbox = out.split()[3].point(lambda a: 255 if a > 10 else 0).getbbox()
        if bbox:
            pad = 16
            l, t, r, b = bbox
            l = max(0, l - pad); t = max(0, t - pad)
            r = min(out.width, r + pad); b = min(out.height, b + pad)
            out = out.crop((l, t, r, b))
        dst = os.path.join(ROOT, "public", cut_rel)
        out.save(dst)
        print(f"  [OK] cutout {cut_rel} ({out.width}x{out.height})")
    except Exception as e:
        print(f"  [WARN] cutout failed ({e}); thumbnail will use the full hero image.")

print("DONE")
