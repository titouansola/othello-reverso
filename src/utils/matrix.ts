import { Color } from "./color.enum.ts";
import { getAlternatePlayer } from "./player.ts";
import _ from "lodash";

type Matrix = (Color | null)[][];
type Coords = [number, number];
type Trigger = { start: Coords; end: Coords } | null;

export class MatrixService {
  private readonly matrix: Matrix;
  private readonly alternate: Color;

  constructor(
    _matrix: Matrix,
    private readonly played: Coords,
    private readonly player: Color,
  ) {
    this.matrix = _.cloneDeep(_matrix);
    this.alternate = getAlternatePlayer(this.player);
  }

  static buildMatrix() {
    const matrix: Matrix = [];
    for (let i = 0; i < 8; i++) {
      matrix.push([]);
      for (let j = 0; j < 8; j++) {
        matrix[i].push(null);
      }
    }
    // Initial position
    matrix[3][3] = Color.WHITE;
    matrix[3][4] = Color.BLACK;
    matrix[4][3] = Color.BLACK;
    matrix[4][4] = Color.WHITE;
    //
    matrix[2][3] = Color.PLAYABLE;
    matrix[3][2] = Color.PLAYABLE;
    matrix[4][5] = Color.PLAYABLE;
    matrix[5][4] = Color.PLAYABLE;
    //
    return matrix;
  }

