import React from 'react';
import { Button } from 'react-bootstrap';
import { Modal } from 'rsuite';
interface Props {
    open: boolean;
    handleClose: () => void;
    data: any;
    fetchPrice: (data: any) => void
}
const FromPrice: React.FC<Props> = ({ open, handleClose, data, fetchPrice}) =>{
  return (
    <Modal open={open} onClose={handleClose}>
        <Modal.Header>
            <Modal.Title>ບັນທຶກຂໍ້ມູນປະເພດສິນຄ້າ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Close
            </Button>
            <Button variant="primary" onClick={() => fetchPrice(data)}>Save Changes</Button>
        </Modal.Footer>
    </Modal>
  )
}

export default FromPrice