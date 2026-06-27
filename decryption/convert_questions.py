#!/usr/bin/env python3
"""
convert_questions.py

Converts raw decrypted question data into NDJSON format
compatible with mongoimport.

Usage:
    python convert_questions.py --pack <int> --starting-id <int> [--input <path>] [--output <path>]

Arguments:
    --pack          Integer questionPack value (required, e.g. 2)
    --starting-id   First _id to assign; incremented per question (required, e.g. 1)
    --input         Path to the raw input file
                    (default: <script_dir>/raw/questions_raw_decrypted.txt)
    --output        Path to the NDJSON output file
                    (default: <script_dir>/questions.ndjson)

Parsing rules
-------------
Column layout (comma-delimited, CSV-quoted where needed):
  1. Constant "5"   — ignored
  2. Round          — ignored
  3. Question ID    — ignored (auto-incrementing _id used instead)
  4. Question text  — may be CSV-quoted if it contains a comma
  5+. Answers blob  — alternating [group_text, point_value, group_text, point_value, ...]
                      The CSV parser naturally separates these because the commas between
                      groups are top-level (unquoted).

Answer group text is pipe-delimited. Each pipe-delimited token is parsed as:
  [~forbiddenWord ...] [modifiers] answerText

Modifier rules:
  No modifier   → fuzzy (matchType 1)
  ! or # or +   → fuzzy (matchType 1)
  = (anywhere)  → exact (matchType 2)
  != or =!      → exact (matchType 2)
  bare integer  → exact (matchType 2)

Skip conditions:
  - Answer group count < 3 or > 7
  - Any line that raises a parse error (a warning is printed to stderr)

averageScore:
  3-4 groups → sum of top 2 point values
  5-7 groups → sum of top 3 point values
"""

import argparse
import csv
import json
import re
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Token-level parsing
# ---------------------------------------------------------------------------

_FORBIDDEN_RE = re.compile(r'^~\s*(\S+)\s*')
_MODIFIER_RE = re.compile(r'^([!#=+]+)')
_INTEGER_RE = re.compile(r'^\d+$')


def parse_token(raw_token: str) -> tuple[dict | None, bool]:
    """
    Parse a single pipe-delimited answer token into an answer dict.

    Returns (answer_dict_or_None, bare_integer_flag).
    bare_integer_flag is True if the answer text is a bare integer (no modifier),
    which may indicate a data error and should be flagged for review.

    Token grammar (loosely):
        token ::= forbidden* modifier* answerText

    where:
        forbidden ::= '~' \\s* word \\s*
        modifier  ::= '!' | '#' | '=' | '+'
        answerText ::= anything remaining after stripping modifiers
    """
    token = raw_token.strip()
    if not token:
        return None, False

    forbidden_words: list[str] = []

    # Extract leading forbidden-word markers (~word, or ~ word with optional space)
    while True:
        m = _FORBIDDEN_RE.match(token)
        if m:
            forbidden_words.append(m.group(1))
            token = token[m.end():].strip()
        else:
            break

    if not token:
        # Token contained only forbidden-word markers; nothing usable
        return None, False

    # Extract leading modifier characters
    m = _MODIFIER_RE.match(token)
    modifiers: str = m.group(1) if m else ''
    answer_text: str = token[len(modifiers):].strip()

    if not answer_text:
        return None, False

    # Determine match type
    bare_integer = False
    if '=' in modifiers:
        match_type = 2  # explicit exact
    elif not modifiers and _INTEGER_RE.match(answer_text):
        match_type = 2  # bare integer → exact (e.g. years, ages)
        bare_integer = True
    else:
        match_type = 1  # fuzzy (default)

    return {
        'matchType': match_type,
        'answerText': answer_text,
        'forbiddenWords': forbidden_words,
    }, bare_integer


# ---------------------------------------------------------------------------
# Answer group parsing
# ---------------------------------------------------------------------------

def parse_answer_group(group_text: str, point_value: int) -> tuple[dict | None, bool]:
    """
    Parse a single answer group from its pipe-delimited text and integer
    point value.

    Returns (group_dict_or_None, bare_integer_found).
    bare_integer_found is True if any answer token in this group was a bare integer.
    """
    raw_tokens = group_text.split('|')
    answers: list[dict] = []
    bare_integer_found = False

    for raw_token in raw_tokens:
        answer, bare_integer = parse_token(raw_token)
        if answer is not None:
            answers.append(answer)
            if bare_integer:
                bare_integer_found = True

    if not answers:
        return None, False

    # The first answer's text becomes the board display text for this group
    display_text = answers[0]['answerText']

    return {
        'pointValue': point_value,
        'displayText': display_text,
        'answers': answers,
    }, bare_integer_found


# ---------------------------------------------------------------------------
# averageScore calculation
# ---------------------------------------------------------------------------

