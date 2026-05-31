"""
Family Feud (Battle of the Sexes / later titles) - Raw Decryptor for .bine files
=================================================================================
Decrypts the encrypted blob of each record in a questions.bine file and writes
the raw decrypted output — one line per record:

    <unencrypted prefix fields>,<decrypted blob>

The prefix fields (field0, field1/round, question_id) are left exactly as stored.
The decrypted blob is appended exactly as returned by the LCG cipher, with no
parsing, modifier stripping, or reformatting of any kind.

Differences from the FF2 .bin/.idx format:
  - A single .bine file replaces the .bin + .idx pair.  Records are separated
    by CRLF (\r\n) within the file; no external index is needed.
  - The unencrypted prefix uses a different layout:
        254,|E|<ROUND>,<QUESTION_ID>,<encrypted blob>
    vs. FF2's:
        5,|<ROUND>,<QUESTION_ID>,<encrypted blob>
  - The LCG encryption algorithm, key formula, and brute-force key search are
    identical to FF2; only the record-splitting mechanism differs.

Usage:
    python decrypt_bine.py [questions.bine] [output.txt]

Defaults:
    questions.bine   questions_raw_decrypted.txt
"""

import sys

bine_path = sys.argv[1] if len(sys.argv) > 1 else 'questions.bine'
out_path  = sys.argv[2] if len(sys.argv) > 2 else 'questions_raw_decrypted.txt'

print(f'Input:  {bine_path}')
print(f'Output: {out_path}')

with open(bine_path, 'rb') as f:
    raw = f.read()

# Records are CRLF-terminated; filter out any empty trailing entries.
records = [r for r in raw.split(b'\r\n') if r]
num_records = len(records)
print(f'Records: {num_records}')

# ---------------------------------------------------------------------------
# LCG constants (identical to FFEngine.dll Crypt function)
# ---------------------------------------------------------------------------
LCG_MULT = 0x6C078965
LCG_ADD  = 0x269EC3
MASK32   = 0xFFFFFFFF

# Maximum number of printable bytes expected in any single blob.
# Measured across all known packs: the longest blob is 1324 printable bytes (pack 3).
# 1500 gives a safe margin above that.
MAX_PRINTABLE = 1500

# Observed max key multiplier across the game data is well under 100;
# 200 gives ample headroom.
MAX_MULT = 200

# ---------------------------------------------------------------------------
# Pre-build per-multiplier keystreams.
# For a given key, the LCG state advances only for printable bytes (0x20-0x7F).
# Pre-computing the keystream once per multiplier avoids redundant LCG steps
# when scoring all multipliers for each blob.
# ks_end_state stores the LCG state after each pre-computed segment so the
# keystream can be extended on the fly for unusually long blobs.
# ---------------------------------------------------------------------------
print(f'Pre-computing keystreams for multipliers 1..{MAX_MULT}...', flush=True)
keystreams = {}
ks_end_state = {}
for mult in range(1, MAX_MULT + 1):
    state = (mult * 0xFEED) & MASK32
    ks = []
    for _ in range(MAX_PRINTABLE):
        state = (state * LCG_MULT + LCG_ADD) & MASK32
        ks.append(state & 0x1F)
    keystreams[mult] = ks
    ks_end_state[mult] = state
print('Done.', flush=True)

# ---------------------------------------------------------------------------
# Decrypt blob using a pre-computed keystream.
# If the blob is longer than the pre-computed keystream, the keystream is
# extended on the fly from the stored LCG state rather than falling back to
# XOR-with-zero (which would leave the tail encrypted).
# ---------------------------------------------------------------------------
def lcg_decrypt_fast(raw_bytes: bytes, mult: int) -> bytes:
    ks         = keystreams[mult]
    ext_state  = ks_end_state[mult]  # LCG state after the pre-computed segment
    ext_ks     = []                  # lazily extended keystream entries
    result = bytearray()
    ki     = 0
    for b in raw_bytes:
        if b == 0x0D or b == 0x0A:
            result.append(b)
            continue
        if 0x20 <= b <= 0x7F:
            if ki < len(ks):
                xor = ks[ki]
            else:
                # Extend the keystream one step at a time
                ext_idx = ki - len(ks)
                while len(ext_ks) <= ext_idx:
                    ext_state = (ext_state * LCG_MULT + LCG_ADD) & MASK32
                    ext_ks.append(ext_state & 0x1F)
                xor = ext_ks[ext_idx]
            result.append(b ^ xor)
            ki += 1
        else:
            result.append(b)
    return bytes(result)

# ---------------------------------------------------------------------------
# Readability scorer — same weights as decrypt_raw.py / decode_questions.py.
# Rewards English letters, spaces, and common game-data punctuation.
# Penalises noise bytes ([\]^_ and @) which appear rarely in correct plaintext
# but frequently when the wrong key is used.
# ---------------------------------------------------------------------------
def score(dec: bytes) -> float:
    letters = sum(1 for b in dec if 0x41 <= b <= 0x5A or 0x61 <= b <= 0x7A)
    spaces  = sum(1 for b in dec if b == 0x20)
    common  = sum(1 for b in dec if b in b"!'|,.-?~=")
    noise   = sum(1 for b in dec if 0x5B <= b <= 0x5F or b == 0x40)
    return letters * 4 + spaces * 6 + common - noise * 8

# ---------------------------------------------------------------------------
# Brute-force the best key multiplier for one blob.
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

for n, rec in enumerate(records):
    if n % 200 == 0:
        print(f'  Processing record {n}/{num_records}...', flush=True)

    # Split off the unencrypted prefix (everything up to and including the 3rd comma).
    # Format: field0,field1,question_id,<encrypted blob>
    pos = 0
    for _ in range(3):
        pos = rec.index(b',', pos) + 1

    prefix_bytes = rec[:pos]   # includes the trailing comma
    blob         = rec[pos:]

    _mult, dec = find_best_decryption(blob)

    # Reassemble: raw prefix + decrypted blob, decoded as latin-1 (same as decrypt_raw.py).
    full_line = (prefix_bytes + dec).decode('latin-1')
    lines.append(full_line)

with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
    f.write('\n')

print(f'Wrote {out_path}')
print(f'Done. {num_records} records processed.')
