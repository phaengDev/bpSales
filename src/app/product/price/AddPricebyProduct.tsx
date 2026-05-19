import React, { useState, useEffect } from 'react';
import { Modal, Button, NumberInput, Input } from 'rsuite';
import { Notific } from '@/utils/Notification';
import { postApi, putApi } from '@/utils/Configs';
import { useToken } from '@/hooks/useToken';
import numeral from 'numeral';
import {toThousands} from '@/utils/formate';
interface Props {
    open: boolean
    handleClose: () => void
    data: any
    resPonse: (data: any) => void;
    dataMain: any
}
const AddPricebyProduct: React.FC<Props> = ({ open, handleClose, data, resPonse, dataMain }) => {
    const token = useToken();
    const main = dataMain;
    const [inputs, setInputs] = useState<any>({
        productid: main.product_uuid,
        typeName: '',
        prices: 0
    });
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            if (data) {
                const res = await putApi(`/price/${btoa(data.price_uuid)}`, inputs, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.status === 200) {
                    Notific.success(res.data.message);
                    handleClose();
                    resPonse(res.data.data);
                }
            } else {
                const res = await postApi('/price/create/one', inputs, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (res.status === 200) {
                    Notific.success(res.data.message);
                    handleClose();
                    resPonse(res.data.data);
                }
            }
        } catch (error) {
            Notific.error('ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (data) {
            setInputs({
                productid: data.productid,
                typeName: data.typeName,
                prices: data.prices
            })
        }
    }, [data])
    return (
        <Modal open={open} onClose={handleClose}>
            <Modal.Header>
                <Modal.Title className='py-1'>
                    ບັນທຶກລາຄາ
                    <div className='fs-5 mt-2'>ຊື່ສິນຄ້າ: {main.productName}</div>
                    <div className='fs-5 mt-2'>ລາຄ່າ: {numeral(main.sellPrices).format('0,0')} ₭</div>
                </Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="form-group mb-2">
                        <label htmlFor="" className='form-label'>ຊື່ສິນຄ້າລາຄາ</label>
                        <Input value={inputs.typeName} onChange={(e) => setInputs({ ...inputs, typeName: e })} placeholder="ຊື່ສິນຄ້າລາຄາ" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="" className='form-label'>ລາຄ່າ</label>
                        <NumberInput value={inputs.prices} onChange={(e) => setInputs({ ...inputs, prices: e })} placeholder="00,00" formatter={toThousands} required />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button appearance="primary" color='red' onClick={handleClose}> ຍົກເລີກ </Button>
                    <Button type='submit' disabled={loading} appearance="primary" >{loading ? 'ກຳລງບັນທຶກ' : 'ບັນທຶກ'}</Button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}

export default AddPricebyProduct