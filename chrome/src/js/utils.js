export function cleanText(str) {
    return str.replace(/\s\s+/g, " ").replace("↵", " ").toLowerCase();
}

export function isValidStr(str, minLength) {
    return str && /[a-zA-Z]/.test(str) && str.replace(/\s\s+/g, " ").length >= minLength
}

export function chunkString(str, len) {
    const size = Math.ceil(str.length / len)
    const r = Array(size)
    let offset = 0

    for (let i = 0; i < size; i++) {
        r[i] = str.substr(offset, len)
        offset += len
    }

    return r
}