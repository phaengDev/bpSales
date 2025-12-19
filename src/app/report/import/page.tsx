'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer'
import { setupDate } from '@/utils/formate';
import { Col, Grid, Row, DateRangePicker, SelectPicker, Button, HStack, Input, InputGroup, InputPicker, Loader,Placeholder } from 'rsuite';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import SearchIcon from '@rsuite/icons/Search';
import { useCategory, useBrand } from '@/utils/selectOption';
import numeral from 'numeral';
import NextPages from '@/utils/NextPages';
import { CONFIG } from '@/utils/Config';
import moment from 'moment';
import axios from 'axios';
import { usePage } from '@/utils/selectOption';
import EditIcon from '@rsuite/icons/Edit';
const importReport: React.FC = () => {
    const api = CONFIG.URLAPI;
    const shopid = getLocalStorageItem('shopid');
    const token = useToken();

    const [search, setSearch] = useState<any>({
        startDate: new Date(),
        endDate: new Date(),
        shopid: shopid,
        categorieid: '',
        brandid: '',
        types: null,
    });
    const dataCategory = useCategory();
    const dataBrand = useBrand(search.categorieid);

    const [isLoading, setIsLoading] = useState(false);
    const [itemData, setItemData] = useState<any[]>([]);
    const [filter, setFilter] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const skip = (currentPage - 1) * itemsPerPage;
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${api}/import/fetch?skip=${skip}&limit=${itemsPerPage}`, search, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const dataJson = await response.data;
            if (response.status === 200) {
                setItemData(dataJson.data || []);
                setFilter(dataJson.data || []);
                setTotalItems(dataJson.total || 0);
                setIsLoading(false);
            }
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
            filter.filter(
                n => n.product.sku.toLowerCase().includes(query) ||
                    n.product.productName.toLowerCase().includes(query)
            )
        );
    };

  
// ⭐ Update search first
useEffect(() => {
    if (!token || !shopid) return;
    setSearch((prev: any) => ({
        ...prev,
        shopid
    }));
}, [token, shopid]);

// ⭐ Then fetch data when search changes
useEffect(() => {
    if (!token || !shopid) return;
    fetchData();
}, [token, shopid,currentPage, itemsPerPage]);

    const types = [
        { label: 'ທັງຫມົດ', value: null },
        { label: <><EditIcon /> ນຳເຂົ້າທົ່ວໄປ</>, value: 1 },
        { label: <><i className="fa-brands fa-product-hunt" /> ນຳເຂົ້າຈາກການສັ່ງຊື້</>, value: 2 },
    ]
    const columns = [
        { class: 'text-center w-5', cols: 'ລ/ດ' },
        { class: 'text-center', cols: 'ວັນທີນຳເຂົ້າ' },
        { class: 'text-center', cols: 'sku' },
        { class: '', cols: 'ລະຫັດບາໂຄດ' },
        { class: '', cols: 'ຊື່ສິນຄ້າ' },
        { class: 'text-center', cols: 'ຈຳນວນ' },
        { class: 'text-end', cols: 'ລາຄາຊື້' },
        { class: 'text-end', cols: 'ສວ່ນຫຼຸດ' },
        { class: 'text-end', cols: 'ເປັນເງິນ' },
        { class: 'text-center', cols: 'ປະເພດ' },
        { class: '', cols: 'ພະນັກງານ' },
    ];

    return (
        <PageContainer>
            <ol className="breadcrumb float-end fs-5">
                <li className="breadcrumb-item"><Link href={'/'}>ໜ້າຫຼັກ</Link></li>
                <li className="breadcrumb-item text-green" role='button' title='ດາວໂຫຼດເອັກເຊວ'><i className="fa-solid fa-download" /> Export</li>
                <li className="breadcrumb-item active">ລາຍງານການນຳເຂົ້າ</li>
            </ol>
            <h1 className="page-header fs-3">ລາຍງານການນຳເຂົ້າ </h1>
            <Grid fluid>
                <Row>
                    <Col xs={24} sm={8} md={6} lg={6} className='mb-2'>
                        <label htmlFor="" className='form-label'>ວັນທີນຳເຂົ້າ</label>
                        <DateRangePicker
                            ranges={setupDate}
                            value={[search.startDate, search.endDate]}
                            onChange={(value) => {
                                if (value) {
                                    const [start, end] = value;
                                    setSearch({
                                        ...search,
                                        startDate: start,
                                        endDate: end,
                                    });
                                }
                            }}
                            block
                        />
                    </Col>
                    <Col xs={12} sm={8} md={6} lg={5} className='mb-2'>
                        <label htmlFor="" className='form-label'>ປະເພດສິນຄ້າ</label>
                        <SelectPicker data={dataCategory} value={search.categorieid} onChange={(e) => setSearch({ ...search, categorieid: e })} placeholder='ປະເພດສິນຄ້າ' block />
                    </Col>
                    <Col xs={12} sm={8} md={6} lg={5} className='mb-2'>
                        <label htmlFor="" className='form-label'>ຍີ່ຫໍ້ສິນຄ້າ</label>
                        <SelectPicker data={dataBrand} value={search.brandid} onChange={(e) => setSearch({ ...search, brandid: e })} placeholder='ຍີ່ຫໍ້ສິນຄ້າ' block />
                    </Col>
                    <Col xs={18} sm={8} md={6} lg={5} className='mb-2'>
                        <label htmlFor="" className='form-label'>ປະເພດນຳເຂົ້າ</label>
                        <SelectPicker data={types} value={search.types} onChange={(e) => setSearch({ ...search, types: e })} placeholder='ປະເພດນຳເຂົ້າ' block />
                    </Col>
                    <Col xs={6} sm={3} md={2} lg={2}>
                        <Button appearance="primary" onClick={fetchData} color='red' className='mt-4'>ຄົ້ນຫາ</Button>
                    </Col>
                </Row>
            </Grid>
            <Grid fluid className='mb-1 mt-4'>
                <Row className="show-grid">
                    <Col xs={6} sm={8} md={8} lg={5} xl={4}>
                        <HStack>
                            <label className='d-sm-block d-none'>ສະແດງ</label>
                            <InputPicker data={pages} value={itemsPerPage} onChange={(e) => setItemsPerPage(e)} />
                            <label className='d-sm-block d-none'>ລາຍການ</label>
                        </HStack>
                    </Col>
                    <Col xs={10} xsPush={8} sm={8} smPush={8} lg={6} lgPush={13} xl={6} xlPush={14}>
                        <InputGroup inside>
                            <InputGroup.Addon><SearchIcon /></InputGroup.Addon>
                            <Input onChange={handleFilter} placeholder="ເລກທີ່ບິນ /ຊື່ລູກຄ້າ.." />
                        </InputGroup>
                    </Col>
                </Row>
            </Grid>
            <div className="table-responsive wrapper ">
                <table className="table table-bordered table-striped table-hover text-nowrap">
                    <thead>
                        <tr>
                            {columns.map((item: any, index: number) => (
                                <th key={index} className={item.class}>{item.cols}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className='text-center'>
                                     <Placeholder.Grid rows={5} columns={6} active />
                                    <Loader size='lg'  vertical content='ກຳລັງໂຫລດຂໍ້ມູນ...' />
                                </td>
                            </tr>
                        ) : (
                            itemData.length > 0 ? (
                                itemData.map((item: any, index: number) => {
                                    const total = (item.quantity * item.buy_price) - item.discount;
                                    return (
                                        <tr key={index}>
                                            <td className='text-center'>{index + skip + 1}</td>
                                            <td className='text-center'>{moment(item.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                                            <td className='text-center'>{item.product.sku}</td>
                                            <td>{item.product.barcode}</td>
                                            <td>{item.product.productName}</td>
                                            <td className='text-center'>{item.quantity} {item.product.unit.unitName}</td>
                                            <td className='text-end'>{numeral(item.buy_price).format('0,0')}</td>
                                            <td className='text-end'>{numeral(item.discount).format('0,0')}</td>
                                            <td className='text-end'>{numeral(total).format('0,0')}</td>
                                            <td className='text-center'>
                                                {item.types === 1 ? <span className='text-green'><EditIcon /> ນຳເຂົ້າທົ່ວໄປ</span> : <span className='text-orange'><i className="fa-brands fa-product-hunt" /> ນຳເຂົ້າຈາກການສັ່ງຊື້</span>}
                                            </td>
                                            <td>{item.user.userName}</td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className='text-center text-red'>======== ບໍ່ມີຂໍ້ມູນການນຳເຂົ້າ =========</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
            <NextPages dataTotal={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </PageContainer>
    )
}

export default importReport