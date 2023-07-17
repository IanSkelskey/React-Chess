import React, { useEffect } from 'react';
import Piece from './Piece';

const Square = ({ piece, dark }) => {

    // Use useEffect to log the piece when it changes
    useEffect(() => {
        console.log(piece);
    }, [piece]);

    return (
        <div className={`square ${dark ? 'dark' : ''}`}>
            {piece && <Piece type={piece.type} color={piece.color} />}
        </div>
    );
};

export default Square;
