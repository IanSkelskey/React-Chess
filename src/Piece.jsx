import React from 'react';
import { PIECE_SPRITE_MAP } from './constants';

const Piece = ({ type, color }) => {
    const spritePosition = PIECE_SPRITE_MAP[type][color];

    return (
        <div className='piece' style={{ backgroundPosition: spritePosition, backgroundSize: '48px 64px' }}/>
    );
};

export default Piece;
