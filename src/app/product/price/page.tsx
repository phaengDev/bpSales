'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import FormAdd from './FormAdd';
import axios from 'axios';
import { CONFIG } from '@/utils/Config';
import numeral from 'numeral';
import SearchIcon from '@rsuite/icons/Search';
import { Button, Placeholder, Input, InputGroup, SelectPicker, Loader, Grid, Row, Col, HStack, InputPicker } from 'rsuite';
import { useCategory, useBrand, useSizes, useUnite, usePage } from '@/utils/selectOption';
import ViewImage from '../ViewImage';
import FormEdit from './FormEdit';
import { Notific } from '@/utils/Notification';
import NextPages from '@/utils/NextPages';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
const PriceSale: React.FC = () => {
    const api = CONFIG.URLAPI;
    const token = useToken();
    const shopid = getLocalStorageItem('shopid');
    const [open, setOpen] = useState(false);
    const [data, setData] = useState(null);
    const image = '@/assets/img/icon/picture.jpg'
    const handleNewForm = async () => {
        setOpen(true);
        setData(null);
    }
    const [valueData, setValueData] = useState<any>({
        shopid: shopid,
        cartgoryid: '',
        brandid: '',
        sizeid: ''
    });


    const cartgory = useCategory();
    const brand = useBrand(valueData.cartgoryid);
    const size = useSizes();
    const unite = useUnite();

    const [itemData, setItemData] = useState<any[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const skipItem = ((currentPage - 1) * itemsPerPage);

    const [isLoading, setIsLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);;
    const [filter, setFilter] = useState<any[]>([]);
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${api}/price/fetch?skip=${skipItem}&limit=${itemsPerPage}`, valueData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const jsonData = response.data;
            setItemData(jsonData.data);
            setFilter(jsonData.data);
            setTotalItems(jsonData.total);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const pages = usePage(totalItems);

    const handleFilter = (value: string) => {
        const query = value.toLowerCase();
        setItemData(
            filter.filter(
                n =>
                    n.sku.toLowerCase().includes(query) ||
                    n.productName.toLowerCase().includes(query)
            )
        );
    }

    useEffect(() => {
        if (shopid && token) {
            fetchData();
        }
    }, [shopid, token, currentPage, itemsPerPage]);

    // const handleEdit = (data: any) => {
    //     setOpen(true);
    //     setData(data);
    // }

    const handleDelete = (id: string) => {
        Notific.confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນນີ້ແທ້ບໍ່?', async () => {
            try {
                const response = await axios.delete(api + '/price/product/' + btoa(id), {
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

    const [show, setShow] = useState(false);
    const [dataImage, setDataImage] = useState<any>(null);
    const handleViewImage = (item: any) => {
        setDataImage({
            image: item.images,
            url: item.url,
            id: item.product_uuid,
        });
        setShow(true);
    }
    // ============================
    const [openEdit, setOpenEdit] = useState(false);
    const [dataEdit, setDataEdit] = useState<any>(null);
    const handleEditPrice = (data: any) => {
        setOpenEdit(true);
        setDataEdit(data);
    }

    const handleDeletePrice = async (id: string) => {
        Notific.confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນນີ້ແທ້ບໍ່?', async () => {
            try {
                const response = await axios.delete(api + `/price/${btoa(id)}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (response.status === 200) {
                    setResponse(response.data.data);
                    Notific.success(response.data.message);
                }
            } catch (error) {
                Notific.error('ບໍ່ສາມາດລົບຂໍ້ມູນນີ້ໄດ້');
                console.error('Error fetching data:', error);
            }
        });
    }


    const [response, setResponse] = useState(null);
    useEffect(() => {
        if (response) {
            fetchData();
        }
    }, [response]);


    return (
        <PageContainer>
            <ol className="breadcrumb float-end fs-5">
                <li className="breadcrumb-item"><Link href={"/"}>ໜ້າຫຼັກ</Link></li>
                <li className="breadcrumb-item"><span role='button' onClick={handleNewForm} className="text-blue fs-5"><i className="fa fa-plus"></i>ເພີ່ມລາຄາສົ່ງ </span></li>
                <li className="breadcrumb-item active">ລາຍການລາຄາສົ່ງ</li>
            </ol>
            <h1 className="page-header">ລາຍການສິນຄ້າລາຄາສົ່ງ</h1>
            <div className="panel">
                <div className="panel-body p-0">
                    <div className="row mb-3">
                        <div className="col-sm-4 col-md-3  mb-2">
                            <label htmlFor="" className='form-label'>ໝວດສິນຄ້າ</label>
                            <SelectPicker data={cartgory} onChange={(index) => setValueData({ ...valueData, cartgoryid: index })} block placeholder="ໝວດສິນຄ້າ" />
                        </div>
                        <div className="col-sm-4 col-md-3 col-6 mb-2">
                            <label htmlFor="" className='form-label'>ປະເພດ /ຍີ່ຫໍ້</label>
                            <SelectPicker data={brand} onChange={(index) => setValueData({ ...valueData, brandid: index })} block placeholder="ປະເພດ /ຍີ່ຫໍ້" />
                        </div>
                        <div className="col-sm-3 col-md-2 col-6 mb-2">
                            <label htmlFor="" className='form-label'>ໄຊ້</label>
                            <SelectPicker data={size} onChange={(index) => setValueData({ ...valueData, sizeid: index })} block placeholder="ໄຊ້" />
                        </div>
                        <div className="col-sm-2">
                            <label htmlFor="" className='form-label'>ຫົວໜ່ວຍ</label>
                            <InputPicker data={unite} value={valueData.uniteid} onChange={(e) => setValueData({ ...valueData, uniteid: e })} block placeholder='ເລືອກ' />
                        </div>
                        <div className="col-sm-2 col-md-1 col-3 mb-2">
                            <Button color='red' onClick={fetchData} appearance="primary" className='mt-4' ><i className='fas fa-search' /> ຄົ້ນຫາ</Button>
                        </div>

                    </div>
                    <Grid fluid className='mb-2'>
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
                                    <Input placeholder="ຄົ້ນຫາ" onChange={handleFilter} />
                                </InputGroup>
                            </Col>
                        </Row>
                    </Grid>
                    <div className="table-responsive mb-2 ">
                        <table className={`table ${!isLoading && 'table-striped '} table-bordered text-nowrap mb-0 `}>
                            <thead>
                                <tr>
                                    <th className='text-center w-5'>ລ/ດ</th>
                                    <th className='text-center w-5'>ຮູບ</th>
                                    <th>ລະຫັດ</th>
                                    <th>ຊື່ສິນຄ້າ</th>
                                    <th>ໄຊ້</th>
                                    <th>ຍີ່ຫໍ້</th>
                                    <th className='text-end'>ລາຄາຂາຍ</th>
                                    <th>ຫົວໜ່ວຍ</th>
                                    <th>ປະເພດ</th>
                                    <th className='text-center w-5'>ຕັ້ງຄ່າ</th>
                                </tr>
                            </thead>
                            <tbody className='text-nowrap fs-5'>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={16} className='text-center'>
                                            <Placeholder.Grid rows={5} columns={6} active />
                                            <Loader size='lg' center content="ກຳລັງໂຫຼດ...." vertical />
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {itemData.length > 0 ? (
                                            itemData.map((item, index) =>
                                                <tr key={index}>
                                                    <td className='text-center'>{index + 1}</td>
                                                    <td className='text-center'>
                                                        <img src={`${!item.images ? image : item.url}`} className="rounded h-30px" onClick={() => handleViewImage(item)} role='button' />
                                                    </td>
                                                    <td>{item.sku}</td>
                                                    <td>{item.productName}</td>
                                                    <td>{item?.size?.sizeName}</td>
                                                    <td>{item?.brand.brandName}</td>
                                                    <td className='text-end'>
                                                        <strong className='fw-bold text-red'>ລາຄາຫຼັກ: {numeral(item.sellPrices).format('0,0.00')}</strong>
                                                        {item.price.map((item: any, index: number) => (
                                                            <div key={index} className='price-item'>
                                                                <div>{item.typeName} : {numeral(item.prices).format('0,0.00')}
                                                                    <a href="#" data-bs-toggle="dropdown" className="btn btn-xs btn-green rounded-pill action-btn  dropdown-toggle"><i className="fa fa-caret-down"></i></a>
                                                                    <div key={index} className="dropdown-menu w-50px dropdown-menu-end">
                                                                        <button onClick={() => handleDeletePrice(item.price_uuid)} className="dropdown-item text-red"> <i className="fa-solid fa-trash me-2" />ລົບ</button>
                                                                        <button onClick={() => handleEditPrice(item)} className="dropdown-item text-green"><i className="fa-solid fa-pen-to-square me-2" /> ແກ້ໄຂ</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td>{item?.unit?.unitName}</td>
                                                    <td>{item?.brand?.category?.cateName}</td>
                                                    <td className='text-center'>
                                                        <span role='button' onClick={() => handleDelete(item.product_uuid)} className="btn btn-red btn-xs "><i className="fa fa-trash"></i></span>
                                                    </td>

                                                </tr>
                                            )) : (
                                            <tr className='border-0'>
                                                <td colSpan={16} className='text-center border-0 text-red'>
                                                    <img src={'../assets/img/icon/ic_no_result.svg'} className="rounded w-25" />
                                                    <div>ບໍ່ພົບຂໍ້ມູນທີ່ມີການບັນທຶກ</div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <NextPages dataTotal={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                </div>
            </div>
            {open &&
                <FormAdd show={open} handleClose={() => setOpen(false)} item={data} resPonse={setResponse} />
            }
            {show &&
                <ViewImage show={show} handleClose={() => setShow(false)} item={dataImage} resPonse={setResponse} />
            }

            {openEdit &&
                <FormEdit open={openEdit} handleClose={() => setOpenEdit(false)} data={dataEdit} resPonse={setResponse} />
            }
        </PageContainer>
    )
}

export default PriceSale