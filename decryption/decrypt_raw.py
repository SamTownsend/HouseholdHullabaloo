"""
Family Feud II - Raw Decryptor
==============================
Decrypts the encrypted blob of each record in questions.bin but makes no
other changes to the data.  Output is one line per record:

    <unencrypted prefix fields>,<decrypted blob>

The prefix fields (COUNT, |ROUND, QUESTION_ID) are left exactly as stored.
The decrypted blob is appended exactly as returned by the LCG cipher, with
no parsing, modifier stripping, or reformatting of any kind.

Usage:
    python decrypt_raw.py [questions.bin] [questions.idx] [output.txt]

Defaults:
    questions.bin   questions.idx   questions_raw_decrypted.txt
"""

import struct
import sys

bin_path = sys.argv[1] if len(sys.argv) > 1 else 'questions.bin'
idx_path = sys.argv[2] if len(sys.argv) > 2 else 'questions.idx'
out_path = sys.argv[3] if len(sys.argv) > 3 else 'questions_raw_decrypted.txt'

print(f'Input:  {bin_path}  +  {idx_path}')
print(f'Output: {out_path}')

with open(bin_path, 'rb') as f:
    qbin = f.read()
with open(idx_path, 'rb') as f:
    qidx = f.read()

offsets     = [struct.unpack_from('<I', qidx, i * 4)[0] for i in range(len(qidx) // 4)]
num_records = len(offsets) - 1
print(f'Records: {num_records}')

# ---------------------------------------------------------------------------
# Pre-build per-multiplier keystreams up to MAX_LEN bytes.
#
# Strategy: for a given key, the LCG state only advances for printable bytes
# (0x20-0x7F).  Since we only XOR the low 5 bits, and the blob is at most
# ~300 bytes of printable ASCII, we pre-compute the keystream for each
# multiplier once and cache it.  At decode time we apply it in one pass.
#
# For blobs longer than the cached keystream we extend on the fly (rare).
# ---------------------------------------------------------------------------
LCG_MULT  = 0x6C078965
LCG_ADD   = 0x269EC3
MASK32    = 0xFFFFFFFF

# Maximum number of printable bytes we expect in any single blob.
# Measured across all 2,195 records: the longest blob has 686 printable bytes.
# 750 gives a safe margin above that.
MAX_PRINTABLE = 750

# Observed max key multiplier in the game data is ~60; 120 gives ample margin.
MAX_MULT = 120

print(f'Pre-computing keystreams for multipliers 1..{MAX_MULT}...', flush=True)

# keystreams[mult] = list of (state & 0x1F) for positions 0..MAX_PRINTABLE-1
keystreams = {}
for mult in range(1, MAX_MULT + 1):
    state = (mult * 0xFEED) & MASK32
    ks = []
    for _ in range(MAX_PRINTABLE):
        state = (state * LCG_MULT + LCG_ADD) & MASK32
        ks.append(state & 0x1F)
    keystreams[mult] = ks

print('Done.', flush=True)

# ---------------------------------------------------------------------------
# Decrypt blob using pre-computed keystream for `mult`.
# ---------------------------------------------------------------------------
def lcg_decrypt_fast(raw_bytes: bytes, mult: int) -> bytes:
    ks     = keystreams[mult]
    result = bytearray()
    ki     = 0
    for b in raw_bytes:
        if b == 0x0D or b == 0x0A:
            result.append(b)
            continue
        if 0x20 <= b <= 0x7F:
            xor = ks[ki] if ki < len(ks) else 0
            result.append(b ^ xor)
            ki += 1
        else:
            result.append(b)
    return bytes(result)

# ---------------------------------------------------------------------------
# Readability scorer
# ---------------------------------------------------------------------------
def score(dec: bytes) -> float:
    letters = sum(1 for b in dec if 0x41 <= b <= 0x5A or 0x61 <= b <= 0x7A)
    spaces  = sum(1 for b in dec if b == 0x20)
    common  = sum(1 for b in dec if b in b"!'|,.-?~=")
    noise   = sum(1 for b in dec if 0x5B <= b <= 0x5F or b == 0x40)
    return letters * 4 + spaces * 6 + common - noise * 8

# ---------------------------------------------------------------------------
# Brute-force the best multiplier for one blob.
# ---------------------------------------------------------------------------
def find_best_decryption(blob: bytes):
    best_score = -1e9
    best_mult  = 1
    best_dec   = blob
    for mult in range(1, MAX_MULT + 1):
        dec = lcg_decrypt_fast(blob, mult)
        s   = score(dec)
        if s > best_score:
            best_score = s
            best_mult  = mult
            best_dec   = dec
    return best_mult, best_dec

# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------
lines = []

for n in range(num_records):
    if n % 200 == 0:
        print(f'  Processing record {n}/{num_records}...', flush=True)

    rec = qbin[offsets[n]:offsets[n + 1]].rstrip(b'\r\n')

    # Locate the 3rd comma — everything up to and including it is the
    # unencrypted prefix; everything after is the encrypted blob.
    pos = 0
    for _ in range(3):
        pos = rec.index(b',', pos) + 1

    prefix_bytes = rec[:pos]   # includes the trailing comma
    blob         = rec[pos:]

    _mult, dec = find_best_decryption(blob)

    # Reassemble: raw prefix + decrypted blob, decoded as latin-1
    full_line = (prefix_bytes + dec).decode('latin-1')
    lines.append(full_line)

with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
    f.write('\n')

print(f'Wrote {out_path}')
