'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, InputGroup, Loader, InputPicker } from 'rsuite';
import EyeCloseIcon from '@rsuite/icons/EyeClose';
import VisibleIcon from '@rsuite/icons/Visible';
import PhoneFillIcon from '@rsuite/icons/PhoneFill';
import axios from 'axios';
import { CONFIG } from '../../utils/Config';
import { Notific } from '../../utils/Notification';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
interface Props {
    open: boolean;
    handleClose: () => void;
    data: any;
    resPonse: (data: any) => void;
}
const FormAdd: React.FC<Props> = ({ open, handleClose, data, resPonse }) => {
    const api = CONFIG.URLAPI;
    const token = useToken();
    const shopid = getLocalStorageItem('shopid') || null;
    
    const [values, setValues] = useState({
        shopid: shopid,
        userName: '',
        phones: '',
        typeuser: 1,
        password: '',
        created: 1,
        updated: 1,
        deleted: 1
    });

    const [visible, setVisible] = React.useState(false);
    const showPassword = () => {
        setVisible(!visible);
    };
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (data) {
                const response = await axios.put(`${api}/user/${btoa(data.user_uuid)}`, values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (response.status === 200) {
                    handleClose();
                    resPonse(response.data.data);
                    Notific.success(response.data.message);
                }
            } else {
                const response = await axios.post(`${api}/user/create`, values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (response.status === 200) {
                    handleClose();
                    resPonse(response.data.data);
                    Notific.success(response.data.message);
                }
            }
        } catch (error) {
            Notific.error('Failed to create user. Please try again')
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        if (data) {
            setValues({
                ...values,
                shopid: data.shopid,
                userName: data.userName,
                phones: data.phones,
                created: data.created,
                updated: data.updated,
                deleted: data.deleted
            });
        } else {
            setValues({
                ...values,
                shopid: shopid,
                userName: '',
                phones: '',
                created: 1,
                updated: 1,
                deleted: 1
            });
        }
    }, [data]);

    return (
        <Modal open={open} onClose={handleClose} >
            <Modal.Header>
                <Modal.Title className='py-1'>{data ? 'ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້' : 'ເພີ່ມຂໍ້ມູນຜູ້ໃຊ້'} </Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="form-group mb-2">
                        <label htmlFor="userName" className='form-label fs-bold'>ຊື່ແລະນາມສະກຸນ</label>
                        <InputGroup inside>
                            <InputGroup.Addon><i className='fa fa-user' /></InputGroup.Addon>
                            <Input value={values.userName} onChange={(value) => setValues({ ...values, userName: value })} placeholder="ຊື່ຜູ້ໃຊ້" required />
                        </InputGroup>
                    </div>
                    <div className="form-group mb-2">
                        <label htmlFor="phones" className='form-label fs-bold'>ເບີໂທລະສັບ</label>
                        <InputGroup inside>
                            <InputGroup.Addon><PhoneFillIcon /></InputGroup.Addon>
                            <Input value={values.phones} onChange={(value) => setValues({ ...values, phones: value })} placeholder="ເບີໂທລະສັບ" required />
                        </InputGroup>
                    </div>
                    {!data &&
                        <div className="form-group mb-2">
                            <label htmlFor="password" className='form-label fs-bold'>ລະຫັດຜ່ານ</label>
                            <InputGroup inside>
                                <Input type={visible ? 'text' : 'password'} value={values.password} onChange={(value) => setValues({ ...values, password: value })} placeholder='*******' required />
                                <InputGroup.Button onClick={showPassword}>
                                    {visible ? <VisibleIcon /> : <EyeCloseIcon />}
                                </InputGroup.Button>
                            </InputGroup>
                        </div>
                    }
                    <div className="form-group mb-2">
                        <label htmlFor="typeuser" className='form-label fs-bold'>ປະເພດຜູ້ໃຊ້</label>
                        <InputPicker data={[{
                            label: <span className='text-green'><i className="fa-solid fa-user-tie" /> Super Admin</span>,
                            value: 1
                        }, {
                            label: <span className='text-orange'><i className="fa-solid fa-users" /> Admin</span>,
                            value: 2
                        }, {
                            label: <span className='text-red'><i className="fa-solid fa-user" /> User</span>,
                            value: 3
                        }]} value={values.typeuser} onChange={(value) => setValues({ ...values, typeuser: value })} placeholder="ປະເພດ" block />
                    </div>
                    <div className="form-group mb-2">
                        <div className="row">
                            <label className="form-label col-form-label fs-5 col-md-3 text-end">
                                ສິດທິການນຳໃຊ້   :
                            </label>
                            <div className="col-md-9 pt-2 fs-5">
                                <div className="form-check form-check-inline">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="created"
                                        checked={values.created === 2}
                                        onChange={() =>
                                            setValues({
                                                ...values,
                                                created: values.created === 2 ? 1 : 2,
                                            })
                                        } />
                                    <label className="form-check-label" htmlFor="created">
                                        ເພີ່ມຂໍ້ມູນ
                                    </label>
                                </div>

                                <div className="form-check form-check-inline">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="updated"
                                        checked={values.updated === 2}
                                        onChange={() =>
                                            setValues({
                                                ...values,
                                                updated: values.updated === 2 ? 1 : 2,
                                            })
                                        }
                                    />
                                    <label className="form-check-label" htmlFor="updated">
                                        ແກ້ໄຂຂໍ້ມູນ
                                    </label>
                                </div>

                                <div className="form-check form-check-inline">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="deleted"
                                        checked={values.deleted === 2}
                                        onChange={() =>
                                            setValues({
                                                ...values,
                                                deleted: values.deleted === 2 ? 1 : 2,
                                            })
                                        }
                                    />
                                    <label className="form-check-label" htmlFor="deleted">
                                        ລົບຂໍ້ມູນ
                                    </label>
                                </div>
                            </div>
                        </div>

                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button type='submit' disabled={loading} appearance="primary">{loading ? <Loader content='ກຳລັງບັນທຶກ..' /> : 'ບັນທຶກ'}</Button>
                    <Button color='red' onClick={handleClose} appearance="primary">ປິດ</Button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}

export default FormAdd