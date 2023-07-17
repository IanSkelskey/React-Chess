import React, { useState } from 'react';
import Square from './Square';

const Board = () => {
    const piecesOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

    // Setup initialBoard inside useState
    const [squares, setSquares] = useState(() => {
        const initialBoard = Array(8).fill(null).map(() => Array(8).fill(null));
        for (let i = 0; i < 8; i++) {
            // Set pawns
            initialBoard[1][i] = { type: 'pawn', color: 'dark' };
            initialBoard[6][i] = { type: 'pawn', color: 'light' };

            // Set other pieces
            initialBoard[0][i] = { type: piecesOrder[i], color: 'dark' };
            initialBoard[7][i] = { type: piecesOrder[i], color: 'light' };
        }
        return initialBoard;
    });

    const [selectedPiece, setSelectedPiece] = useState(null);
    const [turn, setTurn] = useState('light');

    const handleSquareClick = (i, j) => {
        console.log(`Clicked on square (${i}, ${j})`);
        if (selectedPiece) {
            // if a piece is selected and the target square is valid, move the piece
            const newSquares = [...squares];
            newSquares[selectedPiece.i][selectedPiece.j] = null;
            newSquares[i][j] = selectedPiece.piece;
            setSquares(newSquares);
            setSelectedPiece(null);  // clear the selection
            setTurn(prev => prev === 'light' ? 'dark' : 'light');  // switch turns
        } else if (squares[i][j] && squares[i][j].color === turn) {
            // select the piece
            setSelectedPiece({ piece: squares[i][j], i, j });
        }
    };

    return (
        <div className="board">
            {squares.map((row, i) => (
                <div className="row" key={i}>
                    {row.map((square, j) => (
                        <Square
                            piece={square}
                            key={j}
                            dark={(i + j) % 2 === 1}
                            selected={selectedPiece && selectedPiece.i === i && selectedPiece.j === j}
                            onClick={() => handleSquareClick(i, j)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Board;
