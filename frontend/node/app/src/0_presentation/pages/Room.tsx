import React from 'react';
import "./Room.css"
export type room = {
    text?: string,
    id?: any,
    onClick?:any,
}

const Room = (props: room) => {
    const { text , id, onClick} = props;
    return (
        <div className="room" >
                <div onClick={(e) => onClick(e,id)}>{text}</div>
        </div>
    );
}

export default Room;
