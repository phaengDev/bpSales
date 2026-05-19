'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import FormUnit from './FormUnit';
import { Grid, Row, Col, InputGroup, Input, InputPicker, HStack, Placeholder, Loader } from 'rsuite';
import { getApi, deleteApi } from '../../../utils/Configs';
import { usePage } from '../../../utils/selectOption';
import { Notific } from '../../../utils/Notification';
import NextPages from '../../../utils/NextPages';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
const UnitPage: React.FC = () => {
    const shopid = getLocalStorageItem('shopid');
    const token = useToken();


    const [open, setOpen] = useState(false);
    const [data, setData] = useState(null);
    const [response, setResponse] = useState(null);
    const handleNewForm = () => {
        setOpen(true);
        setData(null);
    }
    const handleEdit = (data: any) => {
        setOpen(true);
        setData(data);
    }

    const [itemData, setItemData] = useState<any[]>([]);
    const [filter, setFilter] = useState<any[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const skipItem = ((currentPage - 1) * itemsPerPage);
    const [isLoading, setIsLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const fetchUnits = async () => {
        setIsLoading(true);
        try {
            const response = await getApi(`/unit/fetch/${shopid}?skip=${skipItem}&limit=${itemsPerPage}`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const jsonData = response.data;
            setItemData(jsonData.data);
            setFilter(jsonData.data);
            setTotalItems(jsonData.total)
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }
    const pages = usePage(totalItems);
    const handleFilter = (event: any) => {
        const query = event.toLowerCase();
        setItemData(
            filter.filter(n => n.unitName.toLowerCase().includes(query))
        );
    };


    const handleDelete = (id:string) => {
        Notific.confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນນີ້ແທ້ບໍ່?', async () => {
            try {
                const response = await deleteApi('/unit/' + btoa(id),{
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
    useEffect(() => {
        if(token){
        fetchUnits();
        }
    }, [response,token,itemsPerPage, currentPage]);
const columns = [
        { class: 'text-center w-5', col: 'ລຳດັບ' },
        { class: '', col: 'ຊື່ຫົວໜ່ວຍ' },
        { class: 'text-center w-5', col: 'ສະຖານະ' },
        { class: 'text-center w-5', col: 'ຕັ້ງຄ່າ' }
    ]

    return (
        <PageContainer>
            <ol className="breadcrumb float-end fs-5">
                <li className="breadcrumb-item"><Link href={'/'}>ໜ້າຫຼັກ</Link></li>
                <li className="breadcrumb-item"><span role='button' onClick={handleNewForm} className="text-blue fs-5"><i className="fa fa-plus"></i> ເພີ່ມຫົວໜ່ວຍ </span></li>
                <li className="breadcrumb-item active">ລາຍການຫົວໜ່ວຍສິນຄ້າ</li>
            </ol>
            <h1 className="page-header">ຂໍ້ມູນຫົວໜ່ວຍສິນຄ້າ</h1>
            <div className="panel">
                <div className="panel-body p-0">
                    <Grid fluid>
                        <Row gutter={16}>
                            <Col span={{ xs: 6, sm: 8, md: 8, lg: 5, xl: 4 }}>
                                <HStack>
                                    <label className='d-sm-block d-none'>ສະແດງ</label>
                                    <InputPicker data={pages} value={itemsPerPage} onChange={(e) => setItemsPerPage(e)} />
                                    <label className='d-sm-block d-none'>ລາຍການ</label>
                                </HStack>
                            </Col>
                            <Col span={{ xs: 10, sm: 8, lg: 6, xl: 6 }} push={{ xs: 8, sm: 8, lg: 13, xl: 14 }}>
                                <InputGroup inside>
                                    <InputGroup.Addon><i className="fas fa-search" /></InputGroup.Addon>
                                    <Input placeholder="ຄົ້ນຫາ" onChange={(e) => handleFilter(e)} />
                                </InputGroup>
                            </Col>
                        </Row>
                    </Grid>
                    <div className="table-responsive mb-2 mt-2">
                        <table className="table table-striped table-bordered text-nowrap mb-0">
                            <thead>
                                <tr>
                                    {columns.map((item, index) => (
                                        <th key={index} className={item.class}>{item.col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className='fs-5'>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={columns.length} className='text-center'>
                                            <Placeholder.Grid rows={5} columns={6} active />
                                            <Loader content="ກຳລັງໂຫຼດຂໍ້ມູນ..." />
                                        </td>
                                    </tr>
                                ) :
                                    itemData.length > 0 ? (
                                        itemData.map((item, index) =>
                                            <tr key={index}>
                                                <td className='text-center'>{index + 1}</td>
                                                <td>{item.unitName}</td>
                                                <td className={item.relationship === 1 ? 'text-green' : 'text-red'}>{item.relationship === 1 ? 'ສຳພັນໄດ້' : 'ສຳພັນບໍ່ໄດ້'}</td>
                                                <td className='text-center'>
                                                    <button type='button' onClick={() => handleEdit(item)} className='btn btn-xs btn-blue me-2'><i className="fa-solid fa-pen-to-square" /></button>
                                                    <button type='button' onClick={() => handleDelete(item.unit_uuid)} className='btn btn-xs btn-danger'><i className="fa-solid fa-trash" /></button>
                                                </td>
                                            </tr>
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={columns.length} className='text-center text-red'>ບໍ່ພົບຂໍ້ມູນທີ່ມີການບັນທຶກ</td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                    <NextPages dataTotal={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                </div>
            </div>

            <FormUnit open={open} handleClose={() => setOpen(false)} data={data} fetchData={setResponse} />
        </PageContainer>
    )
}

export default UnitPage
