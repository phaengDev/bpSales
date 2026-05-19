'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, SelectPicker } from 'rsuite';
import { Notific } from '../../../utils/Notification';
import { postApi, putApi } from '../../../utils/Configs';
import { useCategory } from '../../../utils/selectOption';
import { useToken } from '@/hooks/useToken';
interface Props {
  open: boolean;
  handleClose: () => void;
  data: any;
  fetchData: (data: any) => void;
}
const FormBrand: React.FC<Props> = ({ open, handleClose, data,fetchData }) =>{
const token = useToken();
const categories=useCategory();

    const [values, setValues] = useState<any>({
        categorieid: '',
        brandName: '',
        description: ''
    });
const [loading, setLoading] = useState(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
        setLoading(true);
        if (data) {
            const res = await  putApi(`/brand/${btoa(data.brand_uuid)}`, values,{
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (res.status === 200) {
                Notific.success(res.data.message);
                handleClose();
                fetchData(res.data.data);
            }
        }else {
        const res = await  postApi('/brand/create', values,{
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        if (res.status === 200) {
            Notific.success(res.data.message);
            handleClose();
            fetchData(res.data.data);
        }
      }
        } catch (error) {
          Notific.error('ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ');
        }
      }

      useEffect(() => {
        if (data) {
          setValues({
            categorieid: data.categorieid || '',
            brandName: data.brandName || '',
            description: data.description || ''
          });
        } else {
          setValues({
            categorieid: '',
            brandName: '',
            description: ''
          });
        }
      }, [data]);


    return (
        <Modal open={open} onClose={handleClose} >
            <Modal.Header>
                <Modal.Title className='py-1'>{data ? 'ແກ້ໄຂຂໍ້ມູນຍີ່ຫໍ້' : 'ເພີ່ມຍີ່ຫໍ້ສິນຄ້າ'}</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
            <Modal.Body>
                <div className="form-group mb-2">
                    <label htmlFor="" className='form-label fs-bold'>ຊື່ຍີ່ຫໍ້<span className='text-red'>*</span></label>
                    <Input value={values.brandName} onChange={value => setValues({ ...values, brandName: value })} placeholder='ຊື່ຍີ່ຫໍ້' required />
                </div>
                <div className="form-group mb-2">
                    <label htmlFor="" className='form-label fs-bold'>ປະເພດ <span className='text-red'>*</span></label>
                    <SelectPicker block data={categories} value={values.categorieid} onChange={value => setValues({ ...values, categorieid: value })} placeholder='ເລືອກປະເພດ'  />
                </div>
                <div className="form-group mb-2">
                    <label htmlFor="" className='form-label fs-bold'>ລາຍລະອຽດ</label>
                    <Input as={'textarea'} value={values.description} onChange={value => setValues({ ...values, description: value })} placeholder='ລາຍລະອຽດ' />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button type='submit' disabled={loading} appearance="primary">ບັນທຶກ</Button>
                <Button color='red' onClick={handleClose} appearance="primary">ປິດ</Button>
            </Modal.Footer>
            </form>
        </Modal>
    )
}

export default FormBrand