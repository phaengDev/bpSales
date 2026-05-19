'use client'
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, SelectPicker, InputGroup, IconButton } from 'rsuite';
import WarningRoundIcon from '@rsuite/icons/WarningRound';
import PhoneFillIcon from '@rsuite/icons/PhoneFill';
import { postApi, putApi } from '../../utils/Configs';
import { Notific } from '../../utils/Notification';
import { useCountry } from '../../utils/selectOption';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
interface Props {
    open: boolean,
    onClose: () => void,
    data: any,
    reSponse: (data: any) => void
}
const FromAdd: React.FC<Props> = ({ open, onClose, data, reSponse }) => {
    const token = useToken();
    const shopid = getLocalStorageItem('shopid');
    const country = useCountry();

    const [values, setValues] = useState<any>({
        shopid: shopid,
        logos: null,
        supplierName: '',
        phone: '',
        countryid: 1,
        villageName: '',
        districtName: '',
        provinceName: '',
        description: '',
    });
    const handleChange = (name: keyof typeof values, value: any) => {
        setValues((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };


    const [files, setFiles] = useState<string | null>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (files) {
                URL.revokeObjectURL(files);
            }
            const fileURL = URL.createObjectURL(file);
            setFiles(fileURL);
            setValues((prev: any) => ({
                ...prev,
                logos: file, // เก็บ file object สำหรับอัปโหลดจริง
            }));
        }
    };

    const handleMov = () => {
        setFiles(null);
        setValues({
            ...values,
            logos: null
        });
    }
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
        if(data){
            const result = await putApi(`/supplier/${btoa(data._uuid)}`, values, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            if (result.status === 200) {
                Notific.success(result.data.message);
                onClose();
                reSponse(result.data.data);
            }
        }else{
            const result = await postApi('/supplier/create', values, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },

            });
            if (result.status === 200) {
                Notific.success('ເພີ່ມຜູ້ສະໜອງສິນຄ້າສໍາເລັດ');
                onClose();
                reSponse(result.data.data);
            }
        }
        } catch (error) {
            Notific.error('ເພີ່ມຜູ້ສະໜອງສິນຄ້າບໍ່ສໍາເລັດ');
        } finally {
            setLoading(false);
        }
    }



    useEffect(() => {
        if (data) {
            setValues({
                ...values,
                supplierName: data.supplierName,
                phone: data.phone,
                countryid: data.countryid,
                villageName: data.villageName,
                districtName: data.districtName,
                provinceName: data.provinceName,
                description: data.description,
            });
            if (data.logos) {
                setFiles(data.url);
            }
        }
    }, [data])


    return (
        <Modal open={open} onClose={onClose} overflow={true} >
            <Modal.Header>
                <Modal.Title className='py-1'>{data ? 'ແກ້ໄຂຜູ້ສະໜອງສິນຄ້າ' : 'ເພີ່ມຜູ້ສະໜອງສິນຄ້າ'}</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="row">
                        <div className="col-12 ">
                            <div className="profile w-25 float-center ">
                                <label className="profile-image" role='button'>
                                    <img src={files || "../assets/img/icon/icon-user.jpg"} className='w-100 rounded-3' alt="avatar" />
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="d-none" />
                                </label>
                                {files && (
                                    <div className="move-profile">
                                        <IconButton color="red" size="xs" onClick={handleMov} appearance="primary" icon={<WarningRoundIcon />} circle />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-12 mb-2">
                            <label htmlFor="" className="form-label fs-bold">ຊື່ຜູ້ສະໜອງສິນຄ້າ</label>
                            <Input value={values.supplierName} onChange={(value) => handleChange('supplierName', value)} placeholder="ຊື່ຜູ້ສະໜອງສິນຄ້າ" />
                        </div>
                        <div className="col-12 mb-2">
                            <label htmlFor="" className="form-label fs-bold">ເບີໂທລະສັບ</label>
                            <InputGroup inside>
                                <InputGroup.Addon><PhoneFillIcon /></InputGroup.Addon>
                                <Input type='tel' value={values.phone} onChange={(value) => {
                                    if (/^\d{0,8}$/.test(value)) {
                                        handleChange('phone', value);
                                    }
                                }} placeholder="020 999 999 99" />
                            </InputGroup>
                        </div>
                        <div className="col-6 mb-2">
                            <label htmlFor="" className="form-label fs-bold">ປະເທດ</label>
                            <SelectPicker data={country} value={values.countryid} onChange={(value) => handleChange('countryid', value)} placeholder="ເລືອກປະເທດ" block />
                        </div>

                        <div className="col-6 mb-2">
                            <label htmlFor="" className="form-label fs-bold">ຊື່ບ້ານ</label>
                            <Input value={values.villageName} onChange={(value) => handleChange('villageName', value)} placeholder="ປ້ອນຊື່ບ້ານ" />
                        </div>
                        <div className="col-6 mb-2">
                            <label htmlFor="" className="form-label fs-bold">ຊື່ເມືອງ</label>
                            <Input value={values.districtName} onChange={(value) => handleChange('districtName', value)} placeholder="ຊື່ເມືອງ" />
                        </div>

                        <div className="col-6 mb-2">
                            <label htmlFor="" className="form-label fs-bold">ຊື່ແຂວງ</label>
                            <Input value={values.provinceName} onChange={(value) => handleChange('provinceName', value)} placeholder="ຊື່ແຂວງ" />
                        </div>

                        <div className="col-12 mb-2">
                            <label htmlFor="" className="form-label fs-bold">ລາຍລະອຽດ</label>
                            <Input as={'textarea'} value={values.description} onChange={(value) => handleChange('description', value)} placeholder="ລາຍລະອຽດ..." />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button type='submit' disabled={loading} appearance="primary">ບັນທຶກ</Button>
                    <Button onClick={onClose} color='red' appearance="primary">ປິດ</Button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}

export default FromAdd