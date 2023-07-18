import { useState, useCallback } from 'react';

const piecesOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

export function useChessGame() {
    const [moves, setMoves] = useState([]);
    const [squares, setSquares] = useState(createInitialBoard());
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [turn, setTurn] = useState('light');
    const [possibleMoves, setPossibleMoves] = useState([]);

    const resetGame = useCallback(() => {
        setSquares(createInitialBoard());
        setSelectedPiece(null);
        setTurn('light');
        setPossibleMoves([]);
        setMoves([]);
    }, []);

    const handleSquareClick = (i, j) => {
        if (selectedPiece) {
            if (isValidMove(selectedPiece.piece, { i: selectedPiece.i, j: selectedPiece.j }, { i, j }, squares)) {
                let capturedPiece = squares[i][j]; // Store the piece that was captured

                // Move the piece to the target square
                squares[selectedPiece.i][selectedPiece.j] = null;
                squares[i][j] = selectedPiece.piece;

                // Set firstMove to false after the pawn has moved
                if (selectedPiece.piece.type === 'pawn') {
                    squares[i][j].firstMove = false;
                }

                setSelectedPiece(null);
                setPossibleMoves([]);
                setTurn(turn === 'light' ? 'dark' : 'light');

                // Handle en passant
                if (selectedPiece.piece.type === 'pawn' && selectedPiece.j !== j && !capturedPiece) {
                    // Determine the position of the captured pawn
                    const capturedPawnPosition = { i: selectedPiece.i, j };

                    // Remove the captured pawn for en passant
                    capturedPiece = squares[capturedPawnPosition.i][capturedPawnPosition.j];
                    squares[capturedPawnPosition.i][capturedPawnPosition.j] = null;
                }

                // Record the move
                const move = {
                    piece: selectedPiece.piece,
                    start: { i: selectedPiece.i, j: selectedPiece.j },
                    end: { i, j },
                    capturedPiece,
                    movedTwoSquares: selectedPiece.piece.type === 'pawn' && Math.abs(selectedPiece.i - i) === 2
                };

                setMoves([...moves, move]); // Update the moves state here

                // Update the squares state after updating the moves and removing the captured piece
                setSquares([...squares]);
            } else {
                setSelectedPiece(null);
                setPossibleMoves([]);
            }
        } else if (squares[i][j] && squares[i][j].color === turn) {
            setSelectedPiece({ piece: squares[i][j], i, j });
            const moves = generatePossibleMoves({ piece: squares[i][j], i, j });
            setPossibleMoves(moves);
        }
    };


    function createInitialBoard() {
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
    }

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
            if (isValidMove(piece, { i, j }, { i: x, j: y })) {
                moves.push({ i: x, j: y });
            }
        });

        return moves;
    }

    function isValidMove(piece, start, end) {
        const dx = end.i - start.i;
        const dy = end.j - start.j;

        // Check if the piece stays in the same place
        if (dx === 0 && dy === 0) {
            return false;
        }

        // Check if the target square is occupied by a piece of the same color
        if (squares[end.i][end.j] && squares[end.i][end.j].color === piece.color) {
            return false;
        }

        const moveParams = { piece, start, end, dx, dy };

        switch (piece.type) {
            case 'pawn':
                return isPawnMoveValid(moveParams);
            case 'rook':
                return isRookMoveValid(moveParams);
            case 'bishop':
                return isBishopMoveValid(moveParams);
            case 'queen':
                return isQueenMoveValid(moveParams);
            case 'king':
                return isKingMoveValid(moveParams);
            case 'knight':
                return isKnightMoveValid(moveParams);
            default:
                return false;
        }
    }

    function isPawnMoveValid({ piece, end, dx, dy }) {
        if (piece.color === 'light') {
            // Check for en passant
            if (dy === 0) {
                return (dx === -1 || (dx === -2 && piece.firstMove)) && !squares[end.i][end.j];
            } else if (dx === -1 && Math.abs(dy) === 1 && squares[end.i][end.j] === null) {
                const lastMove = moves[moves.length - 1];
                if (lastMove && lastMove.piece.type === 'pawn' && lastMove.movedTwoSquares) {
                    return lastMove.end.i === end.i + 1 && lastMove.end.j === end.j;
                }
            } else {
                return dx === -1 && Math.abs(dy) === 1 && squares[end.i][end.j] && squares[end.i][end.j].color !== piece.color;
            }
        } else {
            if (dy === 0) {
                return (dx === 1 || (dx === 2 && piece.firstMove)) && !squares[end.i][end.j];
            } else if (dx === 1 && Math.abs(dy) === 1 && squares[end.i][end.j] === null) {
                const lastMove = moves[moves.length - 1];
                if (lastMove && lastMove.piece.type === 'pawn' && lastMove.movedTwoSquares) {
                    return lastMove.end.i === end.i - 1 && lastMove.end.j === end.j;
                }
            } else {
                return dx === 1 && Math.abs(dy) === 1 && squares[end.i][end.j] && squares[end.i][end.j].color !== piece.color;
            }
        }
    }


    function isRookMoveValid({ start, end, dx, dy }) {
        if (dx === 0) {
            const direction = dy > 0 ? 1 : -1;
            for (let j = start.j + direction; j !== end.j; j += direction) {
                if (squares[start.i][j]) {
                    return false;
                }
            }
        } else if (dy === 0) {
            const direction = dx > 0 ? 1 : -1;
            for (let i = start.i + direction; i !== end.i; i += direction) {
                if (squares[i][start.j]) {
                    return false;
                }
            }
        }
        return dx * dy === 0;
    }

    function isBishopMoveValid({ start, end, dx, dy }) {
        if (Math.abs(dx) === Math.abs(dy)) {
            const directionX = dx > 0 ? 1 : -1;
            const directionY = dy > 0 ? 1 : -1;
            let i = start.i + directionX;
            let j = start.j + directionY;
            while (i !== end.i && j !== end.j) {
                if (squares[i][j]) {
                    return false;
                }
                i += directionX;
                j += directionY;
            }
        }
        return Math.abs(dx) === Math.abs(dy);
    }

    function isQueenMoveValid({ start, end, dx, dy }) {
        if (dx * dy === 0 || Math.abs(dx) === Math.abs(dy)) {
            const directionX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
            const directionY = dy > 0 ? 1 : dy < 0 ? -1 : 0;
            let i = start.i + directionX;
            let j = start.j + directionY;
            while (i !== end.i || j !== end.j) {
                if (squares[i][j]) {
                    return false;
                }
                i += directionX;
                j += directionY;
            }
        }
        return Math.abs(dx) * Math.abs(dy) === 0 || Math.abs(dx) === Math.abs(dy);
    }

    function isKingMoveValid({ piece, end, dx, dy }) {
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && !isSquareUnderAttack(end, piece.color === 'light' ? 'dark' : 'light');
    }

    function isKnightMoveValid({ dx, dy }) {
        return Math.abs(dx) * Math.abs(dy) === 2;
    }

    function canPawnAttack({ piece, start, end }) {
        const dx = end.i - start.i;
        const dy = end.j - start.j;

        if (piece.color === 'light') {
            return dx === -1 && Math.abs(dy) === 1;
        } else {
            return dx === 1 && Math.abs(dy) === 1;
        }
    }

    function isSquareUnderAttack(square, attackingColor) {
        let underAttack = false;

        iterateBoard((x, y) => {
            const piece = squares[x][y];
            if (piece && piece.color === attackingColor) {
                if (piece.type === 'pawn') {
                    if (canPawnAttack({ piece, start: { i: x, j: y }, end: square })) {
                        underAttack = true;
                    }
                } else if (isValidMove(piece, { i: x, j: y }, square)) {
                    underAttack = true;
                }
            }
        });

        return underAttack;
    }

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
