'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, NumberInput } from 'rsuite'
import { Notific } from '@/utils/Notification';
import { putApi } from '@/utils/Configs';
import { useToken } from '@/hooks/useToken';
interface Props {
    open: boolean,
    handleClose: () => void,
    data: any,
    resPonse: (data: any) => void
}
const FormEdit: React.FC<Props> = ({ open, handleClose, data, resPonse }) => {
    const token = useToken();
    function toThousands(value: number | string | null | undefined) {
        if (!value) return '0 ₭';
        return `${value}`.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,') + ' ₭';
    }

    const [inputs, setInputs] = useState<any>({
        price_uuid: data.price_uuid,
        typeName: data.typeName,
        prices: data.prices
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const res = await putApi('/wholesale/update', inputs, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (res.status === 200) {
                Notific.success(res.data.message);
                handleClose();
                resPonse(res.data.data);
            }
        } catch (error) {
            Notific.error('ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ');
        }
    }



    useEffect(() => {
        if (data) {
            setInputs({
                price_uuid: data.price_uuid,
                typeName: data.typeName,
                prices: data.prices
            })
        }
    }, [data])
    return (
        <Modal size={'sm'} open={open} onClose={handleClose}>
            <Modal.Header>
                <Modal.Title className='py-1'>ຟອມແກ້ໄຂລາຄາ</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="form-group">
                        <label htmlFor="" className='form-label'>ຊື່ປະເພດລາຄາ</label>
                        <Input value={inputs.typeName} onChange={(e) => setInputs({ ...inputs, typeName: e })} placeholder="ຊື່ລາຄາ" required />
                    </div>
                    <div className="form-greou">
                        <label htmlFor="" className='form-label'>ລາຄາ</label>
                        <NumberInput value={inputs.prices} onChange={(value) => setInputs({ ...inputs, prices: value })} formatter={toThousands} placeholder="00,000" required />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button type='submit' appearance="primary"> ບັນທຶກ </Button>
                    <Button onClick={handleClose} color='red' appearance="primary">  ຍົກເລີກ </Button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}

export default FormEdit