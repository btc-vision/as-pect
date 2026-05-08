/**
 * Strips ANSI escape sequences from a string.
 *
 * Covers:
 *  - CSI sequences: ESC [ ... final-byte (colors, cursor, SGR, etc.)
 *  - OSC sequences: ESC ] ... terminated by BEL (0x07) or ST (ESC \)
 *  - Other Fe escapes (single-shift, DCS, SOS, PM, APC) and standalone ESC + final byte
 */
export function stripAnsi(input: string): string {
  if (typeof input !== "string" || input.length === 0) return input;

  // Group 1: CSI    -> ESC [ ... [@-~]
  // Group 2: OSC    -> ESC ] ... (BEL | ESC \)
  // Group 3: DCS/SOS/PM/APC -> ESC [PX^_] ... (BEL | ESC \)
  // Group 4: other 2-byte escapes -> ESC [@-_a-z{|}~] (excluding the openers above)
  const ansiPattern =
    // eslint-disable-next-line no-control-regex
    /\x1B\[[0-?]*[ -/]*[@-~]|\x1B\][\s\S]*?(?:\x07|\x1B\\)|\x1B[PX^_][\s\S]*?(?:\x07|\x1B\\)|\x1B[@-Zc-~]/g;

  return input.replace(ansiPattern, "");
}
