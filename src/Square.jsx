import React from 'react';
import Piece from './Piece';

const Square = ({ piece, dark, selected, possibleMove, onClick }) => {
    return (
        <div className={`square ${dark ? 'dark' : ''} ${selected ? 'selected' : ''} ${possibleMove ? 'possible-move' : ''}`} onClick={onClick}>
            {piece && <Piece type={piece.type} color={piece.color} />}
        </div>
    );
};

export default Square;
