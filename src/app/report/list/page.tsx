'use client'
import React, { useState, useEffect } from 'react'
import PageContainer from '@/components/PageContainer';
import { CONFIG } from '@/utils/Config';
import axios from 'axios';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import { useCategory, useUnite, useSizes, usePage } from '@/utils/selectOption';
import { DatePicker, Grid, Row, Col, Loader, Placeholder, Button, Input, SelectPicker, HStack, InputPicker, InputGroup } from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import numeral from 'numeral';
import NextPages from '@/utils/NextPages';
import moment from 'moment';
import Link from 'next/link';
const SaleList: React.FC = () => {
    const api = CONFIG.URLAPI;
    const shopId = getLocalStorageItem('shopid');
    const token = useToken();
    const cartgory = useCategory();
    const unit = useUnite();
    const size = useSizes();

    const [search, setSearch] = useState<any>({
        startDate: new Date(),
        endDate: new Date(),
        cartgoryid: '',
        uniteid: '',
        sizeid: '',
        shopid: shopId
    });

    const [isLoading, setIsLoading] = useState(true);
    const [itemData, setItemData] = useState<any[]>([]);
    const [filter, setFilter] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const skipItem = (currentPage - 1) * itemsPerPage;
    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(api + '/billsale/fetch/list?skip=' + skipItem + '&limit=' + itemsPerPage, search, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const dataJson = response.data;
            console.log(dataJson.data);
            setItemData(dataJson.data);
            setFilter(dataJson.data);
            setTotalItems(dataJson.total);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const pages = usePage(totalItems)


    const handleFilter = (event: any) => {
        const query = event.toLowerCase();
        setItemData(
            filter.filter(
                n => n.product.sku.toLowerCase().includes(query) ||
                    n.product.productName.toLowerCase().includes(query)
            )
        );
    };



    const sum = itemData.reduce(
        (acc, item) => {
            const price = Number(item.price_sales) || 0;
            const qty = Number(item.quantity) || 0;
            const free = Number(item.free) || 0;
            const discount = Number(item.discount) || 0;
            acc.balanceTotal += (price * (qty - free));
            acc.discount += discount;
            return acc;
        },
        { balanceTotal: 0,discount: 0 }
    );

    const columns = [
        { col: 'ລ/ດ', class: 'text-center' },
        { col: 'ວັນທີຂາຍ', class: 'text-center' },
        { col: 'ລະຫັດສິນຄ້າ', class: 'text-center' },
        { col: 'ຊື່ສິນຄ້າ', class: '' },
        { col: 'ຍີ່ຫໍ້', class: '' },
        { col: 'ຂະຫນາດ', class: '' },
        { col: 'ລາຄາຂາຍ', class: 'text-end' },
        { col: 'ຈໍານວນ', class: 'text-center' },
        { col: 'ຟີຣ', class: 'text-center' },
        { col: 'ສ່ວນຫຼຸດ', class: 'text-end' },
        { col: 'ລວມເງິນ', class: 'text-end' },
    ]
    useEffect(() => {
        if (token && shopId) {
            fetchSales();
        }
    }, [token, shopId, itemsPerPage, currentPage]);

    return (
        <PageContainer>
            <ol className="breadcrumb float-end">
                <li className="breadcrumb-item fs-5"><Link href="/">ໜ້າຫຼັກ</Link></li>
                <li className="breadcrumb-item fs-5 active">ລາຍການຂາຍຕາມລາຍການສິນຄ້າ</li>
            </ol>
            <h1 className="page-header">ລາຍງານການຂາຍທັງໝົດ</h1>
            <Grid fluid className="row mb-2">
                <Row>
                    <Col xs={12} sm={12} md={6} lg={5} className='mb-3'>
                        <label className="form-label">ວັນທີຂາຍ</label>
                        <DatePicker oneTap value={search.startDate} onChange={value => setSearch({ ...search, startDate: value })} format="dd/MM/yyyy" block />
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={5} className='mb-3'>
                        <label className="form-label">ຫາວັນທີ</label>
                        <DatePicker oneTap value={search.endDate} onChange={value => setSearch({ ...search, endDate: value })} format="dd/MM/yyyy" block />
                    </Col>

                    <Col xs={12} sm={8} md={7} lg={5} className='mb-3'>
                        <label className="form-label">ປະເພດສິນຄ້າ</label>
                        <SelectPicker data={cartgory} value={search.cartgoryid} onChange={value => setSearch({ ...search, cartgoryid: value })} placeholder="ປະເພດສິນຄ້າ" block />
                    </Col>
                    <Col xs={12} sm={7} md={5} lg={4} className='mb-3'>
                        <label className="form-label">ຫົວໜວຍ</label>
                        <SelectPicker data={unit} value={search.uniteid} onChange={value => setSearch({ ...search, uniteid: value })} placeholder="ຫົວໜວຍ" block />
                    </Col>
                    <Col xs={12} sm={7} md={5} lg={4} className='mb-3'>
                        <label className="form-label">ໄຊ້ Size</label>
                        <SelectPicker data={size} value={search.sizeid} onChange={value => setSearch({ ...search, sizeid: value })} placeholder="ໄຊ້ Size" block />
                    </Col>
                    <Col xs={2} sm={2} md={2} lg={1} className='mb-3'>
                        <Button appearance="primary" onClick={fetchSales} color='red' className='mt-4'>ຄົ້ນຫາ</Button>
                    </Col>
                </Row>
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
            <div className="table-responsive">
                <table className={`table table-bordered ${isLoading ? '' : 'table-striped'} table-vcenter js-dataTable-full pagination-holder text-nowrap`}>
                    <thead>
                        <tr>
                            {columns.map((column, index) => (
                                <th key={index} className={column.class}>{column.col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center">
                                    <Placeholder.Grid rows={5} columns={6} active />
                                    <Loader size='lg' content="ກຳລັງໂຫລດຂໍ້ມູນ..." vertical />
                                </td>
                            </tr>
                        ) :
                            itemData.length > 0 ?
                                itemData.map((item, index) => (
                                    <tr key={index}>
                                        <td className="text-center">{index + skipItem + 1}</td>
                                        <td className="text-center">{moment(item.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                                        <td className="text-center">{item.product.sku}</td>
                                        <td>{item.product.productName}</td>
                                        <td>{item.product.brand.brandName}</td>
                                        <td>{item.product.size.sizeName}</td>
                                        <td className="text-end">{numeral(item.price_sales).format('0,0.00')}</td>
                                        <td className="text-center">{item.quantity} {item.product.unit.unitName}</td>
                                        <td className="text-center">{item.free} {item.product.unit.unitName}</td>
                                        <td className="text-end">{item.discount}</td>
                                        <td className="text-end">{numeral(item.price_sales * (item.quantity-item.free)).format('0,0.00')}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={columns.length} className="text-center">
                                            <p className="text-red">============= ບໍ່ມີຂໍ້ມູນການຂາຍ ============</p>
                                        </td>
                                    </tr>
                                )
                        }
                    </tbody>
                    {itemData.length > 0 &&
                        <tfoot >
                            <tr className='border-0'>
                                <td colSpan={9} className="text-end border-0 fs-5">ລວມຍອດຂາຍທັງໝົດ</td>
                                <td className="text-end border">{numeral(sum.discount).format('0,0.00')}</td>
                                <td className="text-end border">{numeral(sum.balanceTotal).format('0,0.00')}</td>
                            </tr>
                        </tfoot>
                    }
                </table>
            </div>
            <NextPages dataTotal={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </PageContainer>
    )
}

export default SaleList