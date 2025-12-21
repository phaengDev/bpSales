'use client'
import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap';
import { IconButton } from 'rsuite';
import {CONFIG } from  '../../utils/Config';
import WarningRoundIcon from '@rsuite/icons/WarningRound';
import axios from 'axios';
import { Notific } from '../../utils/Notification';
import { useToken } from '@/hooks/useToken';
interface Props {
    show: boolean,
    handleClose: () => void,
    item: any,
    resPonse: (data: any) => void
}
const ViewImage: React.FC<Props> = ({ show, handleClose, item ,resPonse}) =>{
    const api = CONFIG.URLAPI;
    const token = useToken();
    const imgPs = `${item.image === '' || item.image === null ? '../assets/img/icon/picture.jpg' : item.url}`

    const [values, setValues] = useState({
        images: null,
        images2: item.image,
        product_uuid: item.id,
    })
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
                    images: file, // เก็บ file object สำหรับอัปโหลดจริง
                }));
            }
        };

    const handleEditFile = async () => {
        try {
            const result = await axios.post(api + '/product/editImg', values, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            if (result.status === 200) {
                Notific.success(result.data.message);
                resPonse(result.data.data);
                handleClose();
            }
        } catch (error) {
            console.log(error);
        }
    }
    



    useEffect(() => {
        setValues({
            ...values,
            product_uuid: item.id,
            images2: item.image,
        });
    }, [item]);

    return (
        <Modal show={show} onHide={handleClose} size="sm">
            <Modal.Body className='profile  p-0'>
                <img src={files || imgPs} className='w-100 rounded-3' alt="" />
                <div className="move-profile me-n1 mt-n1"> <IconButton color="red" size='xs' onClick={handleClose} appearance="primary" icon={<WarningRoundIcon />} /></div>
                <div className="bottom-left">
                    <label role='button' className='badge bg-green'><i className="fas fa-edit"></i> ປ່ຽນຮູບ
                        <input type="file" onChange={handleFileChange} className='d-none' />
                    </label>
                    </div>
                    {files &&
                        <div className="bottom-right">
                            <button type='button' onClick={handleEditFile} className="btn btn-primary btn-xs ms-2">ບັນທຶກ</button>
                        </div>
                    }
                
            </Modal.Body>
        </Modal>
    )
}

export default ViewImage