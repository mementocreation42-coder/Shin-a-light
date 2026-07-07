// JPEGのEXIFから撮影日(DateTimeOriginal / DateTime)を読み取る最小パーサ。
// 返り値は 'YYYY-MM-DDTHH:MM:SS' 形式（撮影日が無ければ null）。

function readAscii(view: DataView, offset: number, maxLen: number): string {
    let s = '';
    for (let i = 0; i < maxLen; i++) {
        const c = view.getUint8(offset + i);
        if (c === 0) break;
        s += String.fromCharCode(c);
    }
    return s;
}

function toIso(exifDate: string): string | null {
    // "YYYY:MM:DD HH:MM:SS"
    const m = exifDate.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (!m) return null;
    const [, y, mo, d, h, mi, s] = m;
    // 妥当性チェック
    if (Number(mo) < 1 || Number(mo) > 12 || Number(d) < 1 || Number(d) > 31) return null;
    return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

function parseExif(view: DataView, tiff: number): string | null {
    const little = view.getUint16(tiff) === 0x4949; // 'II'
    const get16 = (o: number) => view.getUint16(o, little);
    const get32 = (o: number) => view.getUint32(o, little);

    if (get16(tiff + 2) !== 0x002a) return null;
    const ifd0 = tiff + get32(tiff + 4);
    if (ifd0 + 2 > view.byteLength) return null;

    const readTagAscii = (ifdOffset: number, targetTag: number): string | null => {
        const count = get16(ifdOffset);
        for (let i = 0; i < count; i++) {
            const entry = ifdOffset + 2 + i * 12;
            if (entry + 12 > view.byteLength) break;
            if (get16(entry) === targetTag) {
                const valOffset = tiff + get32(entry + 8);
                if (valOffset + 19 > view.byteLength) return null;
                return readAscii(view, valOffset, 20);
            }
        }
        return null;
    };

    // IFD0 から EXIFサブIFD(0x8769) と DateTime(0x0132) を探す
    const count = get16(ifd0);
    let exifIFD = 0;
    let dateTime: string | null = null;
    for (let i = 0; i < count; i++) {
        const entry = ifd0 + 2 + i * 12;
        if (entry + 12 > view.byteLength) break;
        const tag = get16(entry);
        if (tag === 0x8769) exifIFD = tiff + get32(entry + 8);
        else if (tag === 0x0132) {
            const valOffset = tiff + get32(entry + 8);
            if (valOffset + 19 <= view.byteLength) dateTime = readAscii(view, valOffset, 20);
        }
    }

    // DateTimeOriginal(0x9003) 優先、無ければ DateTime
    let raw: string | null = null;
    if (exifIFD && exifIFD + 2 <= view.byteLength) raw = readTagAscii(exifIFD, 0x9003);
    if (!raw) raw = dateTime;
    return raw ? toIso(raw) : null;
}

export async function readExifDate(file: File): Promise<string | null> {
    try {
        if (!/jpe?g/i.test(file.type) && !/\.jpe?g$/i.test(file.name)) return null;
        // EXIFは先頭付近にあるので冒頭のみ読む
        const buf = await file.slice(0, 256 * 1024).arrayBuffer();
        const view = new DataView(buf);
        if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null; // JPEG SOI

        let offset = 2;
        while (offset + 4 < view.byteLength) {
            const marker = view.getUint16(offset);
            if ((marker & 0xff00) !== 0xff00) break;
            if (marker === 0xffe1) {
                const segStart = offset + 4;
                // "Exif\0\0"
                if (
                    segStart + 6 <= view.byteLength &&
                    view.getUint32(segStart) === 0x45786966 &&
                    view.getUint16(segStart + 4) === 0x0000
                ) {
                    return parseExif(view, segStart + 6);
                }
            }
            const size = view.getUint16(offset + 2);
            if (size < 2) break;
            offset += 2 + size;
        }
        return null;
    } catch {
        return null;
    }
}
