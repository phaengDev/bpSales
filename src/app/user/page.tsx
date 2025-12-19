'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { Grid, Row, Col, InputGroup, Input, HStack, InputPicker, Placeholder, Loader, Toggle } from 'rsuite';
import FormAdd from './FormAdd';
import { CONFIG } from '../../utils/Config';
import axios from 'axios';
import NextPages from '../../utils/NextPages';
import { usePage } from '../../utils/selectOption';
import { Notific } from '../../utils/Notification';
import CheckIcon from '@rsuite/icons/Check';
import CloseIcon from '@rsuite/icons/Close';
import SearchIcon from '@rsuite/icons/Search';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
const UserPage: React.FC = () => {
    const api = CONFIG.URLAPI;
    const shopid = getLocalStorageItem('shopid') || null;
    const token = useToken();

    const [open, setOpen] = useState(false);
    const [data, setData] = useState('');

    const [response, setResponse] = useState<any>(null);
    const handleNewForm = () => {
        setOpen(true);
        setData('');
    }

    const [itemUser, setItemUser] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const skip = ((currentPage - 1) * itemsPerPage);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<any[]>([]);
    const fetchData = async () => {
        if (!token || !shopid) return // ✅ ป้องกันตอนยังไม่มี token
        try {
            setIsLoading(true);
            const res = await axios.get(`${api}/user/fetch/${shopid}?skip=${skip}&limit=${itemsPerPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const jsonData = res.data;
            setFilter(jsonData.data || [])
            setItemUser(jsonData.data || [])
            setTotalItems(jsonData.total || 0)
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const pages = usePage(totalItems);
    const hanleFilter = (event: any) => {
        const searchTerm = event.toLowerCase();
        setItemUser
        filter.filter(n =>
            n.userName.toLowerCase().includes(searchTerm) ||
            n.phones.toLowerCase().includes(searchTerm)
        );
    }

    const handleEdit = (data: any) => {
        setOpen(true);
        setData(data);
    }
    const handleDelete = (id: string) => {
        Notific.confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນນີ້ແທ້ບໍ່?', async () => {
            try {
                const response = await axios.delete(api + '/user/' + btoa(id),{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                const jsonData = await response.data;
                if (response.status === 200) {
                    Notific.success(jsonData.message);
                    setResponse(jsonData.data);
                }
            } catch (error) {
                Notific.error('ລົບຂໍ້ມູນບໍ່ສໍາເລັດ');
                console.error('Error fetching data:', error);
            }
        });
    }
    const handleEditPass = (data: any) => {
        setOpen(true);
        setData(data);
    }


   useEffect(() => {
  if (token && shopid) {
    fetchData();
  }
}, [token, shopid, currentPage, itemsPerPage, response]);


    const columns = [
        { class: 'text-center w-5', col: 'ລຳດັບ' },
        { class: '', col: 'ຊື່ຜູ້ໃຊ້' },
        { class: '', col: 'ເບີໂທລະສັດ' },
        { class: '', col: 'ປະເພດຜູ້ໃຊ້' },
        { class: 'text-center', col: 'ສ້າງ' },
        { class: 'text-center', col: 'ແກ້ໄຂ' },
        { class: 'text-center', col: 'ລຶບ' },
        { class: 'text-center w-5', col: 'ສະຖານະ' },
        { class: 'text-center w-5', col: 'ຕັ້ງຄ່າ' }
    ]

    return (
        <PageContainer>
            <ol className="breadcrumb float-end fs-5">
                <li className="breadcrumb-item"><Link href={'/'} aria-current="page">ໜ້າຫຼັກ</Link></li>
                <li className="breadcrumb-item"><span className="text-blue fs-5" role='button' onClick={handleNewForm} ><i className="fa fa-plus"></i>ເພີ່ມຜູ້ໃຊ້ </span></li>
                <li className="breadcrumb-item active" >ລາຍການຜູ້ໃຊ້</li>
            </ol>
            <h1 className="page-header">ຂໍ້ມູນຜູ້ໃຊ້</h1>
            <div className="panel">
                <div className="panel-body p-0">
                    <Grid fluid className='mb-2'>
                        <Row className="show-grid">
                            <Col xs={6} sm={8} md={6} lg={5} xl={4}>
                                <HStack>
                                    <label className='d-sm-block d-none'>ສະແດງ</label>
                                    <InputPicker data={pages} value={itemsPerPage} onChange={(e) => setItemsPerPage(e)} />
                                    <label className='d-sm-block d-none'>ລາຍການ</label>
                                </HStack>
                            </Col>
                            <Col xs={10} xsPush={8} sm={8} smPush={8} md={8} mdPush={10} lg={6} lgPush={13} xl={6} xlPush={14}>
                                <InputGroup inside>
                                    <InputGroup.Addon><SearchIcon /></InputGroup.Addon>
                                    <Input placeholder="ຄົ້ນຫາ" onChange={hanleFilter} />
                                </InputGroup>
                            </Col>
                        </Row>
                    </Grid>
                    <div className="table-responsive mb-2 mt-2">
                        <table className="table table-striped table-bordered text-nowrap mb-0">
                            <thead>
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={idx} className={col.class}>{col.col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className='fs-5'>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={columns.length} className='text-center'>
                                            <Placeholder.Grid rows={5} columns={6} active />
                                            <Loader content="ກຳລັງໂຫລດຂໍ້ມູນ..." size='lg' vertical />
                                        </td>
                                    </tr>
                                ) :
                                    itemUser.length > 0 ?
                                        itemUser.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + skip + 1}</td>
                                                <td>{item.userName}</td>
                                                <td>{item.phones}</td>
                                                <td>{item.typeuser === 1 ? <><i className="fa-solid fa-user-tie text-green" /> Super Admin</> : item.typeuser === 2 ? <><i className="fa-solid fa-users text-orange" /> Admin</> : <><i className="fa-solid fa-user text-red" /> User</>}</td>
                                                <td className='text-center'>{item.created === 2 ? <CheckIcon color='green' fontSize={20} /> : <CloseIcon color='red' fontSize={20} />}</td>
                                                <td className='text-center'>{item.updated === 2 ? <CheckIcon color='green' fontSize={20} /> : <CloseIcon color='red' fontSize={20} />}</td>
                                                <td className='text-center'>{item.deleted === 2 ? <CheckIcon color='green' fontSize={20} /> : <CloseIcon color='red' fontSize={20} />}</td>
                                                <td className='text-center '><Toggle checkedChildren="ເປິດ" unCheckedChildren="ປິດ" checked={item.status === 1 ? true : false} /></td>
                                                <td className="text-center">
                                                    <button type='button' className='btn btn-xs btn-green me-1' onClick={() => handleEdit(item)}><i className="fa fa-pencil" /></button>
                                                    <button type='button' className='btn btn-xs btn-red' onClick={() => handleDelete(item.user_uuid)}><i className="fa fa-trash" /></button>
                                                </td>
                                            </tr>
                                        )) :
                                        <tr>
                                            <td colSpan={columns.length} className='text-center text-red'>========= ບໍ່ມີຂໍ້ມູນຜູ້ໃຊ້ =========</td>
                                        </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                    <NextPages dataTotal={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                </div>
            </div>

            <FormAdd open={open} handleClose={() => setOpen(false)} data={data} resPonse={setResponse} />
        </PageContainer>
    )
}

export default UserPage