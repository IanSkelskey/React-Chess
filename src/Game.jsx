import { useChessGame } from './useChessGame';
import Board from './Board';
import MoveHistory from './MoveHistory';

function Game() {
    const { squares, selectedPiece, possibleMoves, turn, moves, isGameOver, goBackAMove, resetGame, handleSquareClick } = useChessGame();

    return (
        <div className='game'>
            <h1>React Chess</h1>
            <label>It is {turn}'s turn</label>
            <div className='row'>
                <Board squares={squares}
                    selectedPiece={selectedPiece}
                    possibleMoves={possibleMoves}
                    onSquareClick={handleSquareClick} />
                <div style={{ overflowY: 'scroll', maxHeight: '360px', width: '300px' }}>
                    <MoveHistory moves={moves} />
                </div>
            </div>
            {isGameOver && <h2>Game Over</h2>}
            <div className='row'>
                <button onClick={goBackAMove} style={{ marginTop: '25px', width: '100px' }}>Go Back</button>
                <button onClick={resetGame} style={{ marginTop: '25px', width: '100px' }}>Reset Board</button>
            </div>
        </div>
    );
}

export default Game;
