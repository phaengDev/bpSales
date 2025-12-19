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
const FormSize: React.FC<Props> = ({ open, handleClose, data, fetchData }) => {
    const api = CONFIG.URLAPI;
    const shopid = getLocalStorageItem('shopid');
    const token = useToken();
    const [values, setValues] = useState<any>({
        shopid: shopid,
        sizeName: null,
    });
    const [loading, setLoading] = useState(false);
    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (data) {
                const result = await axios.put(api + `/size/${btoa(data.size_uuid)}`, values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (result.status === 200) {
                    Notific.success(result.data.message);
                    handleClose();
                    fetchData(result.data.data);
                }
            } else {
                const result = await axios.post(api + '/size/create', values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (result.status === 200) {
                    Notific.success(result.data.message);
                    handleClose();
                    fetchData(result.data.data);
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
                shopid: data.shopid,
                sizeName: data.sizeName,
            });
        } else {
            setValues({
                shopid: shopid,
                sizeName: null,
            });
        }
    }, [data])
    return (
        <Modal open={open} onClose={handleClose} size={'sm'}>
            <Modal.Header>
                <Modal.Title className='py-1'>ເພີ່ມຂະໜາດສິນຄ້າ</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSave}>
            <Modal.Body>
                <div className="form-group fs-5">
                    <label htmlFor="sizeName" className='form-label fs-bold'>ຂະໜາດ</label>
                    <Input placeholder='ຂະໜາດສິນຄ້າ' value={values.sizeName} onChange={(e) => setValues({ ...values, sizeName: e })} required />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button type='submit' disabled={loading}  appearance="primary">ບັນທຶກ</Button>
                <Button color='red' onClick={handleClose} appearance="primary">ປິດ</Button>
            </Modal.Footer>
            </form>
        </Modal>
    )
}

export default FormSize