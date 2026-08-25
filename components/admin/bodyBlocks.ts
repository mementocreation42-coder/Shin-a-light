// ===== 本文ブロック分解 =====
// hl-fishing の FishingPostEditor から移植（SAL向けに image / product のみ対応）。
// body（1本の文字列）は変えず、表示だけをブロックへ切り分ける。各セグメントは
// body 上のオフセットを持つので、編集は該当範囲の差し替えだけで済む。
//
// 編集中の本文は Markdown 風の記法（## / ### / - / >）で保持し、
// 保存・読み込み時に SAL の [h2]…[/h2] 形式へ相互変換する（下部の変換関数）。


// テキストブロックは内容に合わせて高さを伸ばす（スクロールバーを出さない）
export function autoGrow(ta: HTMLTextAreaElement | null) {
  if (!ta) return;

  const previousValue = ta.dataset.grown;
  const needsShrink =
    previousValue === undefined || ta.value.length < previousValue.length;

  // 通常の追加入力では現在の高さのまま scrollHeight を測る。
  // 長い本文欄を一瞬でも縮めると、ブラウザーが直後の要素を
  // スクロールの基準点にして、イベント処理後に画面を飛ばすことがある。
  // 削除時だけ縮小計測し、入力で伸びるケースでは縮小を一切発生させない。
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  if (needsShrink) ta.style.height = 'auto';
  const nextHeight = `${ta.scrollHeight}px`;
  ta.style.height = nextHeight;
  ta.dataset.grown = ta.value;
  if (needsShrink && (window.scrollX !== scrollX || window.scrollY !== scrollY)) {
    window.scrollTo(scrollX, scrollY);
  }
}

// ===== 本文のブロック分解 =====
// body（1本の文字列）は変えずに、表示だけをブロックに切り分ける。
// 各セグメントは body 上のオフセットを持つので、編集は body の該当範囲を
// 差し替えるだけで済み、保存形式・WordPress側は一切変わらない。
export type BodySeg =
  | { kind: 'text'; start: number; end: number; virtual?: 'head' | 'mid' | 'tail' | 'insert' | 'between'; styled?: boolean }
  | { kind: 'media'; mtype: 'image' | 'product' | 'url' | 'mdimage'; idx: number; start: number; end: number };

export const BODY_TOKEN_RE = /^\[(image|product):(\d+)\]$/;

// 単独行のURLは公開記事でリンクカード／商品カードになるので、編集画面でも実物を出す
// （YouTubeは本文中の埋め込み扱いなのでテキストのまま）
export function isStandaloneUrl(t: string): boolean {
  return /^https?:\/\/\S+$/.test(t) && !/(?:youtube\.com|youtu\.be)/i.test(t);
}

// 見出し・リスト・引用は記事の見た目を当てるため独立したブロックにする
export function isStyledPart(text: string): boolean {
  const t = text.trimStart();
  return t.startsWith('## ') || t.startsWith('### ') || t.startsWith('- ') || t.startsWith('> ');
}

// body は1文字打つたびに何度も走査される（入力・キャレット同期・再描画）。
// 同じ文字列なら結果も同じなので、直前の1件だけ覚えておいて使い回す。
// 返す配列は呼び出し側で書き換えない前提（変える側は必ずコピーしてから触る）。
let segCacheBody: string | null = null;
let segCacheMdImages = false;
let segCacheSegs: BodySeg[] = [];

/** 単独行の Markdown 画像記法。ニュースレター本文でのみ画像ブロックとして扱う */
export const MD_IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

export interface ParseOptions {
  /**
   * `![alt](url)` だけの段落を画像ブロックとして切り出す。
   * 記事本文は [image:N] トークン方式なので、ニュースレターだけ true にする。
   */
  mdImages?: boolean;
}

export function parseBodySegments(body: string, opts?: ParseOptions): BodySeg[] {
  const mdImages = opts?.mdImages ?? false;
  if (segCacheBody !== body || segCacheMdImages !== mdImages) {
    segCacheSegs = computeBodySegments(body, mdImages);
    segCacheBody = body;
    segCacheMdImages = mdImages;
  }
  return segCacheSegs;
}

