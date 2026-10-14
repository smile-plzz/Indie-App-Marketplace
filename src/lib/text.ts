/** Pure text helpers shared between server and client admin surfaces. */

const PLACEHOLDER_POSITIONING = "positioning statement sits here";

/** True while the positioning line is still the seed placeholder copy. */
export function isPlaceholderPositioning(positioning: string) {
  return positioning.toLowerCase().includes(PLACEHOLDER_POSITIONING);
}
