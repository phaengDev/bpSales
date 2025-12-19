'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { Grid, Row, Col, Input, InputGroup, HStack, InputPicker, SelectPicker, Button, Placeholder, Loader, Toggle, Popover, Whisper, ButtonToolbar, IconButton } from 'rsuite';
import FormProduct from './FormProduct';
import axios from 'axios';
import { usePage, useCategory, useBrand, useUnite, useSizes } from '../../utils/selectOption';
import { CONFIG } from '../../utils/Config';
import { Notific } from '../../utils/Notification';
import numeral from 'numeral';
import ViewImage from './ViewImage';
import NextPages from '../../utils/NextPages';
import SearchIcon from '@rsuite/icons/Search';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
// import ExpandOutlineIcon from '@rsuite/icons/ExpandOutline';
import PlusIcon from '@rsuite/icons/Plus';
import EditIcon from '@rsuite/icons/Edit';
import TrashIcon from '@rsuite/icons/Trash';
import AddPricebyProduct from './price/AddPricebyProduct';
const ProductPage: React.FC = () => {
    const api = CONFIG.URLAPI;

    const shopid = getLocalStorageItem('shopid') || null;
    const token = useToken();

    const [open, setOpen] = useState(false);
    const [data, setData] = useState(null);
    const handleNewForm = () => {
        setOpen(true);
        setData(null);
    }
    const handleEdit = (data: any) => {
        setOpen(true);
        setData(data);
    }


    const [searchTerm, setSearchTerm] = useState<any>({
        shopid: shopid,
        categoriesid: "",
        brandid: "",
        uniteid: "",
        sizeid: ""
    });
    const dataCategory = useCategory();
    const dataUnite = useUnite();
    const dataSizes = useSizes();
    const dataBrand = useBrand(searchTerm.categoriesid);

const [isLoading, setLoading] = useState(true);
const [itemData, setItemData] = useState<any[]>([]);
const [filter, setFilter] = useState<any[]>([]);
const [totalItems, setTotalItems] = useState(0);
const [itemsPerPage, setItemsPerPage] = useState(25);
const [currentPage, setCurrentPage] = useState(1);
const skipItem = (currentPage - 1) * itemsPerPage;

const fetchProduct = async () => {
  setLoading(true);
  try {
    const response = await axios.post(`${api}/product/fetch?skip=${skipItem}&limit=${itemsPerPage}`, searchTerm, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const jsonData = await response.data;
    setItemData(jsonData.data);
    setFilter(jsonData.data);
    setTotalItems(jsonData.total);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setLoading(false);
  }
};



    const pages = usePage(totalItems);
    const handleFilter = (event: any) => {
        const query = event.toLowerCase();
        setItemData(
            filter.filter(
                n =>
                    n.sku.toLowerCase().includes(query) ||
                    n.productName.toLowerCase().includes(query)
            )
        );
    };


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

    const handleStatus = (id: string, sts: number) => {
        const newStatus = sts === 1 ? 2 : 1;
        axios.put(api + `/product/status/${id}/${newStatus}`).then(function (resp) {
            if (resp.status === 200) {
                setResponse(resp.data.data);
                Notific.success(resp.data.message);
            }
        })
            .catch((error) => {
                console.error('Error updating status:', error);
                Notific.error('Failed to update status. Please try again later.');
            });
    }

    const handleDelete = async (id: string) => {
        Notific.confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນນີ້ແທ້ບໍ່?', async () => {
            try {
                const response = await axios.delete(api + '/product/' + btoa(id), {
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

    // ========== Modal ==========
    const [openPrice, setOpenPrice] = useState(false);
    const [dataPrice, setDataPrice] = useState<any>(null);
    const [main, setMain] = useState<any>(null);
    const handleOpenPrice = (main: any, data: any,) => {
        setOpenPrice(true);
        setDataPrice(data);
        setMain(main);
    };

const deletePrice = (id: string) => {
    Notific.confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນນີ້ແທ້ບໍ່?', async () => {
        try {
            const response = await axios.delete(api + '/price/' + btoa(id), {
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



    const [response, setResponse] = useState(null);
    useEffect(() => {
        if (token && shopid) {
            fetchProduct();
        }
    }, [response, token, currentPage, itemsPerPage]);

    const columns = [
        { class: 'text-center w-5', col: 'ລຳດັບ' },
        { class: 'text-center', col: 'ຮູບ' },
        { class: 'text-center', col: 'ບາໂຄດ' },
        { class: 'text-center', col: 'SKU' },
        { class: '', col: 'ຊື່ສິນຄ້າ' },
        { class: 'text-end', col: 'ລາຄາຕົ້ນທຶນ' },
        { class: 'text-end', col: 'ລາຄາຂາຍ' },
        { class: 'text-center w-5', col: 'ຈຳນວນ' },
        { class: '', col: 'ຫົວໜ່ວຍ' },
        { class: '', col: 'ໄຊ້' },
        { class: '', col: 'ຍີ່ຫໍ້' },
        { class: '', col: 'ປະເພດ' },
        { class: '', col: 'ໝາຍເຫດ' },
        { class: 'text-center w-5', col: 'ສະຖານະ' },
        { class: 'text-center w-5', col: 'ຕັ້ງຄ່າ' }
    ]

    const renderPopover = (item: any) => (
        <Popover title={`ລາຄາຂາຍ: ${numeral(item.sellPrices).format('0,0')} ₭`}>
            <table className='table table-sm table-borderless text-nowrap'>
                <tbody>
                    {item.price.map((val: any, index: number) => (
                        <React.Fragment key={index}>
                            <tr className='fs-5'>
                                <td className='text-end'>  {val.typeName} : </td>
                                <td>{numeral(val.prices).format('0,0')} ₭</td>
                                <td className='text-center'>
                                    <button onClick={() => handleOpenPrice(item, val)} className='btn btn-green btn-icon btn-sm me-1 ms-3'><EditIcon /></button>
                                    <button onClick={()=>deletePrice(val.price_uuid)} className='btn btn-red btn-icon btn-sm'><TrashIcon /></button></td>
                            </tr>
                        </React.Fragment>
                    ))}

                </tbody>
            </table>
            <Button color="green" appearance="ghost" size='sm' onClick={() => handleOpenPrice(item, null)} className='mt-1' block><PlusIcon />  ເພີ່ມລາຄາຂາຍ</Button>
        </Popover>
    );
    return (
        <PageContainer>
            <ol className="breadcrumb float-end fs-5">
                <li className="breadcrumb-item"><Link href={'/'}>ໜ້າຫຼັກ</Link></li>
                <li className="breadcrumb-item"><span role='button' onClick={handleNewForm} className="text-blue fs-5"><i className="fa fa-plus"></i> ເພີ່ມລາຍການ</span></li>
                <li className="breadcrumb-item active">ລາຍການສິນຄ້າ</li>
            </ol>
            <h1 className="page-header">ຂໍ້ມູນສິນຄ້າ </h1>
            <div className="panel">
                <div className="panel-body p-0">
                    <div className="row mb-3">
                        <div className="col-sm-3">
                            <label htmlFor="" className='form-label'>ປະເພດສິນຄ້າ</label>
                            <SelectPicker data={dataCategory} value={searchTerm.categoriesid} onChange={(e) => setSearchTerm({ ...searchTerm, categoriesid: e })} block placeholder='ເລືອກ' />
                        </div>
                        <div className="col-sm-3">
                            <label htmlFor="" className='form-label'>ຍີ່ຫໍ້ສິນຄ້າ</label>
                            <SelectPicker data={dataBrand} value={searchTerm.brandid} onChange={(e) => setSearchTerm({ ...searchTerm, brandid: e })} block placeholder='ເລືອກ' />
                        </div>
                        <div className="col-sm-2">
                            <label htmlFor="" className='form-label'>ໄຊ້ (Size)</label>
                            <InputPicker data={dataSizes} value={searchTerm.sizeid} onChange={(e) => setSearchTerm({ ...searchTerm, sizeid: e })} block placeholder='ເລືອກ' />
                        </div>
                        <div className="col-sm-2">
                            <label htmlFor="" className='form-label'>ຫົວໜ່ວຍ</label>
                            <InputPicker data={dataUnite} value={searchTerm.uniteid} onChange={(e) => setSearchTerm({ ...searchTerm, uniteid: e })} block placeholder='ເລືອກ' />
                        </div>
                          
                        <div className="col-sm-2">
                            <Button appearance="primary" onClick={fetchProduct} className='mt-4'>ຄົ້ນຫາ</Button>
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
                    <div className="table-responsive mt-2">
                        <table className={`table ${!isLoading && 'table-striped'} table-bordered align-middle text-nowrap`}>
                            <thead>
                                <tr>
                                    {columns.map((item, index) => (
                                        <th key={index} className={item.class}>{item.col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className='fs-5'>
                                {isLoading === true ? (
                                    <tr>
                                        <td colSpan={columns.length} className='text-center'>
                                            <Placeholder.Grid rows={5} columns={6} active />
                                            <Loader size='lg' center content="ກຳລັງໂຫຼດ...." vertical />
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {itemData.length > 0 ? (
                                            itemData.map((item, key) =>
                                                <tr key={key}>
                                                    <td className='text-center'>{key + 1}</td>
                                                    <td className='text-center'>
                                                        <img src={`${item.images === '' || item.images === null ? '../assets/img/icon/picture.jpg' : item.url}`} className="rounded h-30px" onClick={() => handleViewImage(item)} role='button' />
                                                    </td>
                                                    <td className='text-center'>{item.barcode}</td>
                                                    <td className='text-center'>{item.sku}</td>
                                                    <td className=''>{item.productName}</td>
                                                    <td className='text-end'>{numeral(item.buyPrices).format('0,00')}</td>
                                                    <td className='text-end'>{numeral(item.sellPrices).format('0,00')}
                                                        <Whisper placement="top" trigger="hover" controlId="control-id-hover" enterable speaker={renderPopover(item)}>
                                                            <span role="button" className="p-1 ms-1"><i className="fa-solid fa-kip-sign" /></span>
                                                        </Whisper>
                                                    </td>
                                                    <td className='text-center'>{item.quantity}</td>
                                                    <td className='text-center'>{item.unit.unitName}</td>
                                                    <td className='text-center'>{item.size.sizeName}</td>
                                                    <td className=''>{item?.brand?.brandName}</td>
                                                    <td className=''>{item?.brand?.category.cateName}</td>
                                                    <td className=''>{item.descripiton}</td>
                                                    <td className='text-center'><Toggle checkedChildren="ເປິດ" unCheckedChildren="ປິດ" checked={item.status === 1 ? true : false} onChange={() => handleStatus(item.product_uuid, item.status)} /></td>
                                                    <td className='text-center'>
                                                        <button type='button' onClick={() => handleEdit(item)} className='btn btn-xs btn-blue me-2'><i className="fa-solid fa-pen-to-square" /></button>
                                                        <button type='button' onClick={() => handleDelete(item.product_uuid)} className='btn btn-xs btn-danger'><i className="fa-solid fa-trash" /></button>

                                                    </td>
                                                </tr>
                                            )) : (
                                            <tr className='border-0'>
                                                <td colSpan={columns.length} className='text-center border-0 text-red'>
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
                <FormProduct open={open} handleClose={() => setOpen(false)} data={data} resPonse={setResponse} />
            }
            {show &&
                <ViewImage show={show} handleClose={() => setShow(false)} item={dataImage} resPonse={setResponse} />
            }
            {openPrice &&
                <AddPricebyProduct open={openPrice} handleClose={() => setOpenPrice(false)} data={dataPrice} dataMain={main} resPonse={setResponse} />
            }
        </PageContainer>
    )
}

export default ProductPage