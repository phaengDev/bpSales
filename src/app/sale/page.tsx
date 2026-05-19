'use client'
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Input, InputGroup, IconButton, Grid, Row, Col, Placeholder, Loader, Box, Badge } from 'rsuite';
import FormPaySales from './FormPaySales';
import FormOrder from './FormOrder';
import { postApi, getApi, putApi, deleteApi } from '../../utils/Configs';
import { useCategory } from '../../utils/selectOption';
import numeral from 'numeral';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import BillSales from './billSales';
import Payonline from './Payonline';
import EditIcon from '@rsuite/icons/Edit';
import FromSearch from '../cancel/FromSearch';
import { Notific } from '@/utils/Notification';
import ViewPrice from './ViewPrice';
interface Product {
    product_uuid: string
    productName: string
    sku: string
    brandid: number
    sellPrices: number
    stock: number
    quantity: number
    images: string | null
    url:string
    unit:{
        unitName:string
    }
}

// interface CartItem {
//     cart_uuid: string
//     product_id_fk: string
//     productName: string
//     salePrices: number
//     quantity: number | string | null
//     images: string | null
// }
const SalesPage: React.FC = () => {
    const images = '@/assets/img/icon/picture.jpg';
    const token = useToken();
    const shopsId = getLocalStorageItem('shopid');
    const userid = getLocalStorageItem('user_uuid');

    const category = useCategory();
    // const shopName = getLocalStorageItem('shopName') || '';
    // const userName = getLocalStorageItem('userName') || '';
    const [sumTotal, setSumTotal] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);
    const [openPay, setOpenPay] = useState(false);
    const [data, setData] = useState(null);

    const handleOrder = (data: any) => {
        setOpen(true);
        setData(data);
    }
    const [dataSale, setDataSale] = useState<any>({
        dataOrder: [],
        total: 0
    });

    // ============================== KEYBOARD SHORTCUT ==============================
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'f') {
                event.preventDefault()
                inputRef.current?.focus()
            } else if (event.ctrlKey && event.key === 'e') {
                event.preventDefault()
                if (inputRef.current) inputRef.current.value = ''
                inputRef.current?.focus()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])


    const [values, setValues] = useState({
        shopid: shopsId,
        brandid: '',
        categorieid: '',
    })

    const [product, setProduct] = useState<Product[]>([])
    const [filter, setFilter] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage] = useState(1);
    const offset = (currentPage - 1) * itemsPerPage;
    const showProduct = async () => {
        if (!token || !shopsId) return;
        try {
            setIsLoading(true);
            const response = await postApi(`/product/sales?skip=${offset}&limit=${itemsPerPage}`, values,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            const jsonData = response.data;
            setProduct(jsonData?.data || [])
            setFilter(jsonData?.data || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const handleScroll = () => {
            const bottom =
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight;

            if (bottom) {
                setItemsPerPage((prev) => prev + 25);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    // ✅ useEffect โหลดข้อมูลเมื่อค่าเปลี่ยน
    useEffect(() => {
        if (!token || !shopsId) return;
        showProduct();
    }, [values, shopsId, token])

    const [categoryId, setCategoryId] = useState(null);
    const handleSearch = (index: any) => {
        setCategoryId(index);
        setValues({
            ...values,
            categorieid: index,
        });
    };


    const handleFilter = (event: any) => {
        const query = event.toLowerCase();
        setSearch({
            ...search,
            barcode: query,
        });
        setProduct(
            filter.filter(
                n =>
                    n.sku.toLowerCase().includes(query) ||
                    n.productName.toLowerCase().includes(query)
            )
        );
    };
    // =======get order by search ========
    const [search, setSearch] = useState({
        userbyid: userid,
        shopsid: shopsId,
        barcode: ''
    });
    const getOrder = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!token || !shopsId || !search.barcode) {
            Notific.warning("Please scan or enter barcode");
            return;
        }
        try {
            const response = await postApi(`/order/getsale`, search,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const { data, message } = response.data;
            Notific.success(message || "Order added successfully");
            setResponse(data);
            setSearch(prev => ({
                ...prev,
                barcode: ''
            }));
            setProduct(
                filter.filter(
                    n =>
                        n.sku.toLowerCase().includes('') ||
                        n.productName.toLowerCase().includes('')
                )
            );
        } catch (error: any) {
            console.error("Error fetching data:", error);

            const msg =
                error?.response?.data?.message ||
                "Failed to add order";

            Notific.error(msg);
        }
    };


    // ============================== FETCH CART ==============================
    const [itemOrder, setItemOrder] = useState<any[]>([])
    const fetchOrder = async () => {
        if (!shopsId || !token) return;
        try {
            const response = await getApi(`/order/fetch/${userid}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const jsonData = await response.data;
            setItemOrder(jsonData.data);
            const total = jsonData.data.reduce(
                (sum: number, item: any) => sum + (Number(item.quantity) * Number(item.salePrices)),
                0
            )
            setSumTotal(total)
        } catch (error) {
            console.error('Error fetching orders:', error)
        }
    }
    useEffect(() => {
        if (!userid || !token) return
        fetchOrder();
    }, [userid, token])
    // =============================== PLUS CART ==============================
    const handlePlus = async (id: string) => {
        try {
            const response = await putApi('/order/plus/' + btoa(id), {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (response.status === 200) {
                setResponse(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    // ================================ MINUS CART ==============================
    const handleMinus = async (id: string) => {
        try {
            const response = await putApi('/order/minus/' + btoa(id), {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (response.status === 200) {
                setResponse(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    // =============================== DELETE CART ==============================
    const handleDelete = async (id: string) => {
        try {
            const response = await deleteApi('/order/' + btoa(id), {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (response.status === 200) {
                setResponse(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    // =============================== NEW FORM PAY ==============================
    const handleNewFormPay = () => {
        setOpenPay(true);
        setDataSale({
            dataOrder: itemOrder,
            total: sumTotal
        });
    }
    const [response, setResponse] = useState(null);
    useEffect(() => {
        fetchOrder();
        if (response) {
            fetchOrder();
        }
    }, [response]);
    // =============================== GET LOCALSTORAGE ==============================
    const [shopName, setShopName] = useState("");
    const [userName, setUserName] = useState("");
    useEffect(() => {
        const value = getLocalStorageItem("shopName");
        if (value) setShopName(value);

        const value2 = getLocalStorageItem("userName");
        if (value2) setUserName(value2);
    }, []);
    // =============================== PRINT BILL ==============================
    const [openBill, setOpenBill] = useState(false);
    const [billid, setBillid] = useState(0);
    const printBill = () => {
        setOpenBill(true);
    }

    useEffect(() => {
        if (billid) {
            setOpenBill(true);
        }
    }, [billid])
    // =============================== PAY ONLINE ==============================
    const handlePayonline = () => {
        setDataSale({
            dataOrder: itemOrder,
            total: sumTotal
        });
        setOpenOnline(true);
    }
    const [openOnline, setOpenOnline] = useState(false);
    // ============ show price====
    const [price, setPrice] = useState<any[]>([]);
    const [openPrice, setOpenPrice] = useState(false);
    const viewPrice = async(data:any)=>{
        setPrice(data);
        setOpenPrice(true);
    }

    // ============ search Cancel Sale====
    const [openCancel, setOpenCancel] = useState(false);
    const searchCancelSale = () => {
        setOpenCancel(true);
    }
    return (
        <div id="app" className="app app-content-full-height app-without-sidebar app-without-header" >
            <div id="content" className="app-content p-0">
                <div className="pos pos-with-menu pos-with-sidebar" id="pos">
                    <div className="pos-menu border-end border-gray-300 ">
                        <div className="logo">
                            <Link href="/">
                                <div className="logo-img">
                                    <img src="../assets/img/logo/PLC.png" alt="" />
                                </div>
                                <div className="logo-text">{shopName ? shopName : 'ຮ້ານຂາຍເຄື່ອງທົວໄປ'}</div>
                            </Link>
                        </div>
                        <div className="nav-container">
                            <div data-scrollbar="true" data-height="100%" data-skip-mobile="true">
                                <ul className="nav nav-tabs">
                                    <li className="nav-item">
                                        <button type='button' className={`nav-link w-100  ${categoryId === null && 'active'}`} onClick={() => handleSearch(null)} data-filter="all">
                                            <div className="nav-icon">
                                                <i className="fa-solid fa-layer-group" />
                                            </div>
                                            <div className="nav-text">ທັງໝົດ</div>
                                        </button>
                                    </li>

                                    {category.map((item, index) => (
                                        <li key={index} className="nav-item">
                                            <button type='button' className={`nav-link w-100 ${categoryId == item.value ? 'active' : ''}`} onClick={() => handleSearch(item.value)} data-filter={item.value}>
                                                <div className="nav-icon">
                                                    <i className="fa-solid fa-boxes-stacked" />
                                                </div>
                                                <div className="nav-text fs-bold">{item.label}</div>
                                            </button>
                                        </li>
                                    ))}

                                </ul>
                            </div>
                        </div>
                        <div className="logo text-center d-sm-block d-none p-0" >
                            <Box c="white" bg="linear-gradient(45deg, #f23d1dff, #2196F3)" className='rounded-top-3 ' p={5}>
                                <Badge content={990} shape="rectangle">
                                    <div className="logo-img">
                                        <img src="../assets/img/icon/bill-checkout.png" alt="" />
                                    </div>
                                </Badge>
                                <div className="logo-text fs-4 text-white">ຍອດຂາຍ</div>
                            </Box>
                        </div>
                    </div>
                    {/* END pos-menu */}
                    {/* BEGIN pos-content */}
                    <div className="pos-content">
                        <div className='sticky-top bg-none  px-1 p-1 mb-2 rounded-3 nav-container' >
                            <Grid fluid>
                                <Row>
                                    <Col span={{ xs: 2, sm: 2, md: 1.5 }} className=' d-sm-block d-none'>
                                        <IconButton size='lg' icon={<i className="fa-solid fa-arrow-left" />} onClick={() => window.location.href = '/'} appearance="ghost" color='red' />
                                    </Col>
                                    <Col span={{ md: 22, xs: 'auto' }}>
                                        <form onSubmit={getOrder}>
                                            <InputGroup inside size='lg' className='border-red'>
                                                <Input ref={inputRef} onChange={handleFilter} value={search.barcode} placeholder='ຄົ້ນຫາ ຊື່ສິນຄ້າ/ ລະຫັດສິນຄ້າ/ ລະຫັດບາໂຄດ (Ctrl+F)' className='fs-5' required />
                                                <InputGroup.Button type='submit' color='red'>
                                                    <i className='fas fa-search' />
                                                </InputGroup.Button>
                                            </InputGroup>
                                        </form>
                                    </Col>
                                </Row>
                            </Grid>
                        </div>
                        <div className="pos-content-container p-0 h-100">
                            <div className="product-row">
                                {isLoading ? (
                                    <div className="w-100 d-flex flex-column align-items-center justify-content-center py-5">
                                        <div className="d-flex flex-wrap justify-content-center gap-4 ">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="text-center">
                                                    <Placeholder.Graph active width={120} height={120} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className='mt-2'>
                                            <Loader size='lg' content="ກຳລັງໂຫລດ..." vertical />
                                        </div>
                                    </div>
                                ) :
                                    product.length > 0 ? (
                                        product.map((item, index) => {
                                            const cart = itemOrder.find((d) => d.productid === item.product_uuid)
                                            return (
                                                <div key={index} className="product-container" data-type={item.brandid}>
                                                    <a href="javascritp:;" onClick={() => handleOrder(item)}
                                                        className={`product ${item.stock === 1 && item.quantity <= 0 && 'not-available disabled'}`}>
                                                        <div className="img"
                                                            style={{
                                                                backgroundImage: `url(${item.images === '' || item.images === null ? images : item.url})`
                                                            }}>
                                                            {cart?.quantity > 0 && (
                                                                <span className="badge bg-red rounded-bottom-0 rounded-end-b">
                                                                    {cart.quantity}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text">
                                                            <div className="title">{item.productName}</div>
                                                            <div className="desc mb-n1">
                                                                ລະຫັດ: {item.sku}
                                                            </div>
                                                            <div className="price text-end text-red">{numeral(item.sellPrices).format('0,0')}/ {item.unit.unitName}</div>
                                                        </div>
                                                        {item.stock === 1 && item.quantity <= 0 && (
                                                            <div className="not-available-text">
                                                                <div>ສິນຄ້າໝົດ</div>
                                                            </div>

                                                        )}
                                                    </a>
                                                </div>
                                            );
                                        })
                                    ) :
                                        <div className="w-100 h-100 d-flex flex-column text-center justify-content-center align-items-center">
                                            <img src="../assets/img/icon/ic_no_result.svg" className='w-30' alt="" />
                                            <h4 className='text-red'>--------- ບໍ່ມີສິນຄ້າໃນປະເພດນີ້ ----------</h4>
                                        </div>

                                }

                            </div>
                        </div>
                    </div>
                    {/* END pos-content */}
                    {/* BEGIN pos-sidebar */}
                    <div className="pos-sidebar">
                        <div className="h-100 d-flex flex-column p-0">
                            <div className="pos-sidebar-header bg-red">
                                <div className="back-btn bg-red">
                                    <button
                                        type="button"
                                        data-dismiss-class="pos-sidebar-mobile-toggled"
                                        data-target="#pos"
                                        className="btn border-0"
                                    >
                                        <i className="fa fa-chevron-left fs-4" />
                                    </button>
                                </div>
                                <div className="icon">
                                    <i className="fas fa-user" />
                                </div>
                                <div className="title">{userName ? userName : 'ຜູ້ໃຊ້'}</div>
                                {/* <div className="order">
                                    Order: <b>#0056</b>
                                </div> */}
                            </div>
                            <div className="pos-sidebar-nav"></div>
                            <div
                                className="pos-sidebar-body"
                                data-scrollbar="true"
                                data-height="100%" >
                                <div className="pos-table">
                                    {itemOrder.length > 0 ?
                                        itemOrder.map((item, index) => (
                                            <div key={index} className="row pos-table-row">
                                                <div className="col-9">
                                                    <div className="pos-product-thumb">
                                                        <div
                                                            className="img"
                                                            style={{
                                                                backgroundImage:
                                                                    `url(${item?.product?.images === '' || item?.product?.images === null ? images : item?.product?.url})`
                                                            }}
                                                        />
                                                        <div className="info">
                                                            <div className="title">{item?.product?.productName}</div>
                                                            <div className="single-price fs-5">{numeral(item.salePrices).format('0,0')} {item?.product?.price.length > 0 && (<span className='px-2 text-red' role='button' onClick={()=>viewPrice(item)}><EditIcon /></span>)}</div>
                                                            {/* <div className="desc">- size: large</div> */}
                                                            <div className="input-group qty">
                                                                <div className="input-group-append">
                                                                    <button type="button" onClick={() => handleMinus(item.cart_uuid)} disabled={item.quantity === 1} className="btn btn-red rounded-pill">
                                                                        <i className="fa fa-minus" />
                                                                    </button>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    className="form-control w-30px"
                                                                    value={item.quantity} readOnly
                                                                />
                                                                <div className="input-group-prepend">
                                                                    <button type="button" onClick={() => handlePlus(item.cart_uuid)} className="btn btn-green rounded-pill">
                                                                        <i className="fa fa-plus" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-3 total-price">{numeral(item.quantity * item.salePrices).format('0,0')}
                                                    <br />
                                                    <button className='btn btn-xs btn-red' onClick={() => handleDelete(item.cart_uuid)}><i className='fa fa-trash' /></button>
                                                </div>
                                            </div>
                                        ))
                                        : (
                                            <div className='text-center p-5 mt-5'>
                                                <div className="h-100 d-flex align-items-center justify-content-center text-center p-20">
                                                    <div className="mb-35">
                                                        <img src="../assets/img/icon/cart-001.png" alt="" className='w-100' />
                                                        <h4 className='text-red'>====== ບໍ່ມີການສັ່ງຊື້ =====</h4>
                                                    </div>

                                                </div>
                                            </div>
                                        )}
                                </div>
                            </div>
                            <div className="pos-sidebar-footer bg-red">
                                <div className="d-flex align-items-center mb-2">
                                    <div className='fs-5'>ລວມຍອດ</div>
                                    <div className="flex-1 text-end h6 mb-0">{numeral(sumTotal).format('0,0')}</div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div>ອາກອນ (0%)</div>
                                    <div className="flex-1 text-end h6 mb-0">0.00</div>
                                </div>
                                <hr className="opacity-1 my-10px" />
                                <div className="d-flex align-items-center mb-2">
                                    <div className='fs-5'>ລວມເປັນເງິນທັງໝົດ</div>
                                    <div className="flex-1 text-end h4 mb-0">{numeral(sumTotal).format('0,0')}</div>
                                </div>
                                <div className="d-flex align-items-center mt-3">
                                    <button type='button' onClick={searchCancelSale} className="btn btn-default rounded-3 text-center me-10px w-70px"  >
                                        <i className="fa-solid fa-notes-medical fs-18px"></i> ຍົກເລີກ
                                    </button>
                                    <button type='button' onClick={handlePayonline} className="btn btn-orange rounded-3 text-center me-10px w-70px" >
                                        <i className="fa-solid fa-truck d-block fs-18px my-1" /> ອອນໄລນ໌
                                    </button>
                                    <button type='button' onClick={handleNewFormPay} className="btn btn-theme rounded-3 text-center flex-1">
                                        <i className="fa fa-shopping-cart d-block fs-18px my-1" />
                                        ຢືນຢັນການສັ່ງຊື້
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* END pos-sidebar */}
                </div>
                {/* END pos */}
                {/* BEGIN pos-mobile-sidebar-toggler */}
                <button type='button'
                    className="pos-mobile-sidebar-toggler bg-red text-white"
                    data-toggle-class="pos-sidebar-mobile-toggled"
                    data-target="#pos">
                    <i className="fa-solid fa-cart-plus fs-2" />
                    <span className="badge">{itemOrder.length}</span>
                </button>
                {/* END pos-mobile-sidebar-toggler */}
            </div>
            {/* END #content */}
            {openPay &&
                <FormPaySales open={openPay} handleClose={() => setOpenPay(false)} data={dataSale} reSpons={setResponse} billId={setBillid} />
            }
            {open &&
                <FormOrder open={open} handleClose={() => setOpen(false)} data={data} fetchOrder={setResponse} />
            }

            {openBill &&
                <BillSales open={openBill} onClose={() => setOpenBill(false)} billid={billid} />
            }

            {openOnline &&
                <Payonline open={dataSale} onClose={() => setOpenOnline(false)} data={dataSale} resPonse={setResponse} />
            }
            {openPrice && 
            <ViewPrice open={openPrice} onClose={()=>setOpenPrice(false)} data={price} resPonse={setResponse} />
            }

            {openCancel &&
                <FromSearch open={openCancel} onClose={() => setOpenCancel(false)}  />
            }
        </div>

    )
}

export default SalesPage