import { useState } from "react";
import { Color } from "./utils/color.enum.ts";
import { MatrixService } from "./utils/matrix.ts";
import { getAlternatePlayer } from "./utils/player.ts";

export function App() {
  const [matrix, setMatrix] = useState(MatrixService.buildMatrix);
  const [player, setPlayer] = useState(Color.BLACK);
  const score = MatrixService.getScore(matrix);
  const end = score[Color.PLAYABLE] === 0;
  const winner =
    score[Color.WHITE] > score[Color.BLACK] ? Color.WHITE : Color.BLACK;

  const onSelect = (x: number, y: number, cell: Color | null) => () => {
    if (cell === Color.PLAYABLE) {
      setMatrix((m) => {
        const service = new MatrixService(m, [x, y], player);
        return service.updateMatrix();
      });
      setPlayer(getAlternatePlayer);
    }
  };

  return (
    <>
      <table className={end ? winner : ""}>
        <tbody>
          {matrix.map((column, y) => (
            <tr key={`y-${y}`}>
              {column.map((cell, x) => (
                <td key={`x-${x}_y-${y}`} onClick={onSelect(x, y, cell)}>
                  <div className={"cell"} data-cell-value={cell}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className={"current-player"}>
        {end ? (
          <>
            Winner : <b>{winner}</b>
          </>
        ) : (
          <>
            Current player : <b>{player}</b>
          </>
        )}
      </p>
    </>
  );
}
