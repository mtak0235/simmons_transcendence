import { Modal } from 'antd';
import React from 'react';

type myModalProps = {
    isModalVisible: boolean,
    setIsModalVisible: any
}

const MyModal = (props: myModalProps) => {
    const { isModalVisible, setIsModalVisible } = props;

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <Modal title="Basic Modal" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal>
        </>
    );
};

export default MyModal;