  static getScore(matrix: Matrix) {
    const score = {
      [Color.WHITE]: 0,
      [Color.BLACK]: 0,
      [Color.PLAYABLE]: 0,
    };
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const value = matrix[i][j];
        if (value !== null) {
          score[value]++;
        }
      }
    }
    return score;
  }

  updateMatrix() {
    this.reverseAround();
    this.setPlayableCells();
    return this.matrix;
  }

  private reverseAround() {
    const [x, y] = this.played;
    const diff = x - y;
    const sum = x + y;
    //
    let h: Trigger = null;
    let v: Trigger = null;
    let dr: Trigger = null;
    let dl: Trigger = null;
    //
    for (let i = 0; i < 8; i++) {
      // Horizontal
      if (this.matrix[y][i] === this.player) {
        h = { start: [x, y], end: [i, y] };
      }
      for (let j = 0; j < 8; j++) {
        // Vertical
        if (this.matrix[j][x] === this.player) {
          v = { start: [x, y], end: [x, j] };
        }
        // Diagonal
        if (this.matrix[j][i] === this.player) {
          // Diagonal right
          if (i - j === diff) {
            dr = { start: [x, y], end: [i, j] };
          }
          // Diagonal left
          if (i + j === sum) {
            dl = { start: [x, y], end: [i, j] };
          }
        } else if (this.matrix[j][i] === Color.PLAYABLE) {
          this.matrix[j][i] = null;
        }
      }
    }
    //
    this.horizontalReverse(h);
    this.verticalReverse(v);
    this.diagonalRightReverse(dr);
    this.diagonalLeftReverse(dl);
    //
    this.matrix[y][x] = this.player;
  }

  private horizontalReverse(trigger: Trigger | null) {
    if (!trigger) return;
    //
    const [x, y] = trigger.start;
    const [u] = trigger.end;
    //
    const start = Math.min(x, u);
    const end = Math.max(x, u);
    //
    for (let i = start; i <= end; i++) {
      if (this.matrix[y][i] === this.alternate) {
        this.matrix[y][i] = this.player;
      }
    }
  }

  private verticalReverse(trigger: Trigger | null) {
    if (!trigger) return;
    //
    const [x, y] = trigger.start;
    const [, v] = trigger.end;
    //
    const start = Math.min(y, v);
    const end = Math.max(y, v);
    //
    for (let i = start; i <= end; i++) {
      if (this.matrix[i][x] === this.alternate) {
        this.matrix[i][x] = this.player;
      }
    }
  }

  private diagonalRightReverse(trigger: Trigger | null) {
    if (!trigger) return;
    //
    const [x, y] = trigger.start;
    const [u, v] = trigger.end;
    //
    const xs = Math.min(x, u);
    const ys = Math.min(y, v);
    const xe = Math.max(x, u);
    //
    for (let i = 0; i <= xe - xs; i++) {
      if (this.matrix[ys + i][xs + i] === this.alternate) {
        this.matrix[ys + i][xs + i] = this.player;
      }
    }
  }

  private diagonalLeftReverse(trigger: Trigger | null) {
    if (!trigger) return;
    //
    const [x, y] = trigger.start;
    const [u, v] = trigger.end;
    //
    const xs = Math.max(x, u);
    const ys = Math.min(y, v);
    const xe = Math.min(x, u);
    //
    for (let i = 0; i <= xs - xe; i++) {
      if (this.matrix[ys + i][xs - i] === this.alternate) {
        this.matrix[ys + i][xs - i] = this.player;
      }
    }
  }

  private setPlayableCells() {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.matrix[j][i] === this.alternate) {
          this.setPlayability(i, j);
        }
      }
    }
  }

  private setPlayability(x: number, y: number) {
    // Flags
    let leftFlag = false;
    let rightFlag = false;
    let upFlag = false;
    let downFlag = false;
    let diagRightupFlag = false;
    let diagRightdownFlag = false;
    let diagLeftupFlag = false;
    let diagLeftdownFlag = false;
    // Ends
    let leftEnd = false;
    let rightEnd = false;
    let upEnd = false;
    let downEnd = false;
    let diagRightupEnd = false;
    let diagRightdownEnd = false;
    let diagLeftupEnd = false;
    let diagLeftdownEnd = false;
    // Values
    let left: Color | null = null;
    let right: Color | null = null;
    let up: Color | null = null;
    let down: Color | null = null;
    let diagRightup: Color | null = null;
    let diagRightdown: Color | null = null;
    let diagLeftup: Color | null = null;
    let diagLeftdown: Color | null = null;
    //
    for (let i = 1; i < 8; i++) {
      const x1 = x + i;
      const x2 = x - i;
      const y1 = y + i;
      const y2 = y - i;
      // Right
      if (!rightEnd && x1 < 8) {
        right = this.matrix[y][x1];
        if (right === this.player) {
          rightFlag = true;
        }
        if (right === this.alternate) {
          rightEnd = true;
        }
        if ([null, Color.PLAYABLE].includes(right) && rightFlag) {
          rightEnd = true;
          this.matrix[y][x1] = Color.PLAYABLE;
        }
      } else {
        rightEnd = true;
      }
      // Left
      if (!leftEnd && x2 >= 0) {
        left = this.matrix[y][x2];
        if (left === this.player) {
          leftFlag = true;
        }
        if (left === this.alternate) {
          leftEnd = true;
        }
        if ([null, Color.PLAYABLE].includes(left) && leftFlag) {
          leftEnd = true;
          this.matrix[y][x2] = Color.PLAYABLE;
        }
      } else {
        leftEnd = true;
      }
      // Up
      if (!upEnd && y2 >= 0) {
        up = this.matrix[y2][x];
        if (up === this.player) {
          upFlag = true;
        }
        if (up === this.alternate) {
          upEnd = true;
        }
        if ([null, Color.PLAYABLE].includes(up) && upFlag) {
          upEnd = true;
          this.matrix[y2][x] = Color.PLAYABLE;
        }
      } else {
        upEnd = true;
      }
      // Down
      if (!downEnd && y1 < 8) {
        down = this.matrix[y1][x];
        if (down === this.player) {
          downFlag = true;
        }
        if (down === this.alternate) {
          downEnd = true;
        }
        if ([null, Color.PLAYABLE].includes(down) && downFlag) {
          downEnd = true;
          this.matrix[y1][x] = Color.PLAYABLE;
        }
      } else {
        downEnd = true;
      }
      // Diagonal Right Up
      if (!diagRightupEnd && x2 >= 0 && y2 >= 0) {
        diagRightup = this.matrix[y2][x2];
        if (diagRightup === this.player) {
          diagRightupFlag = true;
        }
        if (diagRightup === this.alternate) {
          diagRightupEnd = true;
        }
        if ([null, Color.PLAYABLE].includes(diagRightup) && diagRightupFlag) {
          diagRightupEnd = true;
          this.matrix[y2][x2] = Color.PLAYABLE;
        }
      } else {
        diagRightupEnd = true;
      }
      // Diagonal Right Down
      if (!diagRightdownEnd && x1 < 8 && y1 < 8) {
        diagRightdown = this.matrix[y1][x1];
        if (diagRightdown === this.player) {
          diagRightdownFlag = true;
        }
        if (diagRightdown === this.alternate) {
          diagRightdownEnd = true;
        }
        if (
          [null, Color.PLAYABLE].includes(diagRightdown) &&
          diagRightdownFlag
        ) {
          diagRightdownEnd = true;
          this.matrix[y1][x1] = Color.PLAYABLE;
        }
      } else {
        diagRightdownEnd = true;
      }
      // Diagonal Left Up
      if (!diagLeftupEnd && x1 < 8 && y2 >= 0) {
        diagLeftup = this.matrix[y2][x1];
        if (diagLeftup === this.player) {
          diagLeftupFlag = true;
        }
        if (diagLeftup === this.alternate) {
          diagLeftupEnd = true;
        }
        if ([null, Color.PLAYABLE].includes(diagLeftup) && diagLeftupFlag) {
          diagLeftupEnd = true;
          this.matrix[y2][x1] = Color.PLAYABLE;
        }
      } else {
        diagLeftupEnd = true;
      }
      // Diagonal Left Down
      if (!diagLeftdownEnd && x2 >= 0 && y1 < 8) {
        diagLeftdown = this.matrix[y1][x2];
        if (diagLeftdown === this.player) {
          diagLeftdownFlag = true;
        }
        if (diagLeftdown === this.alternate) {
          diagLeftdownEnd = true;
        }
        if ([null, Color.PLAYABLE].includes(diagLeftdown) && diagLeftdownFlag) {
          diagLeftdownEnd = true;
          this.matrix[y1][x2] = Color.PLAYABLE;
        }
      } else {
        diagLeftdownEnd = true;
      }
    }
  }
}