function computeBodySegments(body: string, mdImages = false): BodySeg[] {
  // 空行区切りで分割しつつ、各パートの body 上の位置を保持する
  // textEnd は3個以上ある改行のうち、ユーザーが追加した分だけを含む。
  // 末尾2個はメディアとの構造上の区切りとして textarea の外に残す。
  const parts: { text: string; start: number; end: number; textEnd: number }[] = [];
  const sepRe = /\n{2,}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = sepRe.exec(body)) !== null) {
    const separatorEnd = m.index + m[0].length;
    const partText = body.slice(last, m.index);
    // 見出し・リスト・引用・メディアの直後では、最初の2改行だけを
    // ブロック間の構造上の区切りとして消費する。3個目以降は次の本文側に
    // 残し、段落先頭で押したEnterが前の装飾ブロックへ吸収されないようにする。
    const isMediaPart = BODY_TOKEN_RE.test(partText.trim()) || isStandaloneUrl(partText.trim());
    const isStructuralTail = isStyledPart(partText) || isMediaPart;
    const structuralBreakLength =
      separatorEnd < body.length || isStructuralTail
        ? Math.min(2, m[0].length)
        : 0;
    parts.push({
      text: partText,
      start: last,
      end: m.index,
      textEnd: isStructuralTail
        ? m.index
        : separatorEnd - structuralBreakLength,
    });
    last = isStructuralTail
      ? m.index + structuralBreakLength
      : separatorEnd;
  }
  parts.push({ text: body.slice(last), start: last, end: body.length, textEnd: body.length });

  const segs: BodySeg[] = [];
  for (const p of parts) {
    let partText = p.text;
    let partStart = p.start;

    // 装飾ブロック・画像の直前に残した改行は、そのブロック自身へ含めず
    // 通常本文の空欄として扱う。これにより見出し末尾のEnterで作った段落へ
    // カーソルを置いたまま、次の見出しや画像の前へ文章を追加できる。
    const leadingBreaks = partText.match(/^\n+/)?.[0] ?? '';
    if (leadingBreaks) {
      const remainder = partText.slice(leadingBreaks.length);
      const remainderIsMedia = BODY_TOKEN_RE.test(remainder.trim()) || isStandaloneUrl(remainder.trim());
      const remainderIsStyled = isStyledPart(remainder);
      if (remainderIsMedia || remainderIsStyled) {
        segs.push({
          kind: 'text',
          start: partStart,
          end: partStart + leadingBreaks.length,
        });
        partStart += leadingBreaks.length;
        partText = remainder;
      }
    }

    if (mdImages && MD_IMAGE_RE.test(partText.trim())) {
      segs.push({ kind: 'media', mtype: 'mdimage', idx: -1, start: partStart, end: p.end });
      continue;
    }

    if (isStandaloneUrl(partText.trim())) {
      segs.push({ kind: 'media', mtype: 'url', idx: -1, start: partStart, end: p.end });
      continue;
    }

    const tm = partText.trim().match(BODY_TOKEN_RE);
    if (tm) {
      segs.push({
        kind: 'media',
        mtype: tm[1] as 'image' | 'product' ,
        idx: parseInt(tm[2], 10),
        start: partStart,
        end: p.end,
      });
    } else {
      // 区切り改行を消してしまった既存入力（例: "本文[image:0]"）も
      // トークンを認識して、画像と本文のブロックへ自動的に戻す。
      const inlineTokenRe = /\[(image|product):(\d+)\]/g;
      const inlineTokens = [...partText.matchAll(inlineTokenRe)];
      if (inlineTokens.length > 0) {
        let cursor = partStart;
        for (const token of inlineTokens) {
          const tokenStart = partStart + (token.index ?? 0);
          if (tokenStart > cursor) {
            segs.push({ kind: 'text', start: cursor, end: tokenStart });
          }
          const tokenEnd = tokenStart + token[0].length;
          segs.push({
            kind: 'media',
            mtype: token[1] as 'image' | 'product' ,
            idx: parseInt(token[2], 10),
            start: tokenStart,
            end: tokenEnd,
          });
          cursor = tokenEnd;
        }
        if (cursor < p.end) {
          segs.push({ kind: 'text', start: cursor, end: p.textEnd });
        }
        continue;
      }

      // 通常の段落どうしは1つの入力欄にまとめる。
      // こうしないと空行での改行が区切り記号に吸収され、改行できなくなる。
      // 見出し・リスト・引用だけは独立させ、記事の見た目を当てる。
      const styled = isStyledPart(partText);
      const prev = segs[segs.length - 1];
      if (!styled && prev && prev.kind === 'text' && !prev.styled) {
        prev.end = p.textEnd;
      } else {
        segs.push({ kind: 'text', start: partStart, end: p.textEnd, styled });
      }
    }
  }

  // 通常の段落は自由に文字を打てるので、そこが隣にある境界には空欄は要らない。
  // 逆に「見出し・リスト・引用・画像」だけが並ぶ境界は打ち込む場所が無くなるため、
  // 種類の組み合わせに関係なく入力欄を挟む（H2→H3、見出し→画像 なども対象）。
  const isFreeText = (seg: BodySeg | undefined) =>
    !!seg && seg.kind === 'text' && getTextBlockFormat(body.slice(seg.start, seg.end)) === 'plain';

  const withSlots: BodySeg[] = [];
  for (let i = 0; i < segs.length; i++) {
    const cur = segs[i];
    if (i === 0 && !isFreeText(cur)) {
      withSlots.push({ kind: 'text', start: 0, end: 0, virtual: 'head' });
    }
    withSlots.push(cur);

    const next = segs[i + 1];
    if (!isFreeText(cur) && !isFreeText(next)) {
      withSlots.push({
        kind: 'text',
        start: cur.end,
        end: cur.end,
        virtual: next ? 'mid' : 'tail',
      });
    }
  }
  return withSlots.length ? withSlots : [{ kind: 'text', start: 0, end: 0 }];
}

