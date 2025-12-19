'use client'
import React, { useState, useEffect } from 'react';
import "../../styles/style.css";
import { Modal, Button, Message, Textarea, Loader } from 'rsuite';
import moment from 'moment';
import numeral from 'numeral';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import { CONFIG } from '@/utils/Config';
import axios from 'axios';
import { Notific } from '@/utils/Notification';
interface Props {
    open: boolean;
    onClose: () => void;
    data: any;
    resPonse: (data: any) => void
}
const FromCancel: React.FC<Props> = ({ open, onClose, data, resPonse }) => {
    const api = CONFIG.URLAPI;
    const token = useToken();
    const userid = getLocalStorageItem('user_uuid');
    const [values, setValues] = useState<any>({
        createby: userid,
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const handleSave = async () => {
        Notific.confirm('ທ່ານຕ້ອງການຍົກເລີກຂໍ້ມູນນີ້ແທ້ບໍ່?', async () => {
            try {
                setLoading(true);
                const res = await axios.put(api + `/billsale/cancel/${btoa(data.bill_uuid)}`, values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                if (res.status === 200) {
                    Notific.success(res.data.message);
                    onClose();
                    resPonse(res.data.data);
                }
            } catch (error) {
                console.error('ບໍ່ສາມາດສົ່ງຂໍ້ມູນນີ້ໄດ້', error);
                Notific.error('ບໍ່ສາມາດຍົກເລີກຂໍ້ມູນນີ້ໄດ້');
            } finally {
                setLoading(false);
            }
        });
    }
    useEffect(() => {
        if (userid) {
            setValues({
                createby: userid,
                description: ''
            });
        }
    }, [data, userid]);

    return (
        <Modal open={open} onClose={onClose}>
            <Modal.Body className='body  p-0'>
                <main className="container mb-3" id="print-page-1">
                    <div className="receipt-top">
                        <div className="company-logo">
                            <img src="/assets/img/logo/PLC.png" className="img-fluid w-25" alt="Company Logo" />
                        </div>
                        <div className="company-name">{data?.shop?.shopName}</div>
                        <div className="company-address mt-n2">{data?.shop?.village}, {data?.shop?.district?.distName},  {data?.shop?.district?.province?.provinceName}</div>
                        <div className="company-mobile">ໂທລະສັບ: {data?.shop?.phone}</div>
                    </div>
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
                    <div className="mb-0 text-start">
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
                </main>
            </Modal.Body>
            <Modal.Footer>
                <Button appearance="primary" color="red" onClick={onClose}> ອອກ </Button>
                {data?.status === 1 && data?.statusoff === 1 && (
                    <Button appearance="primary" disabled={loading} onClick={handleSave}>{loading ? <Loader content='ກຳລັງກວດ...' /> : 'ຢືນຢັນຍົກເລີກ'} </Button>
                )}

            </Modal.Footer>
        </Modal>
    )
}

export default FromCancel