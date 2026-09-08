# Supercommunicators — Charles Duhigg  ·  _nonfiction_

> Bu kitabın **hub klasörü**. Kitaba dair her şey (config, meta, prompt, upload pack) burada; render çıktıları `public/` ve `out/` altında, aşağıda linkli.

## Dosyalar

| | Konum | Not |
|---|---|---|
| 🎬 Final video | `out/supercommunicators.mp4` _(yok)_ | render çıktısı |
| 🖼️ Thumbnail | [`out/thumbnail-supercommunicators.png`](../../out/thumbnail-supercommunicators.png) | YouTube kapak |
| 📝 YouTube pack | [`books/supercommunicators/youtube.md`](youtube.md) | başlık/açıklama/tag/bölümler |
| 💬 Captions (CC) | [`public/captions/supercommunicators.clean.vtt`](../../public/captions/supercommunicators.clean.vtt) | YouTube'a "With timing" yükle |
| 💬 Captions (ham) | [`public/captions/supercommunicators.vtt`](../../public/captions/supercommunicators.vtt) | kelime-zamanlı (karaoke kaynağı) |
| 🎙️ Audio | [`public/audio/supercommunicators.m4a`](../../public/audio/supercommunicators.m4a) | NotebookLM sesi |
| 🖼️ Scene images | `public/scenes/supercommunicators/` _(yok)_ | Flux görselleri |
| ✍️ NotebookLM prompt | [`books/supercommunicators/prompt.notebooklm.md`](prompt.notebooklm.md) | orijinal analiz açısı |
| 📖 Manifest | [`books/supercommunicators/book.json`](book.json) | book.json (slug/başlık/engine) |
| ⚙️ Vox config | `books/supercommunicators/config.vox.json` _(yok)_ | render config (beats/captions) |
| ⚙️ YouTube meta | [`books/supercommunicators/youtube-meta.json`](youtube-meta.json) | SEO/meta + thumbnail brief |
| 🎞️ Render chunks | `out_Vox-supercommunicators_chunks/` _(yok)_ | ara mp4 parçaları + parts.txt |

## Yükleme sırası
1. `out/supercommunicators.mp4` yükle
2. Başlık + açıklama (bölümler tıklanabilir olur) + tag → [youtube.md](youtube.md)
3. Thumbnail → `out/thumbnail-supercommunicators.png`
4. CC → `supercommunicators.clean.vtt` ("With timing")
5. **Altered content = Yes** (sentetik ses)

## Yeniden üretmek
```bash
node scripts/make-book.js --slug=supercommunicators --title="Supercommunicators" --author="Charles Duhigg" --genre=nonfiction
```
