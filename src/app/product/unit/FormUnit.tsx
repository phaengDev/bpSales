import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, Radio, RadioGroup } from 'rsuite';
import { Notific } from '../../../utils/Notification';
import axios from 'axios';
import { CONFIG } from  '../../../utils/Config';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
interface Props {
    open: boolean;
    handleClose: () => void;
    data: any;
    fetchData: (data: any) => void;
}
const FormUnit: React.FC<Props> = ({ open, handleClose, data,fetchData })=> {
    const api = CONFIG.URLAPI;
    const shopid = getLocalStorageItem('shopid');
    const token = useToken();
    const [values, setValues] = useState<any>({
        unit_uuid: '',
        shopid: shopid,
        unitName: '',
        relationship: 2
    });
const [loading, setLoading] = useState(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
           event.preventDefault();
           setLoading(true);
           try {
            if (data) {
                const result = await axios.put(api + `/unit/${btoa(data.unit_uuid)}`, values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (result.status === 200) {
                    Notific.success(result.data.message);
                    handleClose();
                    fetchData(result.data.data);
                }
            }else{
            const result = await axios.post(api + '/unit/create', values, {
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
                shopid: shopid,
                unit_uuid: data.unit_uuid,
                unitName: data.unitName,
                relationship: data.relationship
            });
        } else {
            setValues({
                shopid: shopid,
                unit_uuid: '',
                unitName: '',
                relationship: 1
            });
        }
    }, [data])
    return (
        <Modal open={open} onClose={handleClose} size={'sm'}>
            <Modal.Header>
                <Modal.Title className='py-1'>{data ? 'ແກ້ໄຂໜ່ວຍສິນຄ້າ' : 'ເພີ່ມຫົວໜ່ວຍສິນຄ້າ'}</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
            <Modal.Body>
                <div className="form-group fs-5">
                    <label htmlFor="" className='form-label fs-bold'>ຫົວໜ່ວຍ</label>
                    <Input placeholder='ຫົວໜ່ວຍສິນຄ້າ' value={values.unitName} onChange={(e) => setValues({ ...values, unitName: e })} />
                </div>
                <div className="form-group mt-2">
                    <label className='form-label fs-bold'>ສະຖານະ</label>
                    <RadioGroup name="radio-group-inline" inline value={values.relationship} onChange={(e) => setValues({ ...values, relationship: e })} className='fs-5'>
                        <Radio value={1} color='green' className='text-green'> ສຳພັນກັບສິນຄ້າໂຕອື່ນໄດ້</Radio>
                        <Radio color="orange" value={2} className='text-orange'> ບໍ່ສາມາດສຳພັນກັບສິນຄ້າໂຕອື່ນໄດ້ </Radio>
                    </RadioGroup>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button type='submit'disabled={loading} appearance="primary">ບັນທຶກ</Button>
                <Button color='red' onClick={handleClose} appearance="primary">ປິດ</Button>
            </Modal.Footer>
            </form>
        </Modal>
    )
}

export default FormUnit