// 仮想スロットに文字が入ったときの、body への差し込み結果と新しいキャレット位置
export function spliceSeg(body: string, seg: BodySeg, value: string): { body: string; caret: number } {
  if (seg.kind !== 'text' || !seg.virtual) {
    return { body: body.slice(0, seg.start) + value + body.slice(seg.end), caret: seg.start + value.length };
  }
  if (seg.virtual === 'between') {
    return {
      body: body.slice(0, seg.start) + '\n\n' + value + '\n\n' + body.slice(seg.end),
      caret: seg.start + 2 + value.length,
    };
  }
  if (seg.virtual === 'head') return { body: value + '\n\n' + body, caret: value.length };
  if (seg.virtual === 'tail') return { body: body + '\n\n' + value, caret: body.length + 2 + value.length };
  return {
    body: body.slice(0, seg.start) + '\n\n' + value + body.slice(seg.start),
    caret: seg.start + 2 + value.length,
  };
}

// 記法に応じて、入力欄そのものを記事の見た目にする。
// contentEditableは日本語入力と相性が悪いためtextareaを維持し、記号だけ投影時に隠す。
export type TextBlockFormat = 'plain' | 'h2' | 'h3' | 'list' | 'quote';

export function getTextBlockFormat(raw: string): TextBlockFormat {
  const t = raw.trimStart();
  if (t.startsWith('### ')) return 'h3';
  if (t.startsWith('## ')) return 'h2';
  if (t.startsWith('- ')) return 'list';
  if (t.startsWith('> ')) return 'quote';
  return 'plain';
}

export interface TextProjection {
  format: TextBlockFormat;
  value: string;
  /** 表示上の位置 → 保存文字列（Markdown記号込み）の位置 */
  toRaw: (displayPos: number) => number;
  /** 保存文字列の位置 → 表示上の位置 */
  toDisplay: (rawPos: number) => number;
}

const clampPos = (v: number, max: number) => Math.max(0, Math.min(v, max));

// 保存用のMarkdown記号を編集画面では隠し、公開記事と同じ文字だけを表示する。
// 隠した記号の分だけ位置がずれるため、見た目のカーソルと保存文字列の位置を
// 相互に変換できるようにしておく。
export function projectTextForEditor(raw: string): TextProjection {
  const format = getTextBlockFormat(raw);

  // 記号を隠さない形式は表示と保存が1対1で対応する。リストの "- " も
  // 先頭1文字を "•" に置き換えるだけなので文字数はずれない。
  // 本文の大半はこちらなので、対応表を作らず素通しする。
  if (format === 'plain' || format === 'list') {
    const value = format === 'list' ? raw.replace(/(^|\n)- /g, '$1• ') : raw;
    return {
      format,
      value,
      toRaw: (d) => clampPos(d, raw.length),
      toDisplay: (r) => clampPos(r, value.length),
    };
  }

  // 行頭の記号を隠す（見出しは先頭の1つ、引用は各行）
  const hidden: { start: number; len: number }[] = [];
  if (format === 'quote') {
    for (let lineStart = 0; lineStart < raw.length;) {
      if (raw.startsWith('> ', lineStart)) hidden.push({ start: lineStart, len: 2 });
      const nextBreak = raw.indexOf('\n', lineStart);
      if (nextBreak < 0) break;
      lineStart = nextBreak + 1;
    }
  } else {
    const marker = format === 'h2' ? '## ' : '### ';
    const at = raw.indexOf(marker);
    if (at >= 0) hidden.push({ start: at, len: marker.length });
  }

  // 隠した各位置について「表示上どこに畳まれるか」と「そこまでの累計文字数」を持つ
  const marks: { start: number; len: number; display: number; cut: number }[] = [];
  let value = '';
  let cut = 0;
  let cursor = 0;
  for (const h of hidden) {
    value += raw.slice(cursor, h.start);
    marks.push({ start: h.start, len: h.len, display: h.start - cut, cut: cut + h.len });
    cut += h.len;
    cursor = h.start + h.len;
  }
  value += raw.slice(cursor);

  return {
    format,
    value,
    toRaw: (displayPos) => {
      const d = clampPos(displayPos, value.length);
      let cutTotal = 0;
      // 行頭の見えない記号より前へカーソルが入らないよう、記号の後端へ寄せる
      for (const m of marks) {
        if (m.display > d) break;
        cutTotal = m.cut;
      }
      return d + cutTotal;
    },
    toDisplay: (rawPos) => {
      const r = clampPos(rawPos, raw.length);
      let out = r;
      for (const m of marks) {
        if (m.start > r) break;
        out = r < m.start + m.len ? m.display : r - m.cut;
      }
      return out;
    },
  };
}

export function editorTextToRaw(value: string, format: TextBlockFormat): string {
  if (format === 'h2') return `## ${value}`;
  if (format === 'h3') return `### ${value}`;
  if (format === 'plain') return value;

  const trailingBreaks = value.match(/\n+$/)?.[0] ?? '';
  const core = value.slice(0, value.length - trailingBreaks.length);
  const lines = core === '' ? [''] : core.split('\n');

  if (format === 'list') {
    return lines.map((line) => {
      const text = line.startsWith('• ') || line.startsWith('- ') ? line.slice(2) : line;
      return `- ${text}`;
    }).join('\n') + trailingBreaks;
  }

  return lines.map((line) => `> ${line}`).join('\n') + trailingBreaks;
}

