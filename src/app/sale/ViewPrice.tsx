'use client'
import React, { useState } from 'react';
import numeral from 'numeral';
import { Modal } from 'react-bootstrap';
import { Grid, Row, Col, Stat, Loader } from 'rsuite';
import { CONFIG } from '@/utils/Config';
import { Notific } from '@/utils/Notification';
import axios from 'axios';
import { useToken } from '@/hooks/useToken';
interface Props {
    open: boolean;
    onClose: () => void;
    data: any,
    resPonse: (data: any) => void
}
const ViewPrice: React.FC<Props> = ({ open, onClose, data, resPonse }) => {
    const token = useToken();
    const api = CONFIG.URLAPI;
    const [loading, setLoading] = useState(false);
    const handleUpdate = async (price: number) => {
        setLoading(true);
        try {
            const res = await axios.put(api + '/order/price/' + data.cart_uuid, { salePrices: price }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (res.status === 200) {
                Notific.success(res.data.message);
                resPonse(res.data.data);
                onClose();
            }
        } catch (error) {
            Notific.error('ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ');
        } finally {
            setLoading(false);
        }
    }
    return (
        <Modal show={open} onHide={onClose} >
            <Modal.Header className='py-2 border-0' closeButton>
                <Modal.Title>{data?.product?.productName} ({data?.product?.sku})</Modal.Title>
            </Modal.Header>
            <Modal.Body className='p-2'>
                <Grid fluid>
                    <Row>
                        <Col span={{ xs: 24 }} className='mb-2'>
                            <Stat bordered icon={<i className="fa-solid fa-kip-sign fs-1" />} onClick={() => handleUpdate(data?.product?.sellPrices)} role='button' className='border-red py-2'>
                                <Stat.Value>{numeral(data?.product?.sellPrices).format('0,0')}</Stat.Value>
                                <Stat.Label className='fs-5'>ລາຂາຂາຍຫຼັກ</Stat.Label>
                            </Stat>
                        </Col>
                        {data?.product?.price.map((item: any, index: number) => (
                            <Col key={index} span={{ xs: 12, md: 12 }} className='mb-2'>
                                <Stat bordered icon={<i className="fa-solid fa-kip-sign fs-1" />} role='button' onClick={() => handleUpdate(item.prices)} className='border-green py-2'>
                                    <Stat.Value>{numeral(item.prices).format('0,0')}</Stat.Value>
                                    <Stat.Label className='fs-5'>{item.typeName}</Stat.Label>
                                </Stat>
                            </Col>
                        ))}
                    </Row>
                </Grid>
                {loading &&
                    <Loader center size='lg' content="ກຳລັງອັບເດດ..." backdrop vertical />
                }
            </Modal.Body>
        </Modal>
    )
}

export default ViewPrice