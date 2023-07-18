export const PIECE_ORDER = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

export const PIECE_SPRITE_MAP = {
    'pawn': { 'light': '0px 0px', 'dark': '0px -32px' },
    'bishop': { 'light': '-16px 0px', 'dark': '-16px -32px' },
    'king': { 'light': '-32px 0px', 'dark': '-32px -32px' },
    'rook': { 'light': '0px -16px', 'dark': '0px -48px' },
    'knight': { 'light': '-16px -16px', 'dark': '-16px -48px' },
    'queen': { 'light': '-32px -16px', 'dark': '-32px -48px' },
};

export const BOARD_INITIAL_STATE = () => {
    const initialBoard = Array(8).fill(null).map(() => Array(8).fill(null));

    for (let i = 0; i < 8; i++) {
        // Set pawns with the 'firstMove' property set to true
        initialBoard[1][i] = { type: 'pawn', color: 'dark', firstMove: true };
        initialBoard[6][i] = { type: 'pawn', color: 'light', firstMove: true };

        // Set other pieces
        PIECE_ORDER.forEach((type, i) => {
            initialBoard[0][i] = { type, color: 'dark', firstMove: type === 'king' || type === 'rook' };
            initialBoard[7][i] = { type, color: 'light', firstMove: type === 'king' || type === 'rook' };
        });
    }

    return initialBoard;
}