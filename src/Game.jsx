import { useChessGame } from './useChessGame';
import Board from './Board';
import MoveHistory from './MoveHistory';

function Game() {
    const { squares, selectedPiece, possibleMoves, turn, moves, resetGame, handleSquareClick } = useChessGame();

    return (
        <div className='game'>
            <h1>React Chess</h1>
            <label>It is {turn}'s turn</label>
            <Board squares={squares}
                selectedPiece={selectedPiece}
                possibleMoves={possibleMoves}
                onSquareClick={handleSquareClick} />
            <MoveHistory moves={moves} />
            <button onClick={resetGame} style={{marginTop: '25px'}}>Reset Board</button>
        </div>
    );
}

export default Game;
