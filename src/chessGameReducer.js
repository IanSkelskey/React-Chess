import { BOARD_INITIAL_STATE } from './constants';

export default function chessGameReducer(state, action) {
    switch (action.type) {
        case 'RESET':
            return {
                ...state,
                moves: [],
                squares: BOARD_INITIAL_STATE,
                selectedPiece: null,
                turn: 'light',
                possibleMoves: [],
            };
        case 'SET_SQUARES':
            return { ...state, squares: action.payload };
        case 'SET_SELECTED_PIECE':
            return { ...state, selectedPiece: action.payload };
        case 'SET_POSSIBLE_MOVES':
            return { ...state, possibleMoves: action.payload };
        case 'SET_MOVES':
            return { ...state, moves: action.payload };
        case 'TOGGLE_TURN':
            return { ...state, turn: state.turn === 'light' ? 'dark' : 'light' };
        default:
            throw new Error('Invalid action type');
    }
}