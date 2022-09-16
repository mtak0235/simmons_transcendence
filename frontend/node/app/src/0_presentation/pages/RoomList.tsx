import React from "react";
import Room, {room} from "./Room";

type roomList = {
    rooms: room[],
    onClick:any
}

const RoomList = (props: roomList) => {
    const {rooms, onClick} = props;
    const roomView = rooms.map(
        ({id, text}) => {
            return (<Room
                id={id}
                text={text}
                onClick={onClick}
                key={id}
            />)
        }
    );

    return (
        <div className="rooms">
            {roomView}
        </div>
    );
}

export default RoomList;
