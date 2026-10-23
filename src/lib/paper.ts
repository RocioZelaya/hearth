import { unitHash } from "./hash";

/** What kind of sheet a note is written on. */
export type Sheet = "plain" | "ruled" | "torn" | "sticky-yellow" | "sticky-rose" | "sticky-sage" | "sticky-blue";

/** What keeps the sheet on the wall. Sticky notes stick by themselves. */
export type Holder = "pin" | "tape" | "tape-corners" | "none";

export type PaperLook = {
  sheet: Sheet;
  holder: Holder;
  /** Degrees, roughly −2.5 to 2.5. */
  tilt: number;
};

const SHEETS: Sheet[] = ["plain", "ruled", "ruled", "torn", "sticky-yellow", "sticky-rose", "sticky-sage", "sticky-blue", "plain", "ruled"];
const HOLDERS: Holder[] = ["pin", "pin", "tape", "tape-corners", "tape"];

/**
 * Every note gets its own paper, chosen once from its id so the wall
 * never reshuffles between renders. Sticky notes lean a little more.
 */
export function paperLook(id: string): PaperLook {
  const sheet = pick(SHEETS, unitHash(`sheet:${id}`));
  const sticky = sheet.startsWith("sticky");
  const holder = sticky ? "none" : pick(HOLDERS, unitHash(`holder:${id}`));
  const range = sticky ? 6 : 4;
  const tilt = Number((unitHash(`tilt:${id}`) * range - range / 2).toFixed(2));
  return { sheet, holder, tilt };
}

/** The class names for a look, to put on the `.paper` element. */
export function paperClasses({ sheet, holder }: PaperLook): string {
  return `paper sheet-${sheet} holder-${holder}`;
}

function pick<T>(list: T[], unit: number): T {
  return list[Math.min(list.length - 1, Math.floor(unit * list.length))];
}
