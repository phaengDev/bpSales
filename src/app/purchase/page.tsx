'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { Grid, Row, Col, InputGroup, Input, HStack, DatePicker, SelectPicker, Button, InputPicker, Tag ,Placeholder} from 'rsuite';
import { postApi } from '@/utils/Configs';
import { Notific } from '@/utils/Notification';
import { useSupplier } from '@/utils/selectOption';
import moment from 'moment';
import numeral from 'numeral';
import ViewPurchase from './ViewPurchase';
import NextPages from '@/utils/NextPages';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import CheckRoundIcon from '@rsuite/icons/CheckRound';
import RemindFillIcon from '@rsuite/icons/RemindFill';
const PurchasePage: React.FC = () => {
    const suppliers = useSupplier();
    const token = useToken();
    const shopid = getLocalStorageItem('shopid');
    const [values, setValues] = useState<any>({
        startDate: new Date(),
        endDate: new Date(),
        supplierid: '',
        imports: '',
        shopid: shopid
    });


    const [itemData, setItemData] = useState<any[]>([]);
    const [filter, setFilter] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const skipItem = ((currentPage - 1) * itemsPerPage);
    const [totalItems, setTotalItems] = useState(0);

    const fetchPurchases = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await postApi(`/purchase/fetch?skip=${skipItem}&limit=${itemsPerPage}`, values, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const jsonData = response.data;
            setItemData(jsonData.data);
            setFilter(jsonData.data);
            setTotalItems(jsonData.total);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }



    const handleEdit = (data: any) => {
        console.log(data);
    }
    const handleDelete = (id: string) => {
        console.log(data);
    }

    const [hover, setHover] = useState<number | null>(null);
    const [openViews, setOpenViews] = useState(false);
    const [data, setData] = useState<any>(null);


    const handleViews = (data: any) => {
        setOpenViews(true);
        setData(data);
    };

    useEffect(() => {
        if (!token) return; // ✅ รอจน token โหลดเสร็จจาก localStorage
        fetchPurchases();
    }, [shopid, token, currentPage, itemsPerPage])
    const imports = [
        { label: <span className='fs-5 text-green'><CheckRoundIcon/> ຄ້າງຮັບເຂົ້າ</span>, value: 1 },
        { label: <span className='fs-5 text-orange'><RemindFillIcon/> ຄ້າງຮັບເຂົ້າ</span>, value: 2 },
        { label: <span className='fs-5 text-red'><i className="fa-solid fa-circle-xmark"/> ຍົກເລີກ</span>, value: 3 },
    ]
const columns = [
    {class:'w-5 text-center', col:'ລໍາດັບ'},
    {class:'text-center', col:'ວັນທີສັ່ງຊື້'},
    {class:'text-center', col:'ເລກທີ່ສັ່ງຊື້'},
    {class:'', col:'ຜູ້ສະໜອງສິນຄ້າ'},
    {class:'', col:'ເບີໂທລະສັບ'},
    {class:'text-end', col:'ລວມເງິນການສັ່ງຊື້'},
    {class:'text-center', col:'ອາກອນ'},
    {class:'text-end', col:'ສ່ວນຫຼຸດ'},
    {class:'text-end', col:'ລວມຍອດ'},
    {class:'text-center', col:'ສະຖານະ'},
    {class:'', col:'ໝາຍເຫດ'},
    {class:'', col:'ພະນັກງານສັ່ງຊື້'},
    {class:'text-center', col:'ຕັ້ງຄ່າ'},
]
    return (
        <PageContainer>
            <ol className="breadcrumb float-end fs-5">
                <li className="breadcrumb-item"><Link href={'/'} aria-current="page">ໜ້າຫຼັກ</Link></li>
                <li className="breadcrumb-item" role='button'><Link href={'/purchase/form'} className=' text-red'> <i className="fa-solid fa-plus"></i> ອອກໃບສັ່ງຊື້</Link></li>
                <li className="breadcrumb-item active">ລາຍການສັ່ງຊື້ສິນຄ້າ</li>
            </ol>
            <h1 className="page-header">ຂໍ້ມູນການສັ່ງຊື້ສິນຄ້າ</h1>
            <div className="panel">
                <div className="panel-body p-0">
                    <div className="row mb-3">
                        <div className="col-sm-5">
                            <div className="row">
                                <div className="col-6">
                                    <label htmlFor="" className='form-label'>ວັນທີ</label>
                                    <DatePicker oneTap value={values.startDate} onChange={(value) => setValues({ ...values, startDate: value })} format='dd/MM/yyyy' block />
                                </div>
                                <div className="col-6">
                                    <label htmlFor="" className='form-label'>ວັນທີ</label>
                                    <DatePicker oneTap value={values.endDate} onChange={(value) => setValues({ ...values, endDate: value })} format='dd/MM/yyyy' block />
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <label htmlFor="" className='form-label'>ຜູ້ສະໜອງ</label>
                            <SelectPicker
                                data={suppliers}
                                labelKey="name"
                                valueKey="value"
                                placeholder="ຜູ້ສະໜອງ"
                                renderOption={(label, item) => (
                                    <div>{item.icon} {label} ({item.abbr}) </div>
                                )}
                                renderValue={(value, item) => {
                                    if (!item) return value;
                                    return (
                                        <div>
                                            {item.icon} {item.name} ({item.abbr})
                                        </div>
                                    );
                                }}
                                onChange={(e) => setValues({ ...values, supplierid: e })}
                                block
                            />
                        </div>

                        <div className="col-10 col-sm-2">
                            <label htmlFor="" className='form-label'>ສະຖານະ</label>
                            <InputPicker block data={imports}
                                value={values.imports} onChange={(e) => setValues({ ...values, imports: e })} placeholder='ເລືອກ' />
                        </div>
                        <div className="col-2 col-sm-1">
                            <Button appearance='primary' color='red' onClick={fetchPurchases} className='mt-4'>ຄົ້ນຫາ</Button>
                        </div>

                    </div>
                    <Grid fluid>
                        <Row className="show-grid">
                            <Col span={{ xs: 4, sm: 6, md: 4, lg: 4 }}>
                                <HStack className='fs-14px'>
                                    <label htmlFor="" className='d-sm-block d-none'>ສະແດງ</label>
                                    <select className="form-select fs-14px">
                                        <option value={100}>100</option>
                                        <option value={200}>200</option>
                                        <option value={300}>300</option>
                                    </select>
                                    <label htmlFor="" className='d-sm-block d-none'>ລາຍການ</label>
                                </HStack>
                            </Col>
                            <Col span={{ xs: 12, sm: 10, md: 8, lg: 6 }} push={{ xs: 8, sm: 8, md: 12, lg: 14 }}>
                                <InputGroup inside>
                                    <InputGroup.Addon><i className="fa fa-search" /></InputGroup.Addon>
                                    <Input placeholder="ຄົ້ນຫາ ..." />
                                </InputGroup>
                            </Col>
                        </Row>
                    </Grid>
                    <div className="table-responsive mb-2 mt-2">
                        <table className="table table-striped table-bordered text-nowrap mb-0">
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
                                        </td>
                                    </tr>
                                ):
                                itemData.length > 0 ?
                                    itemData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{index + 1}</td>
                                            <td className="text-center">{moment(item.createdAt).format('DD/MM/YYYY')}</td>
                                            <td className="text-center"
                                                onMouseEnter={() => setHover(index)}
                                                onMouseLeave={() => setHover(null)}>
                                                {hover === index ? (
                                                    <Button size="xs" appearance="primary" onClick={() => handleViews(item)}><i className="fa-solid fa-eye me-1" /> {item.billno}</Button>
                                                ) : (
                                                    item.billno
                                                )}</td>
                                            <td>{item?.supplier?.supplierName}</td>
                                            <td>{item?.supplier?.phone}</td>
                                            <td className="text-end">{numeral(item.balance_order).format('0,0.00')}</td>
                                            <td className="text-center">{item.vat}%</td>
                                            <td className="text-end">{numeral(item.discount).format('0,0.00')}</td>
                                            <td className="text-end">{numeral(item.total_orders).format('0,0.00')}</td>
                                            <td className="text-center">
                                                {item.imports === 1 ? (
                                                    <Tag color="orange" >ຄ້າງຮັບເຂົ້າ</Tag>
                                                ) : item.imports === 2 ? (
                                                    <Tag color="green">ຮັບເຂົ້າແລ້ວ</Tag>
                                                ) : (
                                                    <Tag color="red">ຍົກເລີກ</Tag>
                                                )}
                                            </td>
                                            <td>{item.description}</td>
                                            <td>{item.userName}</td>
                                            <td className="text-center">
                                                <button type='button' disabled={item.imports !== 1} className='btn btn-xs btn-green me-1' onClick={() => handleEdit(item)}><i className="fa fa-edit"></i></button>
                                                <button type='button' disabled={item.imports !== 1} className='btn btn-xs btn-danger' onClick={() => handleDelete(item)}><i className="fa-solid fa-trash" /></button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr className="text-center">
                                            <td colSpan={columns.length} className="text-red">============ ບໍ່ມີຂໍ້ມູນການສັ່ງຊື້ =============</td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                    <NextPages dataTotal={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                </div>
            </div>

            {openViews && <ViewPurchase open={openViews} handleClose={() => setOpenViews(false)} data={data} />}
        </PageContainer>
    )
}

export default PurchasePage