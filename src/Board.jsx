import React, { useState } from 'react';
import Square from './Square';

const Board = () => {
    const initialBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    const piecesOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

    for(let i=0; i<8; i++){
        // Set pawns
        initialBoard[1][i] = { type: 'pawn', color: 'dark' };
        initialBoard[6][i] = { type: 'pawn', color: 'light' };
    
        // Set other pieces
        initialBoard[0][i] = { type: piecesOrder[i], color: 'dark' };
        initialBoard[7][i] = { type: piecesOrder[i], color: 'light' };
    }

    const [squares, setSquares] = useState(initialBoard);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [turn, setTurn] = useState('white');

    return (
        <div className="board">
            {squares.map((row, i) => (
                <div className="row" key={i}>
                    {row.map((square, j) => (
                        <Square
                            piece={square}
                            key={j}
                            dark={(i + j) % 2 === 1}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Board;
