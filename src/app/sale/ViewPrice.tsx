import numeral from 'numeral';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { Grid, Row, Col, Stat, Center } from 'rsuite';
interface Props {
    open: boolean;
    onClose: () => void;
    data: any
}
const ViewPrice: React.FC<Props> = ({ open, onClose, data }) => {

    return (
        <Modal show={open} onHide={onClose}>
            <Modal.Body className='p-1 mt-4'>
                <Grid fluid>
                    <Row>
                        <Col span={{ xs: 24}} className='mb-2'>
                                <Stat bordered icon={<i className="fa-solid fa-kip-sign fs-1" />} className='border-red py-2'>
                                    <Stat.Value>21,000</Stat.Value>
                                    <Stat.Label className='fs-5'>ລາຂາຂາຍຫຼັກ</Stat.Label>
                                </Stat>
                            </Col>
                        {data.map((item: any, index: number) => (
                            <Col span={{ xs: 12, md: 12 }} className='mb-2'>
                                <Stat bordered icon={<i className="fa-solid fa-kip-sign fs-1" />}  className='border-green py-2'>
                                    <Stat.Value>{numeral(item.prices).format('0,0')}</Stat.Value>
                                    <Stat.Label className='fs-5'>{item.typeName}</Stat.Label>
                                </Stat>
                            </Col>
                        ))}
                    </Row>
                </Grid>
            </Modal.Body>
        </Modal>
    )
}

export default ViewPrice