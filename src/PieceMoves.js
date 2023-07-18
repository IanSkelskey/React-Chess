const iterateBoard = (callback) => {
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            callback(x, y);
        }
    }
}

export const generatePossibleMoves = ({ piece, i, j }, squares) => {
    let moves = [];

    iterateBoard((x, y) => {
        if (isValidMove(piece, { i, j }, { i: x, j: y }, squares)) {
            moves.push({ i: x, j: y });
        }
    });

    return moves;
};

const canPawnAttack = ({ piece, start, end }) => {
    const dx = end.i - start.i;
    const dy = end.j - start.j;

    if (piece.color === 'light') {
        return dx === -1 && Math.abs(dy) === 1;
    } else {
        return dx === 1 && Math.abs(dy) === 1;
    }
}

const isSquareUnderAttack = (square, squares, attackingColor) => {
    let underAttack = false;

    iterateBoard((x, y) => {
        const piece = squares[x][y];
        if (piece && piece.color === attackingColor) {
            if (piece.type === 'pawn') {
                if (canPawnAttack({ piece, start: { i: x, j: y }, end: square })) {
                    underAttack = true;
                }
            } else if (isValidMove(piece, { i: x, j: y }, square, squares)) {
                underAttack = true;
            }
        }
    });

    return underAttack;
};


export const isValidMove = (piece, start, end, squares) => {
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

    const moveParams = { piece, start, end, squares, dx, dy };

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
};

const isPawnMoveValid = ({ piece, end, squares, dx, dy }) => {
    // Pawns can move straight ahead one or two squares on their first move, one square afterwards
    // They can only capture an enemy piece diagonally
    if (piece.color === 'light') {
        if (dy === 0) {
            return (dx === -1 || (dx === -2 && piece.firstMove)) && !squares[end.i][end.j];
        } else {
            return dx === -1 && Math.abs(dy) === 1 && squares[end.i][end.j] && squares[end.i][end.j].color !== piece.color;
        }
    } else {
        if (dy === 0) {
            return (dx === 1 || (dx === 2 && piece.firstMove)) && !squares[end.i][end.j];
        } else {
            return dx === 1 && Math.abs(dy) === 1 && squares[end.i][end.j] && squares[end.i][end.j].color !== piece.color;
        }
    }
}

const isRookMoveValid = ({ start, end, squares, dx, dy }) => {
    // Rooks can move any number of squares along a rank or file, but not through other pieces
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

const isBishopMoveValid = ({ start, end, squares, dx, dy }) => {
    // Bishops can move any number of squares diagonally, but not through other pieces
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

const isQueenMoveValid = ({ start, end, squares, dx, dy }) => {
    // Queens can move any number of squares along a rank, file, or diagonal, but not through other pieces
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

const isKingMoveValid = ({ piece, end, squares, dx, dy }) => {
    // Kings can move one square in any direction, but not into check
    return Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && !isSquareUnderAttack(end, squares, piece.color === 'light' ? 'dark' : 'light');
}

const isKnightMoveValid = ({ dx, dy }) => {
    // Knights can move in an L shape in any direction, but not through other pieces
    return Math.abs(dx) * Math.abs(dy) === 2;
}