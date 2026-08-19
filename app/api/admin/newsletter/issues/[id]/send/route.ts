import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/adminAuth';
import { sendIssueBatch } from '@/lib/delivery';

/**
 * 一斉配信の実行。
 *
 * 1回で最大 BATCH_LIMIT 件まで。残りは戻り値の remaining に入るので、
 * 0 になるまで画面から呼び直す。すでに届いている相手は毎回除外されるため、
 * 呼び直しても二重配信にはならない。
 */

// 送信サービスへの往復が名簿の数だけ発生する。既定の10秒では足りない。
export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  try {
    const summary = await sendIssueBatch(id);
    // error があっても1通も送っていないだけで、処理としては成功している。
    // 画面がそのまま文言として出せるよう 200 で返す。
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[Newsletter] send failed:', error);
    return NextResponse.json(
      {
        error: `配信に失敗しました: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      },
      { status: 500 }
    );
  }
}
