"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconButton, InputGroup, Input, Grid, Row, Col, DateRangePicker, Button, InputPicker, SelectPicker, Loader, Placeholder, HStack } from 'rsuite'
import { setupDate } from '@/utils/formate';
import moment from 'moment';
import PageContainer from '@/components/PageContainer';
import { postApi } from '@/utils/Configs';
import numeral from 'numeral';
import NextPages from '@/utils/NextPages';
import { Notific } from '@/utils/Notification';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import SearchIcon from '@rsuite/icons/Search';
import FromCancel from './FromCancel';
import { usePage, useUser } from '@/utils/selectOption';
const CancleSale: React.FC = () => {
    const shopid = getLocalStorageItem('shopid');
    const token = useToken();
    const [search, setSearch] = useState({
        shopid: shopid,
        billSale: ''
    });
    const [data, setData] = useState<any>('');
    const [loadsearch, setLoadSearch] = useState(false);
    const [open, setOpen] = useState(false);
    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadSearch(true);
        try {
            const res = await postApi(`/billsale/search`, search, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const dataJson = res.data.data;
            if (res.status === 200) {
                setData(dataJson);
                setOpen(true);
            }
        } catch (error) {
            setData('');
            Notific.warning(`ບໍ່ພົບຂໍ້ມູນໃນເລກບິນ ${search.billSale} ນີ້`);
            console.log(error);
        } finally {
            setLoadSearch(false);
        }
    }

    // =============
    const [values, setValues] = useState<any>({
        start_date: new Date(),
        end_date: new Date(),
        shopid: shopid,
        typesale: 1,
        userid: ''
    })

    const [isLoading, setIsLoading] = useState(true);
    const [itemData, setItemData] = useState<any[]>([]);
    const [filter, setFilter] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const offset = (currentPage - 1) * itemsPerPage;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await postApi(`/billsale/fetch/cancel?skip=${offset}&limit=${itemsPerPage}`, values, {
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

    const online = [{
        label: <span className='text-green fs-5'><i className="fa-solid fa-store" /> ຂາຍໜ້າຮ້ານ</span>,
        value: 1
    }, {
        label: <span className='text-orange fs-5'><i className="fa-solid fa-truck" /> ຂາຍອອນໄລນ໌</span>,
        value: 2
    }, {
        label: <span className='text-red fs-5'>All ທັງໝົດ</span>,
        value: ''
    }];
    const users = useUser();
    const colomns = [
        { col: 'ລ/ດ', class: 'text-center' },
        { col: 'ວັນທີຂາຍ', class: 'text-center' },
        { col: 'ວັນທີຍົກເລີກ', class: 'text-center' },
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
    ];

    const [response, setResponse] = useState<any>('');
    useEffect(() => {
        fetchData();
    }, [response, data]);

    const [useSearch, setUseSearch] = useState(false);

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
                {!useSearch ? (
                    <>
                        <li className="breadcrumb-item">
                            <Link href="/">ໜ້າຫຼັກ</Link>
                        </li>
                        <li className="breadcrumb-item active">
                            ຂໍ້ມູນການຍົກເລີກບິນຂາຍ
                        </li>
                        <li className="breadcrumb-item">
                            <IconButton
                                circle
                                icon={<i className="fa-solid fa-search" />}
                                appearance="ghost"
                                color="red"
                                onClick={() => setUseSearch(true)}
                            />
                        </li>
                    </>
                ) : (
                    <li>
                        <form onSubmit={handleSearch}>
                            <InputGroup className='rounded-pill border-red w-400px p-0-5'>
                                <Input placeholder={'ຄົນຫາເລກບິນ'} value={search.billSale} onChange={(value) =>
                                    setSearch({
                                        ...search,
                                        billSale: value.replace(/\s+/g, "")  // ตัดช่องว่างทั้งหมด
                                    })
                                } className='px-3' required />
                                <InputGroup.Button type='submit' appearance='primary' color='red' className='rounded-pill px-4'>{loadsearch ? <Loader /> : <><i className="fa-solid fa-search me-1" /> ຄົນຫາ</>} </InputGroup.Button>
                            </InputGroup>
                        </form>
                        <div role='button' className='mt-n1' onClick={() => setUseSearch(false)}><i className="fa-solid fa-circle-xmark text-red fs-3" /></div>
                    </li>
                )}
            </ol>

            <h1 className="page-header fs-3">ຂໍ້ມູນການຍົກເລີກບິນຂາຍ</h1>
            <br />
            <div className="div">
                <Grid fluid>
                    <Row>
                        <Col span={{ xs: 24, md: 8, lg: 8 }}>
                            <div className="mb-2">
                                <label className="form-label">ວັນທີຍົກເລີກ</label>
                                <DateRangePicker placeholder='ເລືອກວັນທີ' ranges={setupDate}
                                    value={[values.start_date, values.end_date]}
                                    onChange={(value) => {
                                        if (value) {
                                            const [start, end] = value;
                                            setValues({
                                                ...values,
                                                start_date: start,
                                                end_date: end,
                                            });
                                        }
                                    }} block />
                            </div>
                        </Col>
                        <Col span={{ xs: 24, md: 6, lg: 6 }}>
                            <div className="mb-2">
                                <label className="form-label">ປະເພດການຂາຍ</label>
                                <InputPicker data={online} value={values.typesale} onChange={(e) => setValues({ ...values, typesale: e })} placeholder='ເລືອກປະເພດ' block />
                            </div>
                        </Col>
                        <Col span={{ xs: 20, md: 6, lg: 6 }}>
                            <div className="mb-2">
                                <label className="form-label">ພະນັກງານຍົກເລີກ</label>
                                <SelectPicker data={users} value={values.userid} onChange={(e) => setValues({ ...values, userid: e })} placeholder='ເລືອກພະນັກງານ' block />
                            </div>
                        </Col>
                        <Col span={{ xs: 4, md: 6, lg: 'auto' }}>
                            <div className="mb-2 mt-4">
                                <Button appearance='primary' onClick={fetchData} color='red'>ຄົນຫາ</Button>
                                <Button appearance='primary' color='green' className='ms-2'><i className="fa-solid fa-cloud-arrow-down me-1" /> Excel</Button>
                            </div>
                        </Col>
                    </Row>
                </Grid>
            </div>
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
                                            <td className='text-center'>{moment(item.updatedAt).format('DD/MM/YYYY HH:mm')}</td>
                                            <td className='text-center'>{item.billcode}</td>
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
                                    <td className='text-end' colSpan={4}>ລວມຍອດຍົກເລີກທັງໝົດ: {data.abbr}</td>
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
                                    ) : <td colSpan={2}></td>}
                                </tr>
                            ))}

                    </tfoot>
                </table>
            </div>
            <NextPages dataTotal={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />


            {open && <FromCancel open={open} onClose={() => setOpen(false)} data={data} resPonse={setResponse} />}
        </PageContainer>
    )
}

export default CancleSale