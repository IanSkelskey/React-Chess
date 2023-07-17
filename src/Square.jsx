import React from 'react';
import Piece from './Piece';

const Square = ({ piece, dark, selected, onClick }) => {
    return (
        <div className={`square ${dark ? 'dark' : ''} ${selected ? 'selected' : ''}`} onClick={onClick}>
            {piece && <Piece type={piece.type} color={piece.color} />}
        </div>
    );
};

export default Square;
