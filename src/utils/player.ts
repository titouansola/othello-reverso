import { Color } from "./color.enum.ts";

const players = [Color.BLACK, Color.WHITE];

export function getAlternatePlayer(current: Color) {
  return players[(players.indexOf(current) + 1) % players.length];
}
