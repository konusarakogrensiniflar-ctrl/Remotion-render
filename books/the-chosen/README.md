# The Chosen — Chaim Potok  ·  _fiction_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.
> Meta durumu: **claude-hand-refined** ✓

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/the-chosen.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-the-chosen.png`](../../out/thumbnail-the-chosen.png) | YouTube kapak |
| 📝 YouTube pack | [`books/the-chosen/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/the-chosen.clean.vtt`](../../public/captions/the-chosen.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/the-chosen.vtt`](../../public/captions/the-chosen.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/the-chosen.m4a`](../../public/audio/the-chosen.m4a) | NotebookLM sesi |
| 🖼️ Scene images | [`public/scenes/the-chosen/`](../../public/scenes/the-chosen) | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/the-chosen/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/the-chosen/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | [`books/the-chosen/config.vox.json`](config.vox.json) | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/the-chosen/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-the-chosen_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/the-chosen.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-the-chosen.png`
4. CC → `the-chosen.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=the-chosen --title="The Chosen" --author="Chaim Potok" --genre=fiction
```
