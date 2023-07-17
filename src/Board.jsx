import Square from './Square';

const Board = ({ squares, selectedPiece, possibleMoves, onSquareClick }) => {
    return (
        <div className="board">
          {squares.map((row, i) => (
            <div className="row" key={i}>
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
    
    export default Board;