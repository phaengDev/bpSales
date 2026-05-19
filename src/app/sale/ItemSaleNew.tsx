'use client'
import React, { useState, useEffect } from 'react';
import { Grid, Row, Col, Button, Placeholder,Modal } from 'rsuite';
interface Props {
    open: boolean;
    onClose: () => void;
}
const ItemSaleNew: React.FC<Props> = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose} size={'lg'}>
        <Modal.Header>
            <Modal.Title>ບັນທຶກຂໍ້ມູນປະເພດສິນຄ້າ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            </Modal.Body>
        <Modal.Footer>
            <Button appearance="primary" color="red" onClick={onClose}>
                Close
            </Button>
            <Button appearance="primary">Save Changes</Button>
        </Modal.Footer>
    </Modal>
  )
}

export default ItemSaleNew