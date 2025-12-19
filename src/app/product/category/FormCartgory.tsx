'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Button, Input } from 'rsuite';
import { Notific } from '../../../utils/Notification';
import axios from 'axios';
import { CONFIG } from '../../../utils/Config';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
interface Props {
    open: boolean;
    handleClose: () => void;
    data: any;
    fetchData: (data: any) => void;
}
const Formcartgory: React.FC<Props> = ({ open, handleClose, data, fetchData }) => {
    const api = CONFIG.URLAPI;
    const shopid = getLocalStorageItem('shopid');
    const token = useToken();
    const [values, setValues] = useState({
        shopid: shopid,
        cateName: '',
        description: ''
    });
const [loading, setLoading] = useState(false);
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setLoading(true);
            if (data) {
                const res = await axios.put(api + `/category/${btoa(data.cate_uuid)}`, values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.status === 200) {
                    Notific.success(res.data.message);
                    handleClose();
                    fetchData(res.data.data);
                }
            } else {
                const res = await axios.post(api + '/category/create', values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.status === 200) {
                    Notific.success(res.data.message);
                    handleClose();
                    fetchData(res.data.data);
                }
            }
        } catch (error) {
            Notific.error('ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (data) {
            setValues({
               ...values,
                cateName: data.cateName,
                description: data.description
            });
        } else {
            setValues({
                ...values,
                cateName: '',
                description: ''
            });
        }
    }, [data])
    return (
        <Modal open={open} onClose={handleClose} >
            <Modal.Header>
                <Modal.Title className='py-1'>ເພີ່ມຫົວໜ່ວຍສິນຄ້າ</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="form-group mb-2">
                        <label htmlFor="" className='form-label fs-bold'>ຊື່ປະເພດສິນຄ້າ</label>
                        <Input placeholder="ຊື່ປະເພດສິນຄ້າ" value={values.cateName} onChange={(e) => setValues({ ...values, cateName: e })} required />
                    </div>
                    <div className="form-group mb-2">
                        <label htmlFor="" className='form-label fs-bold'>ໝາຍເຫດ</label>
                        <Input as={'textarea'} placeholder="ໝາຍເຫດ" value={values.description} onChange={(e) => setValues({ ...values, description: e })} />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button type='submit' disabled={loading} appearance="primary">ບັນທຶກ</Button>
                    <Button color='red' onClick={handleClose} appearance="primary">ປິດ</Button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}

export default Formcartgory