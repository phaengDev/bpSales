'use client'
import React, { useState } from 'react';
import {Loader} from 'rsuite';
import Modal from 'react-bootstrap/Modal';
import { CONFIG } from '@/utils/Config';
import numeral from 'numeral';
import { Notific } from '@/utils/Notification';
import axios from 'axios';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
interface Props {
    open: boolean;
    handleClose: () => void;
    data: any;
    fetchOrder: (data: any) => void;
}
const FormOrder: React.FC<Props> = ({ open, handleClose, data, fetchOrder }) => {
    const api = CONFIG.URLAPI;
    const token = useToken();
    const userid=getLocalStorageItem('user_uuid');
    const images = '@/assets/img/icon/picture.jpg';
    const [selectedOption, setSelectedOption] = useState(data.product_uuid);
    const handleRadioChange = (index: any, prices: any) => {
        setSelectedOption(index);
        setValues((prevValues) => ({
            ...prevValues,
            salePrices: prices
        }))
    };

    const [values, setValues] = useState({
        productid: data.product_uuid,
        quantity: 1,
        salePrices: data.sellPrices,
        userbyid: userid,
    })

    const handleIncrease = () => {
        setValues((prevValues) => ({
            ...prevValues,
            quantity: prevValues.quantity + 1
        }));
    };

    const handleDecrease = () => {
        setValues((prevValues) => ({
            ...prevValues,
            quantity: prevValues.quantity > 1 ? prevValues.quantity - 1 : 1
        }));
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setValues((prevValues) => ({
            ...prevValues,
            quantity: isNaN(value) || value < 1 ? 1 : value
        }))
    };
const [loading, setLoading] = useState(false);
    const handleAddOrder = async () => {
        setLoading(true);
        try {
            const response = await axios.post(api + '/order/create', values,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.status === 200) {
                handleClose();
                fetchOrder(response.data.data);
                Notific.success(response.data.message || "ສຳເລັດແລ້ວ!");
            }

        } catch (error: any) {
            Notific.error(error?.response?.data?.message)
        }  finally {
            setLoading(false);
        }
    }

    return (
        <Modal size='lg' show={open} onHide={handleClose} className='modal-pos' backdrop="static">
            <Modal.Body className='p-0'>
                <div className="modal-bodyp-0">
                    <a href="#" onClick={handleClose} className="btn-close position-absolute top-0 end-0 m-4"></a>
                    <div className="modal-pos-product">
                        <div className="modal-pos-product-img">
                            <div className="img" style={{ backgroundImage: `url(${data.images === '' || data.images === null ? images : data.url})` }} />
                        </div>
                        <div className="modal-pos-product-info">
                            <div className="fs-4 fw-bold">{data.productName}</div>
                            <div className="fs-6 text-body text-opacity-50 mb-2">
                                ລະຫັດ: {data.sku}
                                {data.description && (
                                    <div className='fs-6 text-body text-opacity-50 mb-2'>
                                        {data.description}
                                    </div>
                                )}
                            </div>
                            <div className="fs-3 fw-bolder mb-3">{numeral(data.sellPrices).format('0,0')}/ {data?.unit?.unitName}</div>
                            <div className="option-row">
                                <div className="d-flex mb-3">
                                    <button type='button' onClick={handleDecrease} className="btn btn-red btn-sm rounded-pill "><i className="fa fa-minus"></i></button>
                                    <input type="tel" className="form-control w-80px fs-bold text-center me-1 ms-1 rounded-pill" value={values.quantity} onChange={handleInputChange} min="1" />
                                    <button type='button' onClick={handleIncrease} className="btn btn-green btn-sm rounded-pill"><i className="fa fa-plus"></i></button>
                                </div>
                            </div>
                            <hr />
                            <div className="mb-3">
                                <div className="fw-bold fs-5">ລາຄາສົ່ງ</div>
                                <div className="option-list">
                                    <div className="option" >
                                        <input type="radio" checked={selectedOption === data.product_uuid}
                                            onChange={() => handleRadioChange(data.product_uuid, data.sellPrices)} id={`radio`} name="radio" className="option-input" />
                                        <label htmlFor={`radio`} role='button' className={`option-label ${selectedOption === data.product_uuid && 'text-white bg-green'}`}>
                                            <span className="option-text">ລາຄາຂາຍປົກະຕິ </span>
                                            <span className="option-price">{numeral(data.sellPrices).format('0,0')}</span>
                                        </label>
                                    </div>
                                    {data.price.map((item: any, index: number) => (
                                        <div key={index} className="option" role='button'>
                                            <input type="radio" checked={selectedOption === index}
                                                onChange={() => handleRadioChange(index, item.prices)} id={`radio${index}`} name="radio" className="option-input" />
                                            <label htmlFor={`radio${index}`} role='button' className={`option-label ${selectedOption === index && 'text-white bg-green'}`}>
                                                <span className="option-text">{item.typeName}</span>
                                                <span className="option-price">{numeral(item.prices).format('0,0')}</span>
                                            </label>
                                        </div>
                                    ))}

                                </div>
                            </div>
                            <hr />
                            <div className="row gx-3">
                                <div className="col-4">
                                    <button type='button' className="btn btn-red w-100 fs-14px rounded-3 fw-bold mb-0 d-block py-3" onClick={handleClose}>ຍົກເລີກ</button>
                                </div>
                                <div className="col-8">
                                    <button type='button' onClick={handleAddOrder} disabled={loading} className="btn btn-green w-100 fs-14px rounded-3 fw-bold d-flex justify-content-center align-items-center py-3 m-0">{loading ? <Loader content="ກຳລັງກວດສອບ..." /> :"ເພີ່ມລົງກະຕ່າ"} </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default FormOrder