export function formattedTextToPlain(raw: string, format: TextBlockFormat): string {
  if (format === 'h2') return raw.replace(/^\s*##\s?/, '');
  if (format === 'h3') return raw.replace(/^\s*###\s?/, '');
  if (format === 'list') {
    return raw.split('\n').map((line) => line.replace(/^\s*-\s?/, '')).join('\n');
  }
  if (format === 'quote') {
    return raw.split('\n').map((line) => line.replace(/^\s*>\s?/, '')).join('\n');
  }
  return raw;
}

// 独立した1ブロックとして差し込むために、前後へ足りない空行を補う
function blockPad(before: string, after: string): { prefix: string; suffix: string } {
  return {
    prefix: before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '',
    suffix: after.length > 0 && !after.startsWith('\n\n') ? (after.startsWith('\n') ? '\n' : '\n\n') : '',
  };
}

// 指定位置に文字列を1ブロックとして差し込む（前後の空行を整える）。
// start/end は差し込んだ本文そのものの範囲、blockEnd は足した空行まで含めた末尾。
export function insertBlockAt(base: string, pos: number, text: string): {
  body: string; start: number; end: number; blockEnd: number;
} {
  const before = base.slice(0, pos);
  const after = base.slice(pos);
  const { prefix, suffix } = blockPad(before, after);
  const start = pos + prefix.length;
  const end = start + text.length;
  return { body: before + prefix + text + suffix + after, start, end, blockEnd: end + suffix.length };
}

// 本文中の [kind:N] を1つ取り除き、後続の番号を詰める
export function renumberTokens(body: string, kind: 'image' | 'product' , removed: number): string {
  return body.replace(new RegExp(`\\[${kind}:(\\d+)\\]`, 'g'), (m, n) => {
    const idx = parseInt(n, 10);
    if (idx === removed) return '';
    return idx > removed ? `[${kind}:${idx - 1}]` : m;
  });
}

// トークンを1つ取り除く（前後の空行が重ならないように整える）
export function removeSegFromBody(body: string, seg: BodySeg): string {
  return (body.slice(0, seg.start) + body.slice(seg.end))
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+|\n+$/g, '');
}

// 直前の描画から body が動いている場合に備え、いま解析し直したセグメントの中から
// 同じ範囲のものを探して使う（仮想スロットは body 上に実体が無いのでそのまま）
export function findLiveSeg(seg: BodySeg, body: string): { seg: BodySeg; index: number; all: BodySeg[] } {
  const all = parseBodySegments(body);
  if (seg.kind === 'text' && seg.virtual) return { seg, index: -1, all };
  const index = all.findIndex(
    (c) => c.kind === 'text' && c.start === seg.start && c.end === seg.end
  );
  return { seg: index >= 0 ? all[index] : seg, index, all };
}

// ===== SALの保存形式（[h2]…[/h2]）との相互変換 =====
// WordPressへ渡す形と、APIから戻ってくる形は従来どおり。編集中だけ Markdown 風に持つ。

/** [h2]…[/h2] などの保存形式 → 編集用の記法 */
export function bracketToEditor(body: string): string {
  return body
    .replace(/\[h2\]([\s\S]*?)\[\/h2\]/g, (_, t) => `## ${String(t).replace(/\s*\n+\s*/g, ' ').trim()}`)
    .replace(/\[h3\]([\s\S]*?)\[\/h3\]/g, (_, t) => `### ${String(t).replace(/\s*\n+\s*/g, ' ').trim()}`)
    .replace(/\[quote\]([\s\S]*?)\[\/quote\]/g, (_, t) =>
      String(t).trim().split('\n').map((l: string) => `> ${l.trim()}`).join('\n'))
    .replace(/\[ul\]\s*([\s\S]*?)\s*\[\/ul\]/g, (_, t) =>
      String(t).split('\n').map((l: string) => l.trim()).filter(Boolean).map((l: string) => `- ${l}`).join('\n'));
}

/** 編集用の記法 → [h2]…[/h2] などの保存形式 */
export function editorToBracket(body: string): string {
  const out: string[] = [];
  for (const para of body.split(/\n{2,}/)) {
    const t = para.trim();
    if (!t) continue;
    const lines = t.split('\n');
    if (t.startsWith('## ')) { out.push(`[h2]${t.slice(3).trim()}[/h2]`); continue; }
    if (t.startsWith('### ')) { out.push(`[h3]${t.slice(4).trim()}[/h3]`); continue; }
    if (lines.every((l) => l.startsWith('- '))) {
      out.push(`[ul]\n${lines.map((l) => l.slice(2).trim()).join('\n')}\n[/ul]`);
      continue;
    }
    if (lines.every((l) => l.startsWith('> '))) {
      out.push(`[quote]${lines.map((l) => l.slice(2).trim()).join('\n')}[/quote]`);
      continue;
    }
    out.push(t);
  }
  return out.join('\n\n');
}
