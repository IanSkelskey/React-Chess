import Square from './Square';

const Board = ({ squares, selectedPiece, possibleMoves, onSquareClick }) => {
  const labelsColumn = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const labelsRow = ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  return (
      <div className="board">
        <div className="row">
          <div className="square label"></div> {/* Top left corner, empty */}
          {labelsColumn.map((label, j) => (
            <div className="square label" key={j}>{label}</div>
          ))}
        </div>
        {squares.map((row, i) => (
          <div className="row" key={i}>
            <div className="square label">{labelsRow[i]}</div> {/* Row label */}
            {row.map((square, j) => (
              <Square
                piece={square}
                key={j}
                dark={(i + j) % 2 === 1}
                selected={selectedPiece && selectedPiece.i === i && selectedPiece.j === j}
                possibleMove={possibleMoves.some(pos => pos.i === i && pos.j === j)}
                onClick={() => onSquareClick(i, j)}
              />
            ))}
          </div>
        ))}
      </div>
  );
};

export const iterateBoard = (callback) => {
  for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
          callback(x, y);
      }
  }
}

export default Board;
