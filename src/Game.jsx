import { useState, useEffect, useCallback } from 'react';
import Board from './Board';

const piecesOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

function Game() {
    const createInitialBoard = () => {
        const initialBoard = Array(8).fill(null).map(() => Array(8).fill(null));
        for (let i = 0; i < 8; i++) {
            // Set pawns with the 'firstMove' property set to true
            initialBoard[1][i] = { type: 'pawn', color: 'dark', firstMove: true };
            initialBoard[6][i] = { type: 'pawn', color: 'light', firstMove: true };

            // Set other pieces
            initialBoard[0][i] = { type: piecesOrder[i], color: 'dark' };
            initialBoard[7][i] = { type: piecesOrder[i], color: 'light' };
        }
        return initialBoard;
    };

    const [squares, setSquares] = useState(createInitialBoard);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [turn, setTurn] = useState('light');
    const [possibleMoves, setPossibleMoves] = useState([]);

    const handleReset = useCallback(() => {
        setSquares(createInitialBoard());
        setSelectedPiece(null);
        setTurn('light');
        setPossibleMoves([]);
    }, []);

    const handleSquareClick = (i, j) => {
        if (selectedPiece) {
            if (isValidMove(selectedPiece.piece, { i: selectedPiece.i, j: selectedPiece.j }, { i, j })) {
                // if a piece is selected and the target square is valid, move the piece
                squares[selectedPiece.i][selectedPiece.j] = null;
                squares[i][j] = selectedPiece.piece;
                setSelectedPiece(null);  // clear the selection
                setPossibleMoves([]); // Clear the possible moves as we have moved the piece
                // Set firstMove to false after the pawn has moved
                if (squares[i][j].type === 'pawn') {
                    squares[i][j].firstMove = false;
                }
                // Change the turn to the other player
                setTurn(turn === 'light' ? 'dark' : 'light');
            } else {
                // Deselect if the same piece is clicked again, or an invalid move is made
                setSelectedPiece(null);
                setPossibleMoves([]); // Clear the possible moves as we have deselected the piece
            }
        } else if (squares[i][j] && squares[i][j].color === turn) {
            // select the piece
            setSelectedPiece({ piece: squares[i][j], i, j });

            // Generate the possible moves for the selected piece
            let moves = generatePossibleMoves({ piece: squares[i][j], i, j });
            setPossibleMoves(moves);
        }

        // Update state with the new board
        setSquares([...squares]);
    };

    const generatePossibleMoves = ({ piece, i, j }) => {
        let moves = [];

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if (isValidMove(piece, { i, j }, { i: x, j: y })) {
                    moves.push({ i: x, j: y });
                }
            }
        }

        return moves;
    };

    function isValidMove(piece, start, end) {
        const dx = end.i - start.i;
        const dy = end.j - start.j;

        // Check if the piece stays in the same place
        if (dx === 0 && dy === 0) {
            return false;
        }

        switch (piece.type) {
            case 'pawn':
                // Pawns can move straight ahead one or two squares on their first move, one square afterwards
                if (piece.color === 'light') {
                    return dy === 0 && (dx === -1 || (dx === -2 && piece.firstMove));
                } else {
                    return dy === 0 && (dx === 1 || (dx === 2 && piece.firstMove));
                }
            case 'rook':
                // Rooks can move any number of squares along a rank or file
                return dx * dy === 0;
            case 'bishop':
                // Bishops can move any number of squares diagonally
                return Math.abs(dx) === Math.abs(dy);
            case 'queen':
                // Queens can move any number of squares along a rank, file, or diagonal
                return Math.abs(dx) * Math.abs(dy) === 0 || Math.abs(dx) === Math.abs(dy);
            case 'king':
                // Kings can move one square in any direction
                return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
            case 'knight':
                // Knights can move to any square not on the same rank, file, or diagonal (in other words, they can jump)
                return Math.abs(dx) * Math.abs(dy) === 2;
            default:
                return false;
        }
    }



    return (
        <div>
            <h1>React Chess</h1>
            <Board squares={squares}
                selectedPiece={selectedPiece}
                possibleMoves={possibleMoves}
                onSquareClick={handleSquareClick} />
            <button onClick={handleReset} style={{ marginTop: '20px' }}>Reset Board</button>
        </div>
    );
}

export default Game;