def compute_average_score(answer_groups: list[dict]) -> int:
    """
    3-4 groups → sum of top 2 point values
    5-7 groups → sum of top 3 point values
    """
    point_values = sorted(
        (g['pointValue'] for g in answer_groups), reverse=True
    )
    n = len(answer_groups)
    if 3 <= n <= 4:
        return sum(point_values[:2])
    # 5-7
    return sum(point_values[:3])


# ---------------------------------------------------------------------------
# Row parsing
# ---------------------------------------------------------------------------

def parse_row(auto_id: int, fields: list[str], question_pack: int) -> tuple[dict, list[str]]:
    """
    Parse a single CSV-decoded row into a question document.

    Returns (question_dict, warnings) where warnings is a list of non-fatal
    advisory messages (e.g. bare integer answers).

    Raises ValueError with a descriptive message if the row cannot be parsed
    into a valid question.
    """
    if len(fields) < 6:
        raise ValueError(
            f'Only {len(fields)} field(s); need at least 6 '
            f'(constant, round, id, question, group_text, point_value)'
        )

    # Column 0: constant — ignore
    # Column 1: round — ignore
    # Column 2: question ID — ignore (use auto_id)
    # Column 3: question text
    question_text = fields[3]

    # Columns 4+: alternating [group_text, point_value, ...]
    answer_fields = fields[4:]
    if len(answer_fields) % 2 != 0:
        raise ValueError(
            f'{len(answer_fields)} answer field(s) — must be even to pair '
            f'group texts with point values'
        )

    answer_groups: list[dict] = []
    warnings: list[str] = []

    for i in range(0, len(answer_fields), 2):
        group_text = answer_fields[i]
        point_str = answer_fields[i + 1].strip()

        if not point_str.isdigit():
            raise ValueError(
                f'Expected integer point value at CSV field {4 + i + 1}, '
                f'got: {point_str!r}'
            )

        point_value = int(point_str)
        group, bare_integer_found = parse_answer_group(group_text, point_value)
        if group is not None:
            answer_groups.append(group)
            if bare_integer_found:
                warnings.append(
                    f'Bare integer answer detected in group "{group["displayText"]}" '
                    f'— verify this is intentional'
                )

    n = len(answer_groups)
    if n < 3:
        raise ValueError(
            f'Only {n} valid answer group(s) — need at least 3'
        )
    if n > 7:
        raise ValueError(
            f'{n} answer groups exceeds the maximum of 7'
        )

    return {
        '_id': auto_id,
        'questionPack': question_pack,
        'questionText': question_text,
        'bonusEligible': len(question_text) <= 80,
        'averageScore': compute_average_score(answer_groups),
        'answerGroups': answer_groups,
    }, warnings


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    script_dir = Path(__file__).parent

    parser = argparse.ArgumentParser(
        description='Convert raw decrypted question data to MongoDB-compatible NDJSON.'
    )
    parser.add_argument(
        '--pack',
        type=int,
        required=True,
        metavar='INT',
        help='Integer questionPack value (e.g. 2)',
    )
    parser.add_argument(
        '--starting-id',
        type=int,
        required=True,
        metavar='INT',
        help='First _id to assign; incremented per written question (e.g. 1)',
    )
    parser.add_argument(
        '--input',
        type=Path,
        default=script_dir / 'raw' / 'questions_raw_decrypted.txt',
        metavar='FILE',
        help='Path to the raw input file',
    )
    parser.add_argument(
        '--output',
        type=Path,
        default=script_dir / 'questions.ndjson',
        metavar='FILE',
        help='Path to the NDJSON output file',
    )
    args = parser.parse_args()

    input_path: Path = args.input
    output_path: Path = args.output
    question_pack: int = args.pack
    auto_id: int = args.starting_id

    if not input_path.exists():
        print(f'ERROR: Input file not found: {input_path}', file=sys.stderr)
        sys.exit(1)

    written = 0
    skipped = 0

    with (
        open(input_path, encoding='utf-8', newline='') as in_file,
        open(output_path, 'w', encoding='utf-8') as out_file,
    ):
        reader = csv.reader(in_file, escapechar='\\')
        for line_number, fields in enumerate(reader, start=1):
            try:
                question, warnings = parse_row(auto_id, fields, question_pack)
            except ValueError as exc:
                print(
                    f'WARNING line {line_number}: {exc}',
                    file=sys.stderr,
                )
                skipped += 1
                continue

            for warning in warnings:
                print(f'WARNING line {line_number}: {warning}', file=sys.stderr)

            out_file.write(json.dumps(question, ensure_ascii=False) + '\n')
            written += 1
            auto_id += 1

    print(f'Done.')
    print(f'  Written    : {written}')
    print(f'  Skipped    : {skipped}')
    print(f'  Last _id   : {auto_id - 1}')
    print(f'  Output     : {output_path}')


if __name__ == '__main__':
    main()
