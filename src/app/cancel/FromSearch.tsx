'use client'
import React, { useState } from 'react';
import {  IconButton, Image, InputGroup, Input, Loader, Message, Textarea, Button } from 'rsuite';
import { Modal } from 'react-bootstrap';
import CloseIcon from '@rsuite/icons/Close';
import { postApi } from '@/utils/Configs';
import numeral from 'numeral';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import { Notific } from '@/utils/Notification';
import moment from 'moment';
interface Props {
    open: boolean;
    onClose: () => void;
}
const FromSearch: React.FC<Props> = ({ open, onClose }) => {
    const token = useToken();
    const userid = getLocalStorageItem('user_uuid');

    const [data, setData] = useState<any>('');
    const [search, setSearch] = useState({
        billSale: '',
        description: ''
    });
    const [loadsearch, setLoadSearch] = useState(false);
    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadSearch(true);
        try {
            const res = await postApi(`/billsale/search`, search, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const dataJson = res.data.data;
            if (res.status === 200) {
                setData(dataJson);
            }
        } catch (error) {
            setData('');
            Notific.warning(`ບໍ່ພົບຂໍ້ມູນໃນເລກບິນ ${search.billSale} ນີ້`);
            console.log(error);
        } finally {
            setLoadSearch(false);
        }
    }
const [values, setValues] = useState({
   createby: userid,
        description: ''
})

    return (
        <Modal show={open} onHide={onClose} size='lg' >
            <Modal.Body className="py-1" >
                <div className="text-center py-4 ">
                    <Image width={150} bordered circle src="../assets/img/icon/bill-checkout.png" className='p-1 border-red' />
                </div>
                <div className="form-group mb-3">
                    <form onSubmit={handleSearch} className='text-center'>
                        <label htmlFor="" className='form-label fs-3'>ຄົນຫາເລກບິນທີ່ຕ້ອງການຍົກເລີກ</label>
                        <InputGroup size="lg" className='rounded-pill border-red p-0-5'>
                            <Input placeholder={'ຄົນຫາເລກບິນ'} value={search.billSale} onChange={(value) =>
                                setSearch({
                                    ...search,
                                    billSale: value.replace(/\s+/g, "")  // ตัดช่องว่างทั้งหมด
                                })
                            } className='px-3' required />
                            <InputGroup.Button type='submit' appearance='primary' color='red' className='rounded-pill px-4'>{loadsearch ? <Loader /> : <><i className="fa-solid fa-search me-1" /> ຄົນຫາ</>} </InputGroup.Button>
                        </InputGroup>
                    </form>
                </div>
                <main className="container card  mb-3" id="print-page-1">
                    <div className='text-end me-n2-05 pb-2'><IconButton color="red" icon={<CloseIcon size={'2rm'} />} appearance="ghost" size="xs" /></div>
                    <div className='card-body p-0 py-3'>
                    <ul className="text-list text-style1 mb-20">
                        <li>
                            <div className="text-list-title">Date:</div>
                            <div className="text-list-desc">{moment(data?.createdAt).format('DD/MM/YYYY')}</div>
                        </li>
                        <li className="text-right">
                            <div className="text-list-title">Time:</div>
                            <div className="text-list-desc">{moment(data?.createdAt).format('HH:mm:ss')}</div>
                        </li>
                        <li>
                            <div className="text-list-title">ພະນັກງານຂາຍ:</div>
                            <div className="text-list-desc">{data?.user?.userName}</div>
                        </li>
                        <li className="text-right">
                            <div className="text-list-title">No.:</div>
                            <div className="text-list-desc ">{data?.billno}</div>
                        </li>
                    </ul>
                    <table className="receipt-table mt-n1">
                        <thead>
                            <tr className='fs-6'>
                                <th>#</th>
                                <th>ລາຍາກນ</th>
                                <th className='text-end'>ລາຄາ</th>
                                <th className='text-center'>ຈຳນວນ</th>
                                <th className='text-end'>ລວມເງິນ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.billList?.map((item: any, index: number) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item?.product?.productName}</td>
                                    <td className='text-end'>{numeral(item.price_sales).format('0,0')}</td>
                                    <td className='text-center'>{item.quantity}</td>
                                    <td className='text-end'>{numeral(item.quantity * item.price_sales).format('0,0')}</td>
                                </tr>
                            ))}
                            {data?.countryid !== 1 &&
                                <tr className='fs-4'>
                                    <td colSpan={4} className='text-end'>ລວມຍອດ:</td>
                                    <td className='text-end '>{numeral(data?.balanceSale).format('0,0')} ₭</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                    <div className="text-bill-list mb-1">
                        <div className="text-bill-list-in fs-5">
                            <div className="text-bill-title">ລວມຍອດ: </div>
                            <div className="text-bill-value">{numeral(data?.balance_payable).format('0,0.00')} {data?.country?.genus}</div>
                        </div>
                        <div className="text-bill-list-in fs-5">
                            <div className="text-bill-title">ສ່ວນຫຼຸດ: </div>
                            <div className="text-bill-value">- {numeral(data?.discount).format('0,0.00')} {data?.country?.genus}</div>
                        </div>
                        {/* <div className="text-receipt-seperator"></div> */}
                        <div className="text-bill-list-in fs-5">
                            <div className="text-bill-title">ລວມຍອດທັງໝົດ: </div>
                            <div className="text-bill-value">{numeral(data?.balanceTotal).format('0,0.00')} {data?.country?.genus}</div>
                        </div>
                        <div className="text-receipt-seperator"></div>
                    </div>
                    <div className="mb-3 text-start">
                        {data?.status === 2 ? (
                            <Message showIcon type="error" header="ຂໍອະໄພ!">
                                ບິນນີ້ໄດ້ມີການຍົກເລີກບິນແລ້ວ ກະລຸນາກວດຄືນ
                                <ol>
                                    <li>ພະນັກງານ: {data?.user?.userName}</li>
                                    <li>ວັນທີຍົກເລີກ: {moment(data?.updatedAt).format('DD/MM/YYYY HH:mm')}</li>
                                </ol>
                            </Message>
                        ) : data?.statusoff === 2 ? (
                            <Message showIcon type="warning" header="ຂໍອະໄພ!">
                                ບິນນີ້ໄດ້ມີການປິດຍອດແລ້ວບໍ່ສາມາດຍົກເລີກໄດ້
                            </Message>
                        ) : (
                            <div className="form-group text-start">
                                <label htmlFor="" className='form-label'>ລາຍລະອຽດການຍົກເລີກ</label>
                                <Textarea rows={4} onChange={(e) => setValues({ ...values, description: e })} placeholder='ລາຍລະອຽດການຍົກເລີກ' />
                            </div>
                        )}
                    </div>
                    <Button appearance='primary' block>ບິນຍົກເລີກ</Button>
                    </div>
                </main>
            </Modal.Body>
        </Modal>
    )
}

export default FromSearch