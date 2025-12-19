import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, Image, InputGroup, Notification, Loader } from 'rsuite'
import { CONFIG } from '@/utils/Config';
import SearchIcon from '@rsuite/icons/Search';
import axios from 'axios';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
interface Props {
    open: boolean,
    handleClose: () => void,
    resPonse: (data: any) => void
}
const FormSearch: React.FC<Props> = ({ open, handleClose, resPonse }) =>{
    const api = CONFIG.URLAPI;
    const shopId = getLocalStorageItem('shopid');
    const token = useToken();

    const [search, setSearch] = useState<any>({
        buillNumber: '',
        shopid: shopId
    });
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const fetchDatas = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(!token || !shopId) return
        setLoading(true);
        try {
            const response = await axios.post(api + `/purchase/search`, search,{
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const jsonData = await response.data;
            if (response.status === 200) {
                resPonse(jsonData.data);
                handleClose();
                setError(false);
            } else {
                setError(true);
            }
        } catch (error) {
            setError(true);
            console.log(error);
        } finally {
            setLoading(false);
        }
    }
    return (
        <Modal open={open} onClose={handleClose}>
            <Modal.Header />
            <Modal.Body className='text-center'>
                <Image
                    src="../assets/img/icon/search-order.png"
                    alt=""
                    width={160} />
                <h4 className='p-2'>ຄົນຫາເລກທີ່ສັ່ງຊື້</h4>
                <form onSubmit={fetchDatas} className='mb-4'>
                    <InputGroup  className='py-0-5 border-blue rounded-pill'>
                        <Input placeholder='ຄົນຫາເລກທີ່ສັ່ງຊື້'
                            value={search.buillNumber}
                            onChange={(value) => setSearch({ ...search, buillNumber: value })} autoFocus className='rounded-pill px-3' required />
                        <InputGroup.Button type='submit' size='lg' color='red' appearance='primary' disabled={loading} className='rounded-pill me-1'> {loading ? <Loader /> : <> <SearchIcon className='fs-2' /> ຄົນຫາ </>}</InputGroup.Button>
                    </InputGroup>
                </form>
                {error &&
                    <Notification type="error" className='text-start text-red' header="ແຈ້ງເຕືອນ" closable >
                        ເລກທີ່ສັ່ງຊື້ທີ່ທ່ານຊອກຫາບໍ່ຖຶກຕ້ອງກະລຸນາກວດຄືນແລ້ວລອງໃຫມ່ອິກຄັ້ງ
                    </Notification>
                }
            </Modal.Body>
        </Modal>
    )
}

export default FormSearch