import styled from "styled-components"
import {Row, Radio, Button} from "antd";
import "./Main.css"
import MainLayoutComponent from "../components/layouts/Main";
import {useState} from "react";
import RoomList from "./RoomList";
import MyModal from "./MyModal";

const TSRow = styled(Row)`
  justify-content: center;
`;

const Main: React.FC = () => {
    let [lst, setLst] = useState(false);
    let [ isModalVisible, setIsModalVisible ] = useState(false);
    let arr = [{
                    text: "asdf",
                    id: 3,
                }, {
                    text: "asdf",
                    id: 4
                }, {
                    text: "asdfasdfasfd",
                    id: 5
                }, {
                    text: "asdfasdfasfd",
                    id: 6
                }, {
                    text: "asdfasdfasfd",
                    id: 7
                }, {
                    text: "asdfasdfasfd",
                    id: 8
                }]

    const toggleLst = () => {
        setLst(!lst);
    }
    const handleRoomDoubleClick = (e:any, id:number) => {
        switch (e.detail) {
            case 2:
                console.log("doubleClick " + id)
                return <></>
        }
    }

    const handleModalClick = () => {
        setIsModalVisible(true);
    };

    return <>
        <MainLayoutComponent>
            <TSRow>
                <Radio.Group size="large">
                    <Radio.Button value="large" disabled={!lst} onClick={() => {
                        toggleLst();
                        console.log(lst)
                    }}>
                        전체목록
                    </Radio.Button>
                    <Radio.Button value="small" disabled={lst} onClick={() => {
                        toggleLst();
                        console.log(lst)
                    }}>
                        친구목록
                    </Radio.Button>
                </Radio.Group>
            </TSRow>
        </MainLayoutComponent>
        <div>
            대기실
            <Button onClick={handleModalClick}>방만들기</Button>
            <MyModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}/>
        </div>
        <div className="roomtmp">
            <RoomList  rooms={arr}
                       onClick={handleRoomDoubleClick}
            />
        </div>
    </>;
};

export default Main;
