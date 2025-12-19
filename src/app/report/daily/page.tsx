'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer'
import { Col, DatePicker, Grid, InputPicker, Row, Input, SelectPicker, HStack, InputGroup, Loader, Placeholder, Button, Tag, Dropdown } from 'rsuite';
import axios from 'axios';
import { CONFIG } from '@/utils/Config';
import numeral from 'numeral';
import moment from 'moment';
import NextPages from '@/utils/NextPages';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import SearchIcon from '@rsuite/icons/Search';
import { usePage, useTypeSale, useUser, useStatus } from '@/utils/selectOption'
import DocPassIcon from '@rsuite/icons/DocPass';
import BillSales from '@/app/sale/billSales';
import GridIcon from '@rsuite/icons/Grid';
import FileDownloadIcon from '@rsuite/icons/FileDownload';
import { BsFillPrinterFill } from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa6";
const ReportDaily: React.FC = () => {
    const api = CONFIG.URLAPI;
    const token = useToken();
    const shopid = getLocalStorageItem('shopid');

    const [values, setValues] = useState<any>({
        start_date: new Date(),
        end_date: new Date(),
        shopid: shopid,
        typesale: 1,
        userid: '',
        statusoff: '',
    })

    const [isLoading, setIsLoading] = useState(true);
    const [itemData, setItemData] = useState<any[]>([]);
    const [filter, setFilter] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const skipItem = (currentPage - 1) * itemsPerPage;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${api}/billsale/fetch?skip=${skipItem}&limit=${itemsPerPage}`, values, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const dataJson = await response.data;
            if (response.status === 200) {
                setItemData(dataJson.data);
                setFilter(dataJson.data);
                setTotalItems(dataJson.total);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, currentPage, itemsPerPage]);


    const pages = usePage(totalItems);
    const handleFilter = (event: any) => {
        const query = event.toLowerCase();
        setItemData(
            filter.filter(
                n =>
                    n.billno.toLowerCase().includes(query) ||
                    n.billcode.toLowerCase().includes(query)
            )
        );
    };

    const online = useTypeSale();
    const users = useUser();
    const status = useStatus();

    const colomns = [
        { col: 'ລ/ດ', class: 'text-center' },
        { col: 'ວັນທີຂາຍ', class: 'text-center' },
        { col: 'ເລກທີ່ບິນ', class: 'text-center' },
        { col: 'ຍອດທັງໝົດ', class: 'text-end' },
        { col: 'ສ່ວນຫຼຸດ', class: 'text-end' },
        { col: 'ຍອດທີ່ຕ້ອງຈ່າຍ', class: 'text-end' },
        { col: 'ຮັບເງິນສົດ', class: 'text-end' },
        { col: 'ຮັບເງິນໂອນ', class: 'text-end' },
        { col: 'ລວມຍອດຈ່າຍ', class: 'text-end' },
        { col: 'ເງິນທອນ', class: 'text-end' },
        { col: 'ປະເພດຂາຍ', class: 'text-center' },
        ...(values.typesale === 2
            ? [
                { col: 'ຊື່ລູກຄ້າ', class: '' },
                { col: 'ເບີໂທລະສັບ', class: '' },
                { col: 'ບໍລິສັດ', class: '' },
                { col: 'ແຂວງ', class: '' },
                { col: 'ສາຂາ', class: 'text-center' },
                { col: 'COD', class: 'text-end' },
                { col: 'ສະຖານະ', class: 'text-center' },
            ]
            : []
        ),
        { col: 'ພະນັກງານຂາຍ', class: '' },
        { col: 'ສະຖານະ', class: 'text-center' },
    ];
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const [openbill, setOpenbill] = useState(false);
    const [id, setId] = useState<number>(0);
    const handleViewBill = (data: number) => {
        setId(data);
        setOpenbill(true);
    }

    const grouped = itemData.reduce((acc, item) => {
        const countryId = item.countryid;
        if (!acc[countryId]) {
            acc[countryId] = {
                genus: item.country.genus,
                balance_payable: 0,
                discount: 0,
                balanceTotal: 0,
                getCash: 0,
                getTransfer: 0,
                balance_pays: 0,
                refund: 0,
                abbr: item.country.abbr
            };
        }

        acc[countryId].balance_payable += item.balance_payable;
        acc[countryId].discount += item.discount;
        acc[countryId].balanceTotal += item.balanceTotal;
        acc[countryId].getCash += item.getCash;
        acc[countryId].getTransfer += item.getTransfer;
        acc[countryId].balance_pays += item.balance_pays;
        acc[countryId].refund += item.refund;

        return acc;
    }, {});

    return (
        <PageContainer>
            <ol className="breadcrumb float-end fs-5">
                <li className="breadcrumb-item"><Link href={'/'}>ໜ້າຫຼັກ</Link></li>
                <li className="breadcrumb-item active">ລາຍງານການຂາຍປະຈຳວັນ</li>
            </ol>
            <h1 className="page-header fs-3">ລາຍງານການຂາຍປະຈຳວັນ </h1>
            <Grid fluid >
                <Row>
                    <Col span={{ xs: 12, sm: 8, md: 5, lg: 4 }} className='mb-2'>
                        <label htmlFor="" className='form-label'>ວັນທີ</label>
                        <DatePicker oneTap format='dd/MM/yyyy' value={values.start_date} onChange={(e) => setValues({ ...values, start_date: e })} block />
                    </Col>
                    <Col span={{ xs: 12, sm: 8, md: 5, lg: 4 }} className='mb-2'>
                        <label htmlFor="" className='form-label'>ວັນທີ</label>
                        <DatePicker oneTap format='dd/MM/yyyy' value={values.end_date} onChange={(e) => setValues({ ...values, end_date: e })} block />
                    </Col>
                    <Col span={{ xs: 12, sm: 8, md: 4, lg: 4 }} className='mb-2'>
                        <label htmlFor="" className='form-label'>ປະເພດຂາຍ</label>
                        <InputPicker data={online} value={values.typesale} onChange={(e) => setValues({ ...values, typesale: e })} block />
                    </Col>
                    <Col span={{ xs: 12, sm: 8, md: 5, lg: 5 }} className='mb-2'>
                        <label htmlFor="" className='form-label'>ພະນັກງານຂາຍ</label>
                        <SelectPicker data={users} value={values.userid} onChange={(e) => setValues({ ...values, userid: e })} block />
                    </Col>
                    <Col span={{ xs: 12, sm: 8, md: 4, lg: 4 }} className='mb-2'>
                        <label htmlFor="" className='form-label'>ສະຖານະ</label>
                        <SelectPicker data={status} value={values.statusoff} onChange={(e) => setValues({ ...values, statusoff: e })} block />
                    </Col>
                    <Col span={3} className='mb-2'>
                        <Button appearance='primary' color='red' onClick={fetchData} className='mt-4'>ຄົ້ນຫາ</Button>
                        {/* <Button appearance='primary' color='green' className='mt-4 ms-1'><i className="fa-solid fa-download me-1" /> Excel</Button> */}
                        <Dropdown icon={<GridIcon />} placement="bottomEnd" appearance='primary' className='mt-4 ms-1' noCaret>
                            <Dropdown.Item color={'blue'} icon={<BsFillPrinterFill />}>Print Report</Dropdown.Item>
                            <Dropdown.Item color={'green'} icon={<FileDownloadIcon />}>Export Excel</Dropdown.Item>
                            <Dropdown.Item color={'red'} icon={<FaFilePdf />}>Export PDF</Dropdown.Item>
                        </Dropdown>
                    </Col>
                </Row>
            </Grid>
            <Grid fluid className='mb-2 mt-3'>
                <Row className="show-grid">
                    <Col span={{ sm: 8, lg: 4, xs: 6 }}>
                        <HStack>
                            <label className='d-sm-block d-none'>ສະແດງ</label>
                            <InputPicker data={pages} value={itemsPerPage} onChange={(e) => setItemsPerPage(e)} />
                            <label className='d-sm-block d-none'>ລາຍການ</label>
                        </HStack>
                    </Col>
                    <Col span={{ sm: 10, lg: 6, xs: 12 }} push={{ sm: 6, lg: 14, xs: 6 }}>
                        <InputGroup inside>
                            <InputGroup.Addon><SearchIcon /></InputGroup.Addon>
                            <Input placeholder="ຄົ້ນຫາ" onChange={handleFilter} />
                        </InputGroup>
                    </Col>
                </Row>
            </Grid>

            <div className="table-responsive">
                <table className='table table-bordered table-hover table-striped text-nowrap'>
                    <thead>
                        <tr>
                            {colomns.map((item, index) => (
                                <th key={index} className={item.class}>{item.col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={colomns.length} className='text-center'>
                                    <Placeholder.Grid rows={5} columns={6} active />
                                    <Loader size='lg' content='ກໍາລັງສະແດງຂໍ້ມູນ...' />
                                </td>
                            </tr>
                        ) : (
                            itemData.length > 0 ?
                                itemData.map((item, index) => {
                                    const genus = item.country.genus;
                                    return (
                                        <tr key={index}>
                                            <td className='text-center'>{index + 1}</td>
                                            <td className='text-center'>{moment(item.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                                            <td className='text-center' onMouseEnter={() => setHoverIndex(index)}
                                                onMouseLeave={() => setHoverIndex(null)}>
                                                {hoverIndex === index ? (
                                                    <Tag color="orange" onClick={() => handleViewBill(item.bill_uuid)} role="button">
                                                        <DocPassIcon /> {item.billcode}
                                                    </Tag>
                                                ) : (
                                                    item.billcode
                                                )}
                                            </td>
                                            <td className='text-end'>{numeral(item.balance_payable).format('0,0.00')} {genus}</td>
                                            <td className='text-end'>{numeral(item.discount).format('0,0.00')} {genus}</td>
                                            <td className='text-end'>{numeral(item.balanceTotal).format('0,0.00')} {genus}</td>
                                            <td className='text-end'>{numeral(item.getCash).format('0,0.00')} {genus}</td>
                                            <td className='text-end'>{numeral(item.getTransfer).format('0,0.00')} {genus}</td>
                                            <td className='text-end'>{numeral(item.balance_pays).format('0,0.00')} {genus}</td>
                                            <td className='text-end'>{numeral(item.refund).format('0,0')} ₭</td>
                                            <td className='text-center'>{item.typesale === 1 ? "ຂາຍໜ້າຮ້ານ" : "ຂາຍອອນໄລນ໌"}</td>
                                            {values.typesale === 2 && (<>
                                                <td>{item?.transport?.fullnames}</td>
                                                <td>{item?.transport?.phone}</td>
                                                <td>{item?.transport?.company.names}</td>
                                                <td>{item?.transport?.province.provinceName}</td>
                                                <td>{item?.transport?.branch_name}</td>
                                                <td className='text-end'>{numeral(item?.transport?.balance).format('0,0')}</td>
                                                <td className='text-center'>{item?.transport?.status_pay === 1 ? "ຈ່າຍຕົ້ນທາງ" : "ຈ່າຍປາຍທາງ"}</td>
                                            </>)}
                                            <td className='text-center'>{item?.user?.userName}</td>
                                            <td className='text-center py-1'>{item?.statusoff === 1 ? (<span className='text-orange'><i className="fa-solid fa-triangle-exclamation" /> ຄ້າງປິດຍອດ</span>) : (
                                                <span className='text-green'><i className="fa-solid fa-check" /> ຍອດຂາຍແລ້ວ
                                                    <div className='mt-n2'>{moment(item.updatedAt).format('DD/MM/YYYY HH:mm')}</div>
                                                </span>)}</td>
                                        </tr>
                                    )
                                }) : (<tr>
                                    <td colSpan={colomns.length} className='text-center text-red'>====== ບໍ່ມີຂໍ້ມູນການຂາຍ ======</td>
                                </tr>
                                )
                        )}
                    </tbody>
                    <tfoot>
                        {/* SUM GROUP BY COUNTRY */}
                        {itemData.length > 0 &&
                            Object.entries(grouped).map(([countryid, data]: any) => (
                                <tr key={countryid} className="bg-light fs-5 fw-bold">
                                    <td className='text-end' colSpan={3}>ລວມຍອດຂາຍທັງໝົດ: {data.abbr}</td>

                                    <td className="text-end">{numeral(data.balance_payable).format("0,0.00")} {data.genus}</td>
                                    <td className="text-end">{numeral(data.discount).format("0,0.00")} {data.genus}</td>
                                    <td className="text-end">{numeral(data.balanceTotal).format("0,0.00")} {data.genus}</td>
                                    <td className="text-end">{numeral(data.getCash).format("0,0.00")} {data.genus}</td>
                                    <td className="text-end">{numeral(data.getTransfer).format("0,0.00")} {data.genus}</td>
                                    <td className="text-end">{numeral(data.balance_pays).format("0,0.00")} {data.genus}</td>
                                    <td className="text-end">{numeral(data.refund).format("0,0")} ₭</td>

                                    {/* dynamic colSpan ສໍາລັບ columns transport */}
                                    {values.typesale === 2 ? (
                                        <td colSpan={colomns.length - 11}></td>
                                    ) : <td colSpan={3}></td>}
                                </tr>
                            ))}
                    </tfoot>
                </table>
            </div>
            <NextPages dataTotal={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />


            {openbill && (
                <BillSales open={openbill} onClose={() => setOpenbill(false)} billid={id} />
            )}
        </PageContainer>
    )
}

export default ReportDaily