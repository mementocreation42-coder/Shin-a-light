#!/usr/bin/env python3
"""音声ファイルを文字起こしして JSON を標準出力に書く。

    python3 scripts/transcribe.py <audio> [--model mlx-community/whisper-large-v3-turbo]

Apple Silicon 向けの mlx-whisper を使う（手元で完結・無料）。
    python3 -m pip install mlx-whisper

出力: {"text": "...", "segments": [{"start": 秒, "end": 秒, "text": "..."}]}
"""
import argparse, json, sys

p = argparse.ArgumentParser()
p.add_argument("audio")
p.add_argument("--model", default="mlx-community/whisper-large-v3-turbo")
p.add_argument("--language", default="ja")
a = p.parse_args()

try:
    import mlx_whisper
except ImportError:
    sys.stderr.write("mlx-whisper が入っていません:  python3 -m pip install mlx-whisper\n")
    sys.exit(2)

r = mlx_whisper.transcribe(a.audio, path_or_hf_repo=a.model, language=a.language, verbose=False)
json.dump(
    {
        "text": r["text"].strip(),
        "segments": [{"start": s["start"], "end": s["end"], "text": s["text"].strip()} for s in r["segments"]],
    },
    sys.stdout, ensure_ascii=False,
)
