'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  autoGrow,
  editorTextToRaw,
  insertBlockAt,
  MD_IMAGE_RE,
  parseBodySegments,
  projectTextForEditor,
  removeSegFromBody,
  spliceSeg,
  type BodySeg,
} from '@/components/admin/bodyBlocks';
import MediaPicker from '@/components/admin/MediaPicker';
import styles from '@/app/admin/admin.module.css';
import nl from '@/app/admin/newsletter/newsletter.module.css';

export interface EditorIssue {
  id: string;
  subject: string;
  preheader: string;
  bodyMd: string;
  status: 'draft' | 'sending' | 'sent';
}

/**
 * 記事投稿エディタと同じ書き味にする。
 *
 * 入力欄とプレビューを分けず、届くメールの見た目そのものの上に文字を置く。
 * 見出し・箇条書き・引用は打った瞬間に実物の体裁へ変わり、Markdown の記号は
 * 隠れる（保存されるのは記号つきの Markdown のまま）。
 *
 * ブロック分解と記号の投影は記事投稿と同じ bodyBlocks を使う。
 * 画像や商品カードは配信メールが対応していないので、こちらは文字だけを扱う。
 */

/**
 * 「/」で出す差し込みメニュー。記事投稿エディタと同じ操作。
 *
 * 並べるのは、打った瞬間に画面上でも実物の体裁になるものだけ。
 * 区切り線（---）はメールでは罫線になるが編集画面では文字のまま残り、
 * 「書いた見た目＝届く見た目」が崩れるので入れていない（手で書けば効く）。
 */
const SLASH_COMMANDS = [
  { label: '見出し',   icon: 'H2', insert: '## ' },
  { label: '小見出し', icon: 'H3', insert: '### ' },
  { label: '箇条書き', icon: 'UL', insert: '- ' },
  { label: '引用',     icon: '❝',  insert: '> ' },
  // 差し込む文字が決まらないものは action で分岐する（メディアを選んでから確定）
  { label: '画像',     icon: 'IMG', action: 'image' },
] as const;

type SlashCommand = (typeof SLASH_COMMANDS)[number];

interface SlashMenuState {
  /** どのブロックで開いているか */
  segIndex: number;
  /** 「/」に続けて打たれた絞り込み文字 */
  query: string;
  /** 本文全体での「/」の位置と、カーソルの位置 */
  start: number;
  end: number;
}

function filterCommands(query: string): readonly SlashCommand[] {
  if (!query) return SLASH_COMMANDS.slice();
  return SLASH_COMMANDS.filter(
    (c) => c.label.includes(query) || c.icon.toLowerCase().includes(query)
  );
}

