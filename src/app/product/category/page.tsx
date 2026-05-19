'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { Grid, Row, Col, Input, InputGroup, HStack, InputPicker,Loader, Placeholder } from 'rsuite';
import Formcartgory from './FormCartgory';
import { getApi, deleteApi } from '../../../utils/Configs';
import { usePage } from '../../../utils/selectOption';
import NextPages from '../../../utils/NextPages';
import { Notific } from '../../../utils/Notification';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
const CategoryPage: React.FC = ()=> {
    const shopid = getLocalStorageItem('shopid');
    const token = useToken();

    const [open, setOpen] = useState(false);
    const [data, setData] = useState(null);
    const [response, setResponse] = useState<any>(null);
    const handleNewForm = () => {
        setOpen(true);
        setData(null);
    }
    const handleEdit = (item: any) => {
        setData(item);
        setOpen(true);
    }

    const [itemData, setItemData] = useState<any[]>([]);
    const [filter, setFilter] = useState<any[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const skipItem = ((currentPage - 1) * itemsPerPage);
    const [isLoading, setIsLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await getApi(`/category/fetch/${shopid}?skip=${skipItem}&limit=${itemsPerPage}`, {
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
    //======================================
    const handleFilter = (event: any) => {
        const query = event.toLowerCase();
        setItemData(
            filter.filter(
                n =>
                    n.categoriesName.toLowerCase().includes(query) ||
                    n.cateCode.toLowerCase().includes(query)
            )
        );
    };

    const handleDelete = async (id: any) => {
        Notific.confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນນີ້ແທ້ບໍ່?', async () => {
            try {
                const response = await deleteApi('/category/' + btoa(id), {
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
        })
    }


    useEffect(() => {
        if(token){
        fetchCategories();
        }
    }, [response,token,itemsPerPage, currentPage]);

    const columns = [
        { class: 'text-center w-5', col: 'ລຳດັບ' },
        { class: 'text-center w-5', col: 'ລະຫັດ' },
        { class: '', col: 'ຊື່ປະເພດສິນຄ້າ' },
        { class: '', col: 'ໝາຍເຫດ' },
        { class: 'text-center w-5', col: 'ຕັ້ງຄ່າ' }
    ]
    return (
        <PageContainer>
            <ol className="breadcrumb float-end fs-5">
                <li className="breadcrumb-item"><Link href={'/'}>ໜ້າຫຼັກ</Link></li>
                <li className="breadcrumb-item"><span role='button' onClick={handleNewForm} className="text-blue fs-5"><i className="fa fa-plus"></i> ເພີ່ມປະເພດ </span></li>
                <li className="breadcrumb-item active">ລາຍການປະເພດສິນຄ້າ</li>
            </ol>
            <h1 className="page-header">ຂໍ້ມູນປະເພດສິນຄ້າ</h1>
            <div className="panel">
                <div className="panel-body p-0">
                    <Grid fluid>
                        <Row className="show-grid">
                            <Col span={{ xs: 6, sm: 5, lg: 3 }}>
                                <HStack>
                                    <label htmlFor="" >ສະແດງ</label>
                                    <InputPicker value={itemsPerPage} onChange={(e) => setItemsPerPage(e)} data={pages} />
                                </HStack>
                            </Col>
                            <Col span={{ xs: 14, sm: 10, md: 10, lg: 6 }} push={{ xs: 4, sm: 9, md: 9, lg: 15 }}>
                                <InputGroup inside>
                                    <InputGroup.Addon><i className="fa fa-search" /></InputGroup.Addon>
                                    <Input placeholder="ຄົ້ນຫາ ..." onChange={(e) => handleFilter(e)} />
                                </InputGroup>
                            </Col>
                        </Row>
                    </Grid>
                    <div className="table-responsive mb-2 mt-2">
                        <table className="table table-striped table-bordered text-nowrap mb-0">
                            <thead>
                                <tr>
                                    {columns.map((col, index) => (
                                        <th key={index} className={col.class}>{col.col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className='fs-5'>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={columns.length} className='text-center'>
                                            <Placeholder.Grid rows={5} columns={6} active />
                                            <Loader size='lg' center content="ກຳລັງໂຫຼດ...." vertical />
                                        </td>
                                    </tr>
                                ):
                                itemData.length > 0 ? (
                                    itemData.map((item, index) =>
                                        <tr key={index}>
                                            <td className='text-center'>{index + 1}</td>
                                            <td className='text-center'>{item.cateCode}</td>
                                            <td>{item.cateName}</td>
                                            <td>{item.description}</td>
                                            <td className='text-center'>
                                                <button type='button' onClick={() => handleEdit(item)} className='btn btn-xs btn-blue me-2'><i className="fa-solid fa-pen-to-square" /></button>
                                                <button type='button' onClick={() => handleDelete(item.cate_uuid)} className='btn btn-xs btn-danger'><i className="fa-solid fa-trash" /></button>

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

            <Formcartgory open={open} handleClose={() => setOpen(false)} data={data} fetchData={setResponse} />
        </PageContainer>
    )
}

export default CategoryPage
