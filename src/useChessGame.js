import { useState, useCallback } from 'react';
import { BOARD_INITIAL_STATE } from './constants';
import { isValidMove } from './PieceMovement';

export function useChessGame() {
    const [moves, setMoves] = useState([]);
    const [squares, setSquares] = useState(BOARD_INITIAL_STATE);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [turn, setTurn] = useState('light');
    const [possibleMoves, setPossibleMoves] = useState([]);

    const resetGame = useCallback(() => {
        setSquares(BOARD_INITIAL_STATE);
        setSelectedPiece(null);
        setTurn('light');
        setPossibleMoves([]);
        setMoves([]);
    }, []);

    const selectPiece = useCallback((i, j) => {
        const noPieceToSelect = !squares[i][j] || squares[i][j].color !== turn;
        if (noPieceToSelect) return;
        setSelectedPiece({ piece: squares[i][j], i, j });
        const possibleMoves = generatePossibleMoves({ piece: squares[i][j], i, j });
        setPossibleMoves(possibleMoves);
    }, [squares, turn]);

    const deselectPiece = useCallback(() => {
        setSelectedPiece(null);
        setPossibleMoves([]);
    }, []);

    const handleSquareClick = (i, j) => {
        if (!selectedPiece) {
            selectPiece(i, j);
            return;
        }
        if (!isValidMove(squares, moves, selectedPiece.piece, { i: selectedPiece.i, j: selectedPiece.j }, { i, j })) {
            deselectPiece();
            return;
        }
        let capturedPiece = squares[i][j]; // Store the piece that was captured

        // Move the piece to the target square
        squares[selectedPiece.i][selectedPiece.j] = null;
        squares[i][j] = selectedPiece.piece;

        // Set firstMove to false after the pawn has moved
        if (selectedPiece.piece.type === 'pawn' || selectedPiece.piece.type === 'rook' || selectedPiece.piece.type === 'king') {
            squares[i][j].firstMove = false;
        }

        // Record the move
        const move = {
            piece: selectedPiece.piece,
            start: { i: selectedPiece.i, j: selectedPiece.j },
            end: { i, j },
            capturedPiece,
            movedTwoSquares: selectedPiece.piece.type === 'pawn' && Math.abs(selectedPiece.i - i) === 2
        };

        // Handle en passant
        if (selectedPiece.piece.type === 'pawn' && selectedPiece.j !== j && !capturedPiece) {
            // Determine the position of the captured pawn
            const capturedPawnPosition = { i: selectedPiece.i, j };

            // Remove the captured pawn for en passant
            move.capturedPiece = squares[capturedPawnPosition.i][capturedPawnPosition.j];
            console.log('en passant captured piece:', capturedPiece);
            squares[capturedPawnPosition.i][capturedPawnPosition.j] = null;
            move.enPassant = capturedPawnPosition;
        }

        // Handle castling
        if (selectedPiece.piece.type === 'king' && Math.abs(selectedPiece.j - j) === 2) {
            const rookPosition = { i, j: j > selectedPiece.j ? j + 1 : j - 2 };
            const rookTargetPosition = { i, j: j > selectedPiece.j ? j - 1 : j + 1 };

            // Move the rook to the target square
            squares[rookTargetPosition.i][rookTargetPosition.j] = squares[rookPosition.i][rookPosition.j];
            squares[rookPosition.i][rookPosition.j] = null;
            // Record the move
            move.rook = {
                piece: squares[rookTargetPosition.i][rookTargetPosition.j],
                start: rookPosition,
                end: rookTargetPosition
            };
        }

        setSelectedPiece(null);
        setPossibleMoves([]);
        toggleTurn();

        setMoves([...moves, move]); // Update the moves state here

        // Update the squares state after updating the moves and removing the captured piece
        setSquares([...squares]);
    };

    function iterateBoard(callback) {
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                callback(x, y);
            }
        }
    }

    function generatePossibleMoves({ piece, i, j }) {
        const moves = [];
        iterateBoard((x, y) => {
            if (isValidMove(squares, moves, piece, { i, j }, { i: x, j: y })) moves.push({ i: x, j: y });
        });
        return moves;
    }

    function goBackAMove() {
        if (moves.length === 0) {
            return;
        }

        const newMoves = [...moves];
        const lastMove = newMoves.pop();
        const { start, end, piece } = lastMove;

        const newSquares = [...squares];
        newSquares[start.i][start.j] = piece;
        newSquares[end.i][end.j] = null;

        // If the piece is a pawn and it was its first move, reset the firstMove property
        if ((piece.type === 'pawn' || piece.type === 'king' || piece.type === 'rook') && piece.firstMove === false) {
            piece.firstMove = true;
        }

        // The piece is a king and the move is a castle move
        if (piece.type === 'king' && Math.abs(start.j - end.j) === 2) {
            if (end.j > start.j) {
                // King side castling
                const rook = newSquares[start.i][5];
                newSquares[start.i][5] = null;
                newSquares[start.i][7] = rook;
            } else {
                // Queen side castling
                const rook = newSquares[start.i][3];
                newSquares[start.i][3] = null;
                newSquares[start.i][0] = rook;
            }
        }

        // If the piece is a pawn and the move was en passant, put the captured pawn back
        if (piece.type === 'pawn' && lastMove.enPassant) {
            console.log('en passant', lastMove);
            newSquares[lastMove.enPassant.i][lastMove.enPassant.j] = lastMove.capturedPiece;
        } else if (lastMove.capturedPiece) {
            newSquares[end.i][end.j] = lastMove.capturedPiece;
        }

        setSquares(newSquares);
        setMoves(newMoves);
        toggleTurn();
    }

    const toggleTurn = () => {
        setTurn(turn === 'light' ? 'dark' : 'light');
    }

    return {
        squares,
        selectedPiece,
        possibleMoves,
        turn,
        goBackAMove,
        resetGame,
        handleSquareClick,
        moves
    };
}