export default function NewsletterEditor({
  issue,
  defaultTestTo,
  canSend,
}: {
  issue: EditorIssue;
  defaultTestTo: string;
  /** 配信画面への導線を出すか。名簿が無い（ファイル保存の）間は出さない */
  canSend: boolean;
}) {
  const router = useRouter();
  const editable = issue.status === 'draft';

  const [subject, setSubject] = useState(issue.subject);
  const [preheader, setPreheader] = useState(issue.preheader);
  const [body, setBody] = useState(issue.bodyMd);

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState('');

  const [testTo, setTestTo] = useState(defaultTestTo);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState('');

  // 本文はブロックごとに textarea を持つ。キャレットは本文全体での位置で扱う
  const bodySegs = useMemo(() => parseBodySegments(body, { mdImages: true }), [body]);
  const taRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const composingRef = useRef(false);
  // 差し替え後にカーソルを戻す位置（本文全体での位置）
  const pendingCaretRef = useRef<number | null>(null);

  // 画像。メディアから選ぶ / ファイルを落とす の2経路がある
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  /** 画像を差し込む本文上の位置。null なら末尾 */
  const imagePosRef = useRef<number | null>(null);
  /** 非同期処理から最新の本文を読むための同期用 */
  const bodyRef = useRef(body);
  bodyRef.current = body;

  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);

  function edit(setter: (v: string) => void) {
    return (value: string) => {
      setter(value);
      setDirty(true);
      setError('');
    };
  }

  /**
   * 本文を差し替え、カーソルを指定の位置へ戻す。
   * ブロックの切れ目は本文の文字列から導いているので、書き換えるとブロックの
   * 数が変わることがある。位置を本文全体で覚えておき、描画後に該当ブロックへ返す。
   */
  function updateBody(next: string, caret: number) {
    pendingCaretRef.current = caret;
    setBody(next);
    setDirty(true);
    setError('');
  }

  // 描画が済んでから、カーソルを持っていたブロックへ戻す
  useLayoutEffect(() => {
    const caret = pendingCaretRef.current;
    if (caret === null) return;
    pendingCaretRef.current = null;

    // 同じ位置に複数のブロックが並ぶことがある（書き出し用の空欄と実ブロックは
    // 境界を共有する）。実ブロックを優先し、同じなら後ろのものを選ぶ。
    // 先頭から最初に当たったものを採ると、直前のブロックへ戻ってしまう。
    let index = -1;
    bodySegs.forEach((seg, i) => {
      if (seg.kind !== 'text') return;
      if (caret < seg.start || caret > seg.end) return;
      const chosen = index >= 0 ? bodySegs[index] : null;
      if (!chosen || !seg.virtual || (chosen.kind === 'text' && chosen.virtual)) index = i;
    });

    const target = taRefs.current[index < 0 ? bodySegs.length - 1 : index];
    const seg = bodySegs[index < 0 ? bodySegs.length - 1 : index];
    if (!target || !seg) return;

    const { toDisplay } = projectTextForEditor(body.slice(seg.start, seg.end));
    const pos = toDisplay(caret - seg.start);
    target.focus();
    target.setSelectionRange(pos, pos);
  }, [body, bodySegs]);

  // 中身が変わったら高さを合わせる。スクロールバーを出さず、紙のように伸ばす。
  // 書式が変わったブロックは文字の大きさごと変わるので、測り直しから始める
  // （autoGrow は文字が減ったときしか縮めないため、放っておくと高いままになる）
  useEffect(() => {
    taRefs.current.forEach((el) => {
      if (!el) return;
      // 毎回測り直す。ブロックの書式が変わると1行の高さも変わるので、
      // autoGrow の「文字が減ったときだけ縮める」判定では追従できない
      delete el.dataset.grown;
      autoGrow(el);
    });
  }, [body, bodySegs]);

  /**
   * 「/」を打ったらメニューを開く。
   * 行頭か空白の直後の「/」だけを合図にする。URL の中の「/」で開かないため。
   */
  function detectSlash(segIndex: number, displayValue: string, displayCaret: number, caretInBody: number) {
    const match = /(?:^|\s)\/([^\s/]*)$/.exec(displayValue.slice(0, displayCaret));
    if (!match) {
      setSlashMenu(null);
      return;
    }
    setSlashMenu({
      segIndex,
      query: match[1].toLowerCase(),
      start: caretInBody - (match[1].length + 1),
      end: caretInBody,
    });
    setSlashIndex(0);
  }

  /** メニューから選ばれた書式を当てる。打った「/xxx」は消す */
  function applySlashCommand(cmd: SlashCommand) {
    if (!slashMenu) return;
    const { start, end } = slashMenu;
    setSlashMenu(null);

    const cleaned = body.slice(0, start) + body.slice(end);

    // 画像は差し込む文字が未定。「/画像」の字だけ消して、選び終えてから確定する
    if ('action' in cmd) {
      updateBody(cleaned, start);
      imagePosRef.current = start;
      setPickerOpen(true);
      return;
    }

    // いま居るブロックが空になるなら、そのブロック自体を書式に変える。
    // 空の段落を残したまま下に足すと、送信時によけいな余白になる
    const target = parseBodySegments(cleaned, { mdImages: true }).find(
      (s) => s.kind === 'text' && !s.virtual && start >= s.start && start <= s.end
    );
    if (target && cleaned.slice(target.start, target.end).trim() === '') {
      const next = cleaned.slice(0, target.start) + cmd.insert + cleaned.slice(target.end);
      updateBody(next, target.start + cmd.insert.length);
      return;
    }

    const inserted = insertBlockAt(cleaned, start, cmd.insert);
    updateBody(inserted.body, inserted.end);
  }

  // ===== 画像 =====

  /** いま編集中のブロックの直後。どこも触っていなければ本文の末尾 */
  function imageInsertPos(): number {
    if (imagePosRef.current !== null) return Math.min(imagePosRef.current, bodyRef.current.length);
    const idx = taRefs.current.findIndex((ta) => ta && ta === document.activeElement);
    const seg = idx >= 0 ? bodySegs[idx] : null;
    return seg ? seg.end : bodyRef.current.length;
  }

  /** Markdown の画像記法で1ブロック差し込む。メール側はこの記法をそのまま描画する */
  function insertImage(url: string, alt = '') {
    const pos = imageInsertPos();
    imagePosRef.current = null;
    const inserted = insertBlockAt(bodyRef.current, pos, `![${alt}](${url})`);
    updateBody(inserted.body, inserted.blockEnd);
  }

  async function uploadAndInsert(file: File) {
    if (!editable) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file, file.name);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'アップロードに失敗しました');
      insertImage(data.url);
    } catch (err) {
      imagePosRef.current = null;
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(seg: BodySeg) {
    const next = removeSegFromBody(bodyRef.current, seg);
    updateBody(next, Math.min(seg.start, next.length));
  }

  /** ブロックの編集。表示上の文字を Markdown 記号つきに戻してから本文へ差し込む */
  function handleBlockChange(seg: BodySeg, segIndex: number, e: React.ChangeEvent<HTMLTextAreaElement>) {
    const textarea = e.currentTarget;
    const displayValue = textarea.value;
    const displayCaret = textarea.selectionStart;

    const { format } = projectTextForEditor(
      seg.kind === 'text' && !seg.virtual ? body.slice(seg.start, seg.end) : ''
    );

    // 見出しの途中で改行したら、そこで見出しを終えて次を素の段落にする。
    // 見出しは1行のものなので、改行を抱えたままにしない。
    // （日本語入力の確定 Enter は keydown を拾えないことがあるため、
    //   キー操作ではなく「改行が入った」という結果の側で捌く）
    if ((format === 'h2' || format === 'h3') && displayValue.includes('\n')) {
      const breakAt = displayValue.indexOf('\n');
      const head = editorTextToRaw(displayValue.slice(0, breakAt), format);
      const rest = displayValue.slice(breakAt + 1);
      const next = `${head}\n\n${rest}`;

      const spliced = spliceSeg(body, seg, next);
      updateBody(spliced.body, spliced.caret - rest.length + (displayCaret - breakAt - 1));
      return;
    }

    // 中身を消し切ったら記号ごと畳んで素の段落に戻す。
    // 記号だけが残ると、空に見えるのに書式が付いたままになる
    const raw = displayValue === '' ? '' : editorTextToRaw(displayValue, format);
    const rawCaret =
      displayValue === ''
        ? 0
        : editorTextToRaw(displayValue.slice(0, displayCaret), format).length;

    const spliced = spliceSeg(body, seg, raw);
    const caretInBody = spliced.caret - (raw.length - rawCaret);
    updateBody(spliced.body, caretInBody);
    autoGrow(textarea);

    // 書式つきのブロックでは出さない。見出しの中で差し込む先が無いため
    if (format === 'plain') detectSlash(segIndex, displayValue, displayCaret, caretInBody);
    else setSlashMenu(null);
  }

  /**
   * Enter の扱い。
   *
   * 素の段落は既定のまま（改行はそのまま入り、空行2つで段落が分かれる）。
   * 書式つきのブロックだけ、記事投稿エディタと同じように自分で捌く。
   *   見出し … そこで見出しを終えて、次を素の段落にする
   *   箇条書き・引用 … 次の項目／行を作る。空のまま押したらブロックを抜ける
   * 変換確定の Enter（日本語入力中）はここでは何もしない。
   */
  function handleBlockKeyDown(seg: BodySeg, segIndex: number, e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // メニューが開いている間は、キーはメニューのものとして扱う
    if (slashMenu && slashMenu.segIndex === segIndex && !e.nativeEvent.isComposing) {
      const filtered = filterCommands(slashMenu.query);

      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenu(null);
        return;
      }
      if (filtered.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSlashIndex((i) => (i + 1) % filtered.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSlashIndex((i) => (i - 1 + filtered.length) % filtered.length);
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          applySlashCommand(filtered[Math.min(slashIndex, filtered.length - 1)]);
          return;
        }
      }
    }

    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing || composingRef.current) return;
    if (seg.kind !== 'text' || seg.virtual) return;

    const raw = body.slice(seg.start, seg.end);
    const { format, toRaw } = projectTextForEditor(raw);
    if (format === 'plain') return;

    const displayCaret = e.currentTarget.selectionStart;
    const at = toRaw(displayCaret);
    e.preventDefault();

    const replace = (nextRaw: string, caretInRaw: number) =>
      updateBody(
        body.slice(0, seg.start) + nextRaw + body.slice(seg.end),
        seg.start + caretInRaw
      );

    if (format === 'h2' || format === 'h3') {
      // 見出しの続きは素の段落にする。途中で押されたら、その後ろを段落へ送る
      const next = `${raw.slice(0, at)}\n\n${raw.slice(at)}`;
      replace(next, at + 2);
      return;
    }

    const marker = format === 'list' ? '- ' : '> ';
    const currentLine = raw.slice(0, at).split('\n').pop() ?? '';

    // 空の項目で押したら、その項目を捨ててブロックを抜ける
    if (currentLine === marker || currentLine === marker.trimEnd()) {
      const head = raw.slice(0, at - currentLine.length).replace(/\n$/, '');
      const next = `${head}\n\n${raw.slice(at)}`;
      replace(next, head.length + 2);
      return;
    }

    const next = `${raw.slice(0, at)}\n${marker}${raw.slice(at)}`;
    replace(next, at + 1 + marker.length);
  }

  // ===== 保存 =====
  const save = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/newsletter/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, preheader, bodyMd: body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '保存に失敗しました。');
      setDirty(false);
      setSavedAt(new Date());
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました。');
      return false;
    } finally {
      setSaving(false);
    }
  }, [issue.id, subject, preheader, body, router]);

  // ⌘S / Ctrl+S で保存
  useEffect(() => {
    if (!editable) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (!saving) save();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editable, saving, save]);

  // 未保存のまま離脱しようとしたら確認する
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // ===== テスト送信 =====
  async function sendTest() {
    setTesting(true);
    setTestMsg('');
    try {
      // 保存前の内容で送っても意味がないので、先に保存する
      if (dirty) await save();

      const res = await fetch(`/api/admin/newsletter/issues/${issue.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testTo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '送信に失敗しました。');

      setTestMsg(
        data.provider === 'outbox'
          ? '.mail-outbox/ に書き出しました（送信サービス未設定のため）'
          : `${testTo} に送信しました`
      );
    } catch (e) {
      setTestMsg(e instanceof Error ? e.message : '送信に失敗しました。');
    } finally {
      setTesting(false);
    }
  }

  // ===== 配信画面へ =====
  // 画面内の遷移では離脱警告が出ないので、未保存のまま配信画面に行かせない。
  // 保存し損ねると、配信ページが古い原稿を見せたまま送ってしまう。
  async function goToSend() {
    if (dirty && !(await save())) return;
    router.push(`/admin/newsletter/${issue.id}/send`);
  }

  // ===== 削除 =====
  async function remove() {
    if (!window.confirm('この号を削除します。元に戻せません。')) return;
    const res = await fetch(`/api/admin/newsletter/issues/${issue.id}`, { method: 'DELETE' });
    if (res.ok) {
      setDirty(false);
      router.push('/admin/newsletter');
    } else {
      const data = await res.json();
      setError(data.error || '削除に失敗しました。');
    }
  }

  return (
    // 画面の横幅をメールの幅にそろえる。見出しや操作列だけが外へはみ出すと、
    // 「どこまでが届く範囲か」が読めなくなる
    <div className={nl.editorPage}>
      <div className={styles.pageTitleRow}>
        <h1 className={styles.pageTitle}>
          {editable ? '号の編集' : '配信済みの号'}
        </h1>
        <div className={styles.headerRight}>
          <span
            className={`${nl.saveState} ${dirty ? nl.saveStateDirty : ''} ${error ? nl.saveStateError : ''}`}
          >
            {error
              ? error
              : saving
                ? '保存中…'
                : dirty
                  ? '未保存の変更あり'
                  : savedAt
                    ? `保存しました ${savedAt.toLocaleTimeString('ja-JP')}`
                    : ''}
          </span>
          {editable ? (
            <>
              <button type="button" onClick={remove} className={styles.ghostBtn}>削除</button>
              <button
                type="button"
                onClick={save}
                disabled={saving || !dirty}
                className={styles.primaryBtn}
              >
                <span className={styles.btnText}>保存</span>
              </button>
              {/* 配信は別画面。書く場所と、取り消せない操作の場所を分ける */}
              {canSend && (
                <button type="button" onClick={goToSend} disabled={saving} className={styles.ghostBtn}>
                  配信へ進む
                </button>
              )}
            </>
          ) : (
            canSend && (
              <Link href={`/admin/newsletter/${issue.id}/send`} className={styles.ghostBtn}>
                配信状況
              </Link>
            )
          )}
        </div>
      </div>

      {!editable && (
        <p className={nl.hint} style={{ marginBottom: 16 }}>
          この号はすでに配信されているため編集できません。
        </p>
      )}

      {/* 記事投稿と同じく、届く形そのものの上に書く。別枠のプレビューは持たない */}
      <div className={nl.editorStack}>
        <div className={nl.mailSurface}>
          <div className={nl.mailHead}>SHINE A LIGHT</div>

          <div className={nl.mailBodyArea}>
            <textarea
              value={subject}
              onChange={(e) => {
                autoGrow(e.currentTarget);
                edit(setSubject)(e.currentTarget.value.replace(/[\r\n]+/g, ' '));
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) e.preventDefault(); }}
              ref={(el) => { if (el && el.value !== el.dataset.grown) autoGrow(el); }}
              rows={1}
              disabled={!editable}
              className={nl.mailSubject}
              placeholder="件名を入力"
              aria-label="件名"
            />

            <div
              className={`${nl.mailBody} ${dragOver ? nl.mailBodyDrop : ''}`}
              onDragOver={(e) => {
                // ファイル以外（文字の選択など）は素通しする
                if (!editable || !e.dataTransfer.types.includes('Files')) return;
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                setDragOver(false);
              }}
              onDrop={(e) => {
                if (!editable) return;
                const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'));
                if (!file) return;
                e.preventDefault();
                setDragOver(false);
                void uploadAndInsert(file);
              }}
              onMouseDown={(e) => {
                // 余白を押したら末尾のブロックにカーソルを置く
                if (e.target !== e.currentTarget) return;
                e.preventDefault();
                for (let i = taRefs.current.length - 1; i >= 0; i--) {
                  const ta = taRefs.current[i];
                  if (ta) { ta.focus(); ta.selectionStart = ta.selectionEnd = ta.value.length; break; }
                }
              }}
            >
              {bodySegs.map((seg, i) => {
                // 画像は入力欄ではなく、届く形そのままの絵として置く
                if (seg.kind === 'media' && seg.mtype === 'mdimage') {
                  const m = MD_IMAGE_RE.exec(body.slice(seg.start, seg.end).trim());
                  return (
                    <div key={`img-${seg.start}`} className={nl.mailImageBlock}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m?.[2] ?? ''} alt={m?.[1] ?? ''} className={nl.mailImage} />
                      {editable && (
                        <button
                          type="button"
                          onClick={() => removeImage(seg)}
                          className={nl.mailImageRemove}
                          aria-label="画像を削除"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  );
                }

                const raw = seg.kind === 'text' && !seg.virtual ? body.slice(seg.start, seg.end) : '';
                const { format, value } = projectTextForEditor(raw);
                const Wrapper = ({ plain: 'div', h2: 'h2', h3: 'h3', quote: 'blockquote', list: 'ul' } as const)[format];

                const placeholder =
                  format === 'h2' ? '見出し'
                  : format === 'h3' ? '小見出し'
                  : format === 'quote' ? '引用'
                  : format === 'list' ? '項目を改行で並べる'
                  : bodySegs.length === 1
                    ? '本文を入力（## 見出し / ### 小見出し / - 箇条書き / > 引用 / --- 区切り線）'
                    : '';

                return (
                  <Wrapper key={`blk-${i}`} className={`${nl.mailBlock} ${nl[`mail_${format}`] ?? ''}`}>
                    <textarea
                      ref={(el) => {
                        taRefs.current[i] = el;
                        if (el && el.value !== el.dataset.grown) autoGrow(el);
                      }}
                      value={value}
                      rows={1}
                      disabled={!editable}
                      onChange={(e) => handleBlockChange(seg, i, e)}
                      onKeyDown={(e) => handleBlockKeyDown(seg, i, e)}
                      onBlur={() => {
                        // 押した先がメニューなら閉じない（onMouseDown が先に走る）
                        setTimeout(() => setSlashMenu((prev) => (prev?.segIndex === i ? null : prev)), 150);
                      }}
                      onCompositionStart={() => { composingRef.current = true; }}
                      onCompositionEnd={() => { composingRef.current = false; }}
                      className={nl.mailBlockArea}
                      placeholder={placeholder}
                    />
                    {format !== 'plain' && (
                      <span className={nl.mailFormatTag}>
                        {format === 'list' ? 'UL' : format === 'quote' ? '❝' : format.toUpperCase()}
                      </span>
                    )}
                    {slashMenu?.segIndex === i && (() => {
                      const filtered = filterCommands(slashMenu.query);
                      if (filtered.length === 0) return null;
                      return (
                        <div className={nl.slashMenu}>
                          {filtered.map((cmd, idx) => (
                            <div
                              key={cmd.icon}
                              onMouseDown={(ev) => { ev.preventDefault(); applySlashCommand(cmd); }}
                              onMouseEnter={() => setSlashIndex(idx)}
                              className={`${nl.slashItem} ${idx === Math.min(slashIndex, filtered.length - 1) ? nl.slashItemActive : ''}`}
                            >
                              <span className={nl.slashIcon}>{cmd.icon}</span>
                              <span>{cmd.label}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </Wrapper>
                );
              })}
            </div>
          </div>

          <div className={nl.mailFoot}>
            <input
              type="text"
              value={preheader}
              onChange={(e) => edit(setPreheader)(e.target.value)}
              disabled={!editable}
              className={nl.mailPreheader}
              placeholder="プレヒーダー（受信箱で件名の隣に出る一文。空なら本文の先頭）"
              aria-label="プレヒーダー"
            />
            <p className={nl.mailFootNote}>
              差出人の名称・住所と「配信を解除する」は、送信時に自動で付きます。
            </p>
          </div>
        </div>

        <div className={nl.field}>
          <label htmlFor="nl-testto" className={nl.label}>テスト送信</label>
          <div className={styles.filters} style={{ marginBottom: 0 }}>
            <input
              id="nl-testto"
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              className={styles.searchInput}
              placeholder="your@email.com"
            />
            <button
              type="button"
              onClick={sendTest}
              disabled={testing || !testTo}
              className={styles.ghostBtn}
            >
              {testing ? '送信中…' : '自分に送る'}
            </button>
          </div>
          {testMsg && <p className={nl.hint}>{testMsg}</p>}
          <p className={nl.hint}>
            {canSend
              ? '一斉配信は取り消せません。必ず一度受信して確かめてください。'
              : '一斉配信はまだ繋いでいません。いまは書くことと、自分宛ての1通で見え方を確かめるところまでです。'}
          </p>
        </div>
      </div>

      {uploading && <p className={nl.uploadingNote}>画像をアップロード中…</p>}

      {pickerOpen && (
        <MediaPicker
          title="画像を選ぶ"
          onSelect={(item) => {
            setPickerOpen(false);
            insertImage(item.source_url, item.alt_text || '');
          }}
          onClose={() => {
            imagePosRef.current = null;
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
