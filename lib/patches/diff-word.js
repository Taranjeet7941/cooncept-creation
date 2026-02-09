import Diff from 'diff/libesm/diff/base.js';
import { longestCommonPrefix, longestCommonSuffix, replacePrefix, replaceSuffix, removePrefix, removeSuffix, maximumOverlap, leadingWs, trailingWs } from 'diff/libesm/util/string.js';

// Fixed: Corrected missing backslashes in regex string
const extendedWordChars = 'a-zA-Z0-9_\\u{AD}\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}';

const tokenizeIncludingWhitespace = new RegExp(`[${extendedWordChars}]+|\\s+|[^${extendedWordChars}]`, 'ug');

class WordDiff extends Diff {
    equals(left, right, options) {
        if (options.ignoreCase) {
            left = left.toLowerCase();
            right = right.toLowerCase();
        }
        return left.trim() === right.trim();
    }
    tokenize(value, options = {}) {
        let parts;
        if (options.intlSegmenter) {
            const segmenter = options.intlSegmenter;
            if (segmenter.resolvedOptions().granularity != 'word') {
                throw new Error('The segmenter passed must have a granularity of "word"');
            }
            parts = [];
            for (const segmentObj of Array.from(segmenter.segment(value))) {
                const segment = segmentObj.segment;
                if (parts.length && (/\s/).test(parts[parts.length - 1]) && (/\s/).test(segment)) {
                    parts[parts.length - 1] += segment;
                }
                else {
                    parts.push(segment);
                }
            }
        }
        else {
            parts = value.match(tokenizeIncludingWhitespace) || [];
        }
        const tokens = [];
        let prevPart = null;
        parts.forEach(part => {
            if ((/\s/).test(part)) {
                if (prevPart == null) {
                    tokens.push(part);
                }
                else {
                    const lastToken = tokens.pop();
                    tokens.push(lastToken + part);
                }
            }
            else if (prevPart != null && (/\s/).test(prevPart)) {
                if (tokens[tokens.length - 1] == prevPart) {
                    const lastToken = tokens.pop();
                    tokens.push(lastToken + part);
                }
                else {
                    tokens.push(prevPart + part);
                }
            }
            else {
                tokens.push(part);
            }
            prevPart = part;
        });
        return tokens;
    }
    join(tokens) {
        return tokens.map((token, i) => {
            if (i == 0) {
                return token;
            }
            else {
                return token.replace((/^\s+/), '');
            }
        }).join('');
    }
    postProcess(changes, options) {
        if (!changes || options.oneChangePerToken) {
            return changes;
        }
        let lastKeep = null;
        let insertion = null;
        let deletion = null;
        changes.forEach(change => {
            if (change.added) {
                insertion = change;
            }
            else if (change.removed) {
                deletion = change;
            }
            else {
                if (insertion || deletion) {
                    dedupeWhitespaceInChangeObjects(lastKeep, deletion, insertion, change);
                }
                lastKeep = change;
                insertion = null;
                deletion = null;
            }
        });
        if (insertion || deletion) {
            dedupeWhitespaceInChangeObjects(lastKeep, deletion, insertion, null);
        }
        return changes;
    }
}
export const wordDiff = new WordDiff();
export function diffWords(oldStr, newStr, options) {
    if ((options === null || options === void 0 ? void 0 : options.ignoreWhitespace) != null && !options.ignoreWhitespace) {
        return diffWordsWithSpace(oldStr, newStr, options);
    }
    return wordDiff.diff(oldStr, newStr, options);
}

function dedupeWhitespaceInChangeObjects(startKeep, deletion, insertion, endKeep) {
    if (deletion && insertion) {
        const oldWsPrefix = leadingWs(deletion.value);
        const oldWsSuffix = trailingWs(deletion.value);
        const newWsPrefix = leadingWs(insertion.value);
        const newWsSuffix = trailingWs(insertion.value);
        if (startKeep) {
            const commonWsPrefix = longestCommonPrefix(oldWsPrefix, newWsPrefix);
            startKeep.value = replaceSuffix(startKeep.value, newWsPrefix, commonWsPrefix);
            deletion.value = removePrefix(deletion.value, commonWsPrefix);
            insertion.value = removePrefix(insertion.value, commonWsPrefix);
        }
        if (endKeep) {
            const commonWsSuffix = longestCommonSuffix(oldWsSuffix, newWsSuffix);
            endKeep.value = replacePrefix(endKeep.value, newWsSuffix, commonWsSuffix);
            deletion.value = removeSuffix(deletion.value, commonWsSuffix);
            insertion.value = removeSuffix(insertion.value, commonWsSuffix);
        }
    }
    else if (insertion) {
        if (startKeep) {
            const ws = leadingWs(insertion.value);
            insertion.value = insertion.value.substring(ws.length);
        }
        if (endKeep) {
            const ws = leadingWs(endKeep.value);
            endKeep.value = endKeep.value.substring(ws.length);
        }
    }
    else if (startKeep && endKeep) {
        const newWsFull = leadingWs(endKeep.value), delWsStart = leadingWs(deletion.value), delWsEnd = trailingWs(deletion.value);
        const newWsStart = longestCommonPrefix(newWsFull, delWsStart);
        deletion.value = removePrefix(deletion.value, newWsStart);
        const newWsEnd = longestCommonSuffix(removePrefix(newWsFull, newWsStart), delWsEnd);
        deletion.value = removeSuffix(deletion.value, newWsEnd);
        endKeep.value = replacePrefix(endKeep.value, newWsFull, newWsEnd);
        startKeep.value = replaceSuffix(startKeep.value, newWsFull, newWsFull.slice(0, newWsFull.length - newWsEnd.length));
    }
    else if (endKeep) {
        const endKeepWsPrefix = leadingWs(endKeep.value);
        const deletionWsSuffix = trailingWs(deletion.value);
        const overlap = maximumOverlap(deletionWsSuffix, endKeepWsPrefix);
        deletion.value = removeSuffix(deletion.value, overlap);
    }
    else if (startKeep) {
        const startKeepWsSuffix = trailingWs(startKeep.value);
        const deletionWsPrefix = leadingWs(deletion.value);
        const overlap = maximumOverlap(startKeepWsSuffix, deletionWsPrefix);
        deletion.value = removePrefix(deletion.value, overlap);
    }
}
class WordsWithSpaceDiff extends Diff {
    tokenize(value) {
        const regex = new RegExp(`(\\r?\\n)|[${extendedWordChars}]+|[^\\S\\n\\r]+|[^${extendedWordChars}]`, 'ug');
        return value.match(regex) || [];
    }
}
export const wordsWithSpaceDiff = new WordsWithSpaceDiff();
export function diffWordsWithSpace(oldStr, newStr, options) {
    return wordsWithSpaceDiff.diff(oldStr, newStr, options);
}
