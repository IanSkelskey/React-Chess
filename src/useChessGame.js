import { useState, useCallback } from 'react';
import { BOARD_INITIAL_STATE } from './constants';

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

    const handleSquareClick = (i, j) => {
        if (selectedPiece) {
            if (isValidMove(selectedPiece.piece, { i: selectedPiece.i, j: selectedPiece.j }, { i, j }, squares)) {
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

        if (piece.type === 'king' && piece.firstMove) {
            // Check for kingside castling
            if (squares[i][j + 3] && squares[i][j + 3].type === 'rook' && squares[i][j + 3].firstMove) {
                let canCastle = true;
                for (let k = 1; k < 3; k++) {
                    if (squares[i][j + k] || isSquareUnderAttack({ i, j: j + k }, piece.color === 'light' ? 'dark' : 'light')) {
                        canCastle = false;
                        break;
                    }
                }
                if (canCastle) {
                    moves.push({ i, j: j + 2 });
                }
            }

            // Check for queenside castling
            if (squares[i][j - 4] && squares[i][j - 4].type === 'rook' && squares[i][j - 4].firstMove) {
                let canCastle = true;
                for (let k = 1; k < 4; k++) {
                    if (squares[i][j - k] || isSquareUnderAttack({ i, j: j - k }, piece.color === 'light' ? 'dark' : 'light')) {
                        canCastle = false;
                        break;
                    }
                }
                if (canCastle) {
                    moves.push({ i, j: j - 2 });
                }
            }

        }

        return moves;
    }

    function isValidMove(piece, start, end) {
        const dx = end.i - start.i;
        const dy = end.j - start.j;

        // check if this is a castling move
        if (piece.type === 'king' && piece.firstMove && dx === 0 && Math.abs(dy) === 2) {
            // it's a valid move only if there's no piece between the king and the rook
            if ((dy > 0 && !squares[start.i][start.j + 1] && !squares[start.i][start.j + 2]) ||
                (dy < 0 && !squares[start.i][start.j - 1] && !squares[start.i][start.j - 2] && !squares[start.i][start.j - 3])) {
                return true;
            }
        }

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

    function isKingMoveValid({ piece, start, end, dx, dy }) {
        const castlingMove = Math.abs(dx) === 2 && dy === 0;
        if (castlingMove) {
            if (!piece.firstMove || isSquareUnderAttack(start, piece.color === 'light' ? 'dark' : 'light')) {
                return false;
            }

            const direction = dx > 0 ? 1 : -1;
            const rookPos = dx > 0 ? { i: start.i, j: 7 } : { i: start.i, j: 0 };
            const rook = squares[rookPos.i][rookPos.j];

            if (!rook || rook.type !== 'rook' || !rook.firstMove) {
                return false;
            }

            for (let j = start.j + direction; j !== end.j; j += direction) {
                if (squares[start.i][j] || isSquareUnderAttack({ i: start.i, j }, piece.color === 'light' ? 'dark' : 'light')) {
                    return false;
                }
            }

            return true;
        }

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

    const findKing = (color) => {
        let kingPos = null;
        iterateBoard((i, j) => {
            const piece = squares[i][j];
            if (piece && piece.type === 'king' && piece.color === color) {
                kingPos = { i, j };
            }
        });
        return kingPos;
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
