function iterateBoard(callback) {
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            callback(x, y);
        }
    }
}

function isValidMove(squares, moves, piece, start, end) {
    if (!start || !end || start.i === undefined || start.j === undefined || end.i === undefined || end.j === undefined) {
        console.error('Invalid start or end position in isValidMove', { start, end });
        return false;
    }

    const dx = end.i - start.i;
    const dy = end.j - start.j;

    if (dx === 0 && dy === 0) return;

    if (squares[end.i][end.j] && squares[end.i][end.j].color === piece.color) return false;


    // TODO: Check if the move leaves the active player in check


    const moveParams = { squares, moves, piece, start, end, dx, dy };

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

function isPawnMoveValid({ squares, moves, piece, start, end, dx, dy }) {
    const direction = piece.color === 'light' ? -1 : 1;
    const lastMove = moves[moves.length - 1];

    // Check for basic pawn moves
    if (dy === 0) {
        // Check for 1 square move
        if (dx === direction) {
            return !squares[end.i][end.j];
        }

        // Check for 2 square move
        if (dx === 2 * direction && piece.firstMove) {
            // Make sure the square in between is empty
            if (squares[start.i + direction][start.j]) {
                return false;
            }
            return !squares[end.i][end.j];
        }
    }
    if (dx !== direction || Math.abs(dy) !== 1) return false;

    // Check for en passant
    if (squares[end.i][end.j] === null && lastMove && lastMove.piece) return lastMove && lastMove.piece.type === 'pawn' && lastMove.movedTwoSquares
        && lastMove.end.i === end.i - direction && lastMove.end.j === end.j;
    // Check for normal captures
    return squares[end.i][end.j] && squares[end.i][end.j].color !== piece.color;
}

function isRookMoveValid({ squares, start, end }) {
    const dx = end.i - start.i;
    const dy = end.j - start.j;

    if (dx * dy !== 0) return false;

    const direction = dx !== 0 ? Math.sign(dx) : Math.sign(dy);
    const range = dx !== 0 ? dx : dy;

    const xOrY = dx !== 0 ? 'i' : 'j';

    for (let step = direction; Math.abs(step) < Math.abs(range); step += direction) {
        if (squares[start.i + (xOrY === 'i' ? step : 0)][start.j + (xOrY === 'j' ? step : 0)]) {
            return false;
        }
    }

    return true;
}

function isBishopMoveValid({ squares, start, end, dx, dy }) {
    if (Math.abs(dx) !== Math.abs(dy)) return false;

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
    return true;
}

function isQueenMoveValid({ squares, start, end, dx, dy }) {
    if (!(dx * dy === 0 || Math.abs(dx) === Math.abs(dy))) return false;

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
    return true;
}


function isKingMoveValid({ squares, moves, piece, start, end, dx, dy }) {
    const castlingMove = Math.abs(dy) === 2 && dx === 0;
    if (castlingMove) {
        // If the king has already moved, castling is not available
        if (!piece.firstMove) return false;
        // If the king is in check, castling is not available
        if (isSquareUnderAttack(squares, moves, start, piece.color === 'light' ? 'dark' : 'light')) return false;

        const rookPos = dx > 0 ? { i: start.i, j: 7 } : { i: start.i, j: 0 };
        const rook = squares[rookPos.i][rookPos.j];

        // If the rook has already moved, castling is not available
        if (!rook || rook.type !== 'rook' || !rook.firstMove) return false;

        // If there are pieces between the king and the rook, castling is not available
        const minJ = Math.min(start.j, rookPos.j);
        const maxJ = Math.max(start.j, rookPos.j);
        for (let j = minJ + 1; j < maxJ; j++) {
            if (squares[start.i][j]) return false;
        }

        // If the spaces between the king and the rook are under attack, castling is not available
        for (let j = minJ; j <= maxJ; j++) {
            if (isSquareUnderAttack(squares, moves, { i: start.i, j }, piece.color === 'light' ? 'dark' : 'light')) return false;
        }

        return true;
    }

    return Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && !isSquareUnderAttack(squares, moves, end, piece.color === 'light' ? 'dark' : 'light');
}


function isKnightMoveValid({ dx, dy }) {
    return Math.abs(dx) * Math.abs(dy) === 2;
}

function canPawnAttack({ piece, start, end }) {
    const dx = end.i - start.i;
    const dy = end.j - start.j;

    const direction = piece.color === 'light' ? -1 : 1;

    return Math.abs(dx) === 1 && dy === direction;
}

function isSquareUnderAttack(squares, moves, square, attackingColor) {
    let underAttack = false;

    iterateBoard((x, y) => {
        const piece = squares[x][y];
        if (piece && piece.color === attackingColor) {
            if (piece.type === 'pawn') {
                if (canPawnAttack({ piece, start: { i: x, j: y }, end: square })) {
                    underAttack = true;
                }
            } else if (isValidMove(squares, moves, piece, { i: x, j: y }, square)) {
                underAttack = true;
            }
        }
    });

    return underAttack;
}

export { isValidMove }