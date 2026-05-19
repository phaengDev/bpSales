'use client'
import React, {useEffect, useState } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { SelectPicker, InputPicker, Input, InputGroup, Loader, Grid, Row, Col, HStack, Button } from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import { postApi, deleteApi } from '@/utils/Configs';
import { Notific } from '@/utils/Notification';
import numeral from 'numeral';
import { usePage, useCategory, useBrand, useSizes, useUnite } from '@/utils/selectOption';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import NextPages from '@/utils/NextPages';
import FromAdd from './FromAdd';
const Promotion: React.FC = () => {
    const token = useToken();
    const shopid = getLocalStorageItem('shopid');
    const cartgory = useCategory();
    const size = useSizes();
    const unite = useUnite();

    const [valueData, setValueData] = useState<any>({
        shopid: shopid,
        cartgoryid: '',
        brandid: '',
        sizeid: ''
    });
    const brand = useBrand(valueData.cartgoryid);


    const [itemData, setItemData] = useState<any[]>([]);
    const [filter, setFilter] = useState<any[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const skipItem = ((currentPage - 1) * itemsPerPage);

    const [isLoading, setIsLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);;
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await postApi(`/promotion/many?skip=${skipItem}&limit=${itemsPerPage}`, valueData, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            const dataJson = response.data;
            
            setItemData(dataJson.data);
            setFilter(dataJson.data);
            setTotalItems(dataJson.total);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }


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
        if(!token || !shopid) return
        fetchData();
        setValueData({
            ...valueData,
            shopid: shopid
        })
    }, [itemsPerPage, currentPage,token,shopid]);

    const pages = usePage(totalItems);

    const handleDelete = (id: string) => {
        Notific.confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນນີ້ແທ້ບໍ່?', async () => {
            try {
                const response = await deleteApi('/promotion/ps/' + btoa(id), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                const jsonData = await response.data;
                if (response.status === 200) {
                    Notific.success(jsonData.message);
                    fetchData();
                }
            } catch (error) {
                Notific.error('ລົບຂໍ້ມູນບໍ່ສໍາເລັດ');
                console.error('Error fetching data:', error);
            }
        });
    }

    const [open, setOpen] = useState(false);
    const [data, setData] = useState(null);
    const handleNewForm = () => {
        setOpen(true);
        setData(null);
        setProduct(null);
    }
    const handleEdit = (data: any) => {
        setOpen(true);
        setData(data);
    }
    const [product, setProduct] = useState<any>();
    const handleAdd = async (data: any)=>{
           setOpen(true);
           setProduct(data);
    }

    const columns = [
        { class: 'text-center w-5', col: 'ລຳດັບ' },
        { class: 'text-center w-5', col: 'ຮູບພາບ' },
        { class: 'text-center', col: 'SKU' },
        { class: '', col: 'ລາຍການສິນຄ້າ' },
        { class: 'text-end', col: 'ລາຄາຂາຍ' },
        { class: '', col: 'ປະເພດສິນຄ້າ' },
        { class: '', col: 'ຍີ້ຫໍ້' },
        { class: '', col: 'ຈັດການ' },
    ]

    return (
        <PageContainer>
            <ol className="breadcrumb float-end fs-5">
                <li className="breadcrumb-item"><Link href={"/"}>ໜ້າຫຼັກ</Link></li>
                <li className="breadcrumb-item"><span role='button' onClick={handleNewForm} className="text-blue fs-5"><i className="fa fa-plus"></i> ເພີ່ມໂປຣໂມຊັນ </span></li>
                <li className="breadcrumb-item active">ລາຍການໂປຣໂມຊັນ</li>
            </ol>
            <h1 className="page-header">ລາຍການໂປຣໂມຊັນ</h1>
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
                    <Col span={{ xs: 6, sm: 8, md: 8, lg: 5, xl: 4 }}>
                        <HStack>
                            <label className='d-sm-block d-none'>ສະແດງ</label>
                            <InputPicker data={pages} value={itemsPerPage} onChange={(e) => setItemsPerPage(e)} />
                            <label className='d-sm-block d-none'>ລາຍການ</label>
                        </HStack>
                    </Col>
                    <Col span={{ xs: 10, sm: 8, lg: 6, xl: 6 }} push={{ xs: 8, sm: 8, lg: 13, xl: 14 }}>
                        <InputGroup inside>
                            <InputGroup.Addon><SearchIcon /></InputGroup.Addon>
                            <Input placeholder="ຄົ້ນຫາ" onChange={handleFilter} />
                        </InputGroup>
                    </Col>
                </Row>
            </Grid>
            <div className="table-responsive mb-2 ">
                <table className="table table-hover table-striped table-bordered align-middle text-nowrap">
                    <thead className='text-nowrap'>
                        <tr>
                            {columns.map((item, index) => (
                                <th key={index} className={item.class}>{item.col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className='text-nowrap'>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className='text-center'>
                                    <Loader content="ກຳລັງໂຫລດ..." size='lg' vertical />
                                </td>
                            </tr>
                        ) : itemData.length > 0 ? (
                            itemData.map((item, index) => (<>
                                <tr key={item.product_uuid}>
                                    <td className='text-center'>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className='text-center with-img'>
                                        <img src={item.images ? item.url : './assets/img/icon/picture.jpg'}  className='rounded h-30px my-n1 mx-n1' />
                                    </td>
                                    <td className='text-center'>{item.sku}</td>
                                    <td>{item.productName}</td>
                                    <td className='text-end'>{ numeral(item.sellPrices).format('0,0.00')}</td>
                                    <td className=''>{item.brand.category.cateName}</td>
                                    <td className=''>{item.brand.brandName}</td>
                                    <td className='text-center'>
                                      <button type='button' className='btn btn-xs btn-red' onClick={() => handleDelete(item.product_uuid)}><i className="fa fa-trash" /></button>
                                      <button type='button' className='btn btn-xs btn-green ms-1' onClick={() => handleAdd(item)}><i className="fa fa-plus" /></button>
                                    </td>
                                </tr>
                                {item.proms.map((val: any, key: number) => (
                                <tr key={key} className='py-1'>
                                    <td className='text-center'>{index +1}/{key + 1}</td>
                                    <td className='text-center'>{key + 1}</td>
                                    <td className='text-end'>ຈຳນວນຊື້:</td>
                                    <td>{val.qty_buy} {item.unit.unitName}</td>
                                    <td  className='text-end'>ຈຳນວນແຖມ</td>
                                    <td colSpan={2}>{val.qty_free} {item.unit.unitName}</td>
                                    <td className='text-center'>
                                          <button type='button' className='btn btn-xs btn-orange me-1' onClick={() => handleEdit(item)}><i className="fa fa-pencil" /></button>
                                      <button type='button' className='btn btn-xs btn-red' onClick={() => handleDelete(item.user_uuid)}><i className="fa fa-trash" /></button>
                                    </td>
                                </tr>
                                ))}
                           </> ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className='text-center text-red'> ======== ບໍ່ພົບຂໍ້ມູນທີ່ມີການບັນທຶກ =========</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
           <NextPages dataTotal={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      
      
      {open && <FromAdd open={open} onClose={() => setOpen(false)} data={data} resPonse={fetchData} product={product} />}
        </PageContainer>
    )
}

export default Promotion