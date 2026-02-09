import { eastAsianWidth } from "get-east-asian-width";
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
export function getSegmenter() { return segmenter; }
function couldBeEmoji(segment) {
    const cp = segment.codePointAt(0);
    return ((cp >= 0x1f000 && cp <= 0x1fbff) || (cp >= 0x2300 && cp <= 0x23ff) || (cp >= 0x2600 && cp <= 0x27bf) || (cp >= 0x2b50 && cp <= 0x2b55) || segment.includes("\uFE0F") || segment.length > 2);
}
const zeroWidthRegex = /^(?:\p{Default_Ignorable_Code_Point}|\p{Control}|\p{Mark}|\p{Surrogate})+$/u;
const leadingNonPrintingRegex = /^[\p{Default_Ignorable_Code_Point}\p{Control}\p{Format}\p{Mark}\p{Surrogate}]+/u;
const rgiEmojiRegex = /^\p{RGI_Emoji}$/u;
const WIDTH_CACHE_SIZE = 512;
const widthCache = new Map();
function graphemeWidth(segment) {
    if (zeroWidthRegex.test(segment)) return 0;
    if (couldBeEmoji(segment) && rgiEmojiRegex.test(segment)) return 2;
    const base = segment.replace(leadingNonPrintingRegex, "");
    const cp = base.codePointAt(0);
    if (cp === undefined) return 0;
    let width = eastAsianWidth(cp);
    if (segment.length > 1) {
        for (const char of segment.slice(1)) {
            const c = char.codePointAt(0);
            if (c >= 0xff00 && c <= 0xffef) width += eastAsianWidth(c);
        }
    }
    return width;
}
export function visibleWidth(str) {
    if (str.length === 0) return 0;
    let isPureAscii = true;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code < 0x20 || code > 0x7e) { isPureAscii = false; break; }
    }
    if (isPureAscii) return str.length;
    const cached = widthCache.get(str);
    if (cached !== undefined) return cached;
    let clean = str;
    if (str.includes("\t")) clean = clean.replace(/\t/g, "   ");
    if (clean.includes("\x1b")) {
        clean = clean.replace(/\x1b\[[0-9;]*[mGKHJ]/g, "");
        clean = clean.replace(/\x1b\]8;;[^\x07]*\x07/g, "");
        clean = clean.replace(/\x1b_[^\x07\x1b]*(?:\x07|\x1b\\)/g, "");
    }
    let width = 0;
    for (const { segment } of segmenter.segment(clean)) { width += graphemeWidth(segment); }
    if (widthCache.size >= WIDTH_CACHE_SIZE) {
        const firstKey = widthCache.keys().next().value;
        if (firstKey !== undefined) widthCache.delete(firstKey);
    }
    widthCache.set(str, width);
    return width;
}
export function extractAnsiCode(str, pos) {
    if (pos >= str.length || str[pos] !== "\x1b") return null;
    const next = str[pos + 1];
    if (next === "[") {
        let j = pos + 2;
        while (j < str.length && !/[mGKHJ]/.test(str[j])) j++;
        if (j < str.length) return { code: str.substring(pos, j + 1), length: j + 1 - pos };
        return null;
    }
    if (next === "]") {
        let j = pos + 2;
        while (j < str.length) {
            if (str[j] === "\x07") return { code: str.substring(pos, j + 1), length: j + 1 - pos };
            if (str[j] === "\x1b" && str[j + 1] === "\\") return { code: str.substring(pos, j + 2), length: j + 2 - pos };
            j++;
        }
        return null;
    }
    if (next === "_") {
        let j = pos + 2;
        while (j < str.length) {
            if (str[j] === "\x07") return { code: str.substring(pos, j + 1), length: j + 1 - pos };
            if (str[j] === "\x1b" && str[j + 1] === "\\") return { code: str.substring(pos, j + 2), length: j + 2 - pos };
            j++;
        }
        return null;
    }
    return null;
}
class AnsiCodeTracker {
    bold = false; dim = false; italic = false; underline = false; blink = false; inverse = false; hidden = false; strikethrough = false;
    fgColor = null; bgColor = null;
    process(ansiCode) {
        if (!ansiCode.endsWith("m")) return;
        const match = ansiCode.match(/\x1b\[([\d;]*)m/);
        if (!match) return;
        const params = match[1];
        if (params === "" || params === "0") { this.reset(); return; }
        const parts = params.split(";");
        let i = 0;
        while (i < parts.length) {
            const code = Number.parseInt(parts[i], 10);
            if (code === 38 || code === 48) {
                if (parts[i + 1] === "5" && parts[i + 2] !== undefined) {
                    const colorCode = `${parts[i]};${parts[i + 1]};${parts[i + 2]}`;
                    if (code === 38) this.fgColor = colorCode; else this.bgColor = colorCode;
                    i += 3; continue;
                } else if (parts[i + 1] === "2" && parts[i + 4] !== undefined) {
                    const colorCode = `${parts[i]};${parts[i + 1]};${parts[i + 2]};${parts[i + 3]};${parts[i + 4]}`;
                    if (code === 38) this.fgColor = colorCode; else this.bgColor = colorCode;
                    i += 5; continue;
                }
            }
            switch (code) {
                case 0: this.reset(); break;
                case 1: this.bold = true; break;
                case 2: this.dim = true; break;
                case 3: this.italic = true; break;
                case 4: this.underline = true; break;
                case 22: this.bold = false; this.dim = false; break;
                case 23: this.italic = false; break;
                case 24: this.underline = false; break;
                case 39: this.fgColor = null; break;
                case 49: this.bgColor = null; break;
                default:
                    if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) this.fgColor = String(code);
                    else if ((code >= 40 && code <= 47) || (code >= 100 && code <= 107)) this.bgColor = String(code);
                    break;
            }
            i++;
        }
    }
    reset() { this.bold = false; this.dim = false; this.italic = false; this.underline = false; this.blink = false; this.inverse = false; this.hidden = false; this.strikethrough = false; this.fgColor = null; this.bgColor = null; }
    clear() { this.reset(); }
    getActiveCodes() {
        const codes = [];
        if (this.bold) codes.push("1"); if (this.dim) codes.push("2"); if (this.italic) codes.push("3"); if (this.underline) codes.push("4");
        if (this.fgColor) codes.push(this.fgColor); if (this.bgColor) codes.push(this.bgColor);
        return codes.length === 0 ? "" : `\x1b[${codes.join(";")}m`;
    }
    getLineEndReset() { return this.underline ? "\x1b[24m" : ""; }
}
