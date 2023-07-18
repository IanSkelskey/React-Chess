import { useState, useCallback } from 'react';
import { generatePossibleMoves, isValidMove } from './PieceMoves';

const piecesOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

export function useChessGame() {

    const [moves, setMoves] = useState([]);

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

    const resetGame = useCallback(() => {
        setSquares(createInitialBoard());
        setSelectedPiece(null);
        setTurn('light');
        setPossibleMoves([]);
        setMoves([]); // Clear the moves array when the game is reset
    }, []);

    const handleSquareClick = (i, j) => {
        if (selectedPiece) {
            if (isValidMove(selectedPiece.piece, { i: selectedPiece.i, j: selectedPiece.j }, { i, j }, squares)) {
                // if a piece is selected and the target square is valid, move the piece
                squares[selectedPiece.i][selectedPiece.j] = null;
                let capturedPiece = squares[i][j]; // Store the piece that was captured
                // Check en passant
                if (selectedPiece.piece.type === 'pawn' && selectedPiece.piece.color === turn &&
                    j !== selectedPiece.j && !capturedPiece) {
                    capturedPiece = squares[selectedPiece.i][j];
                    squares[selectedPiece.i][j] = null; // Remove the captured pawn
                }
                squares[i][j] = selectedPiece.piece;
                setSelectedPiece(null);  // clear the selection
                setPossibleMoves([]); // Clear the possible moves as we have moved the piece
                // Set firstMove to false after the pawn has moved
                if (squares[i][j].type === 'pawn') {
                    squares[i][j].firstMove = false;
                }
                // Change the turn to the other player
                setTurn(turn === 'light' ? 'dark' : 'light');
                // Record the move
                const move = {
                    piece: selectedPiece.piece,
                    start: { i: selectedPiece.i, j: selectedPiece.j },
                    end: { i, j },
                    capturedPiece,
                    movedTwoSquares: selectedPiece.piece.type === 'pawn' && Math.abs(selectedPiece.i - i) === 2
                };
                setMoves([...moves, move]); // Add the new move to the moves array
            } else {
                // Deselect if the same piece is clicked again, or an invalid move is made
                setSelectedPiece(null);
                setPossibleMoves([]); // Clear the possible moves as we have deselected the piece
            }
        } else if (squares[i][j] && squares[i][j].color === turn) {
            // select the piece
            setSelectedPiece({ piece: squares[i][j], i, j });

            // Generate the possible moves for the selected piece
            let moves = generatePossibleMoves({ piece: squares[i][j], i, j }, squares);
            setPossibleMoves(moves);
        }

        // Update state with the new board
        setSquares([...squares]);
    };

    return {
        squares,
        selectedPiece,
        possibleMoves,
        turn,
        resetGame,
        handleSquareClick,
        moves
    };
}
