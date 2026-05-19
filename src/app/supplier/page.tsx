'use client'
import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/PageContainer';
import Link from 'next/link';
import FormAdd from './FromAdd';
import { Grid, Row, Col, InputGroup, Input, IconButton, HStack, InputPicker, Placeholder, Loader, Tag } from 'rsuite';
import { getApi, deleteApi } from '../../utils/Configs';
import NextPages from '../../utils/NextPages';
import { usePage } from '../../utils/selectOption';
import { Notific } from '../../utils/Notification';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
const SupplierPage: React.FC = () => {
    const token = useToken();
    const shopid = getLocalStorageItem('shopid');
    const logos = '../assets/img/icon/user.png';
    const [open, setOpen] = useState(false);
    const [data, setData] = useState(null);
    const handleNewForm = () => {
        setOpen(true);
        setData(null);
    }

    const [itemData, setItemData] = useState<any[]>([]);
    const [filter, setFilter] = useState<any[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const skipItem = ((currentPage - 1) * itemsPerPage);
    const [isLoading, setIsLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    const fetchSuppliers = async () => {
        setIsLoading(true);
        try {
            const response = await getApi(`/supplier/fetch/${shopid}?skip=${skipItem}&limit=${itemsPerPage}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

            const jsonData = await response.data;
            setItemData(jsonData.data);
            setFilter(jsonData.data);
            setTotalItems(jsonData.total);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };





    const handleFilter = (event: any) => {
        const query = event.toLowerCase();
        setItemData(
            filter.filter(
                n =>
                    n.supplierName.toLowerCase().includes(query) ||
                    n.phone.toLowerCase().includes(query)
            )
        );
    };
    const handleDelete = (id: any) => {
        Notific.confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນນີ້ແທ້ບໍ່?', async () => {
            try {
                const response = await deleteApi('/supplier/' + btoa(id), {
                    headers: {
                        Authorization: `Bearer ${token}`
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

    const handleEdit = (data: any) => {
        setOpen(true);
        setData(data);
    }
    const page = usePage(totalItems);
    const [response, setResponse] = useState(null);

    useEffect(() => {
        if (!shopid || !token) return;

        const loadSuppliers = async () => {
            await fetchSuppliers();
        };

        loadSuppliers();
    }, [currentPage, itemsPerPage, response, shopid, token]);

    const columns = [
        {class:'text-center w-5', col: 'ລໍາດັບ'},
        {class:'text-center', col: 'ຮູບ'},
        {class:'', col: 'ຊື່ຜູ້ສະໜອງ'},
        {class:'', col: 'ເບີໂທລະສັບ'},
        {class:'', col: 'ປະເທດ'},
        {class:'', col: 'ບ້ານ'},
        {class:'', col: 'ເມືອງ'},
        {class:'', col: 'ແຂວງ'},
        {class:'', col: 'ລາຍລະອຽດ'},
        {class:'text-center', col: 'ສະຖານະ'},
        {class:'text-center', col: 'ການຕັ້ງຄ່າ'},
    ]

    return (<PageContainer>
        {/* <div id="content" className="app-content bg-component"> */}
        <ol className="breadcrumb float-end fs-5">
            <li className="breadcrumb-item"><Link href={'/'}>ໜ້າຫຼັກ</Link></li>
            <li className="breadcrumb-item"><span role='button' onClick={handleNewForm} className="text-blue fs-5"><i className="fa fa-plus"></i>ເພີ່ມຂໍ້ມູນ </span></li>
            <li className="breadcrumb-item active">ລາຍການຜູ້ສະໜອງສິນຄ້າ</li>
        </ol>
        <h1 className="page-header">ຂໍ້ມູນຜູ້ສະໜອງສິນຄ້າ</h1>
        <div className="panel p-0">
            <div className="panel-body p-0">
                <Grid fluid>
                    <Row className="show-grid">
                        <Col span={{ xs: 6, sm: 5, lg: 3 }}>
                            <HStack>
                                <label htmlFor="" >ສະແດງ</label>
                                <InputPicker value={itemsPerPage} onChange={(e) => setItemsPerPage(e)} data={page} />
                            </HStack>
                        </Col>
                        <Col span={{ xs: 14, sm: 10, md: 10, lg: 6 }} push={{ xs: 4, sm: 9, md: 9, lg: 15 }}>
                            <InputGroup inside>
                                <InputGroup.Addon><i className="fa fa-search" /></InputGroup.Addon>
                                <Input onChange={handleFilter} placeholder="ຄົ້ນຫາ ..." />
                            </InputGroup>
                        </Col>
                    </Row>
                </Grid>
                <div className="table-responsive mb-2 mt-2">
                    <table className="table table-striped table-bordered text-nowrap mb-0">
                        <thead>
                            <tr>
                                {columns.map((item: any, index: number) => (
                                    <th key={index} className={item.class}>{item.col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className='fs-5'>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className='text-center'>
                                        <Placeholder.Grid rows={5} columns={6} active />
                                        <Loader size="lg" content="loading..." vertical />
                                    </td>
                                </tr>
                            ) : itemData.length > 0 ? (
                                itemData.map((item, index) => (
                                    <tr key={index}>
                                        <td className='w-5 text-center'>{index + 1}</td>
                                        <td className='w-5 text-center'>
                                            <img src={`${item.logos === '' || item.logos === null ? logos : item.url}`} className="rounded h-30px my-n1 mx-n1" />
                                        </td>
                                        <td>{item.supplierName}</td>
                                        <td>{item.phone}</td>
                                        <td>{item?.country?.icons}: {item?.country?.names} </td>
                                        <td>{item.villageName}</td>
                                        <td>{item.districtName}</td>
                                        <td>{item.provinceName}</td>
                                        <td>{item.description}</td>
                                        <td className='text-center'>
                                            <Tag color={item.status === 1 ? 'green' : 'red'}>{item.status === 1 ? 'ກຳລັງໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}</Tag>
                                        </td>
                                        <td className='text-center'>
                                            <IconButton icon={<i className="fa-solid fa-pen-to-square" />} size='xs' onClick={() => handleEdit(item)} color='green' appearance="primary" className='me-1' />
                                            <IconButton icon={<i className="fa-solid fa-trash" />} size='xs' color='red' onClick={() => handleDelete(item._uuid)} appearance="primary" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className='text-center text-red'>========== ບໍ່ມີຂໍ້ມູນຮ້ານຄ້າ =========</td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>
                <NextPages dataTotal={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>
        </div>
        {open &&
            <FormAdd open={open} onClose={() => setOpen(false)} data={data} reSponse={setResponse} />
        }
        {/* </div> */}
    </PageContainer>)
}
export default SupplierPage