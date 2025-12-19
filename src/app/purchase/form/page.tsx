'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { InputPicker, Button, IconButton, CheckTreePicker, Grid, Row, Col, NumberInput, SelectPicker, Input, Loader } from 'rsuite';
import { useCategory, useSupplier } from '@/utils/selectOption';
import FormAddRole from './FormAddRole';
import axios from 'axios';
import { CONFIG } from '@/utils/Config';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import { Notific } from '@/utils/Notification';
import { toThousands } from '@/utils/formate';
import numeral from 'numeral';
import { useProductData } from '@/hooks/useProductData';
// ========================
interface ItemProduct {
  _uuid: string;
  productid: string | number;
  qty_order: number;
  prices_order: number;
  balance_total: number;
  discount: number;
}
// ========================
interface DataValueItem {
  shopid: string | number;
  supplierid: string | number;
  balance_order: number;
  actual_balance: number;
  total_orders: number;
  discount: number;
  vat: number;
  description: string;
  userName: string;
  itemproduct: ItemProduct[];
}


// interface ProductOption {
//   label: string;
//   value: string | number;
//   children?: ProductOption[];
// }

const FormPurchase: React.FC = () => {
  const api = CONFIG.URLAPI;
  const token = useToken();
  const shopid = getLocalStorageItem("shopid");
  const userId = getLocalStorageItem('user_uuid');
  const userName = getLocalStorageItem('userName');
  const category = useCategory();
  const supplier = useSupplier();

  const [cartId, setCartId] = useState<string | number | null>(null);

  const [types, setTypes] = useState<number | null>(1);
  const [openAddRole, setOpenAddRole] = useState<boolean>(false);
  const [dataSelect, setDataSelect] = useState<any>({
    shopid: shopid,
    supplierid: '',
    balance_order: 0,
    actual_balance: 0,
    total_orders: 0,
    discount: 0,
    vat: 0,
    description: '',
    userName: userName,
    itemproduct: [],
  });

  useEffect(() => {
    if (types === 2 && cartId) {
      setOpenAddRole(true);
    }
  }, [types, cartId]);







  const [values, setValues] = useState({
    shopid: shopid || '',
    categorieid: cartId || '',
    searchTerm: '',
  });

  const [itemData, setItemData] = useState<any[]>([]);
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}/cartimport/fetch/${userId}?status=2`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const jsonData = response.data;
      setItemData(jsonData.data || []);

      const initialData = jsonData.data.map((item: any) => ({
        _uuid: item._uuid,
        productid: item.product.product_uuid || null,
        qty_order: 1,
        discount: 0,
        prices_order: item.product.buyPrices || 0,
        balance_total: item.product.buyPrices || 0,
      }));

      const initialBalance = initialData.reduce((total: number, item: any) =>
        total + (item.prices_order || 0) * (item.qty_order || 1), 0
      );
      setDataSelect((prev: any) => ({
        ...prev,
        balance_order: initialBalance,
        total_orders: initialBalance,
        itemproduct: initialData
      }))
      // setSumTotal(initialBalance);
      // setBalanceTotal(initialBalance);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }
  // -------------------- Delete Item --------------------
  const handleDelete = async (id: string) => {
    try {
      const resault = await axios.delete(`${api}/cartimport/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (resault.status === 200) {
        Notific.success(resault.data.message);
        setResponse({ ...resault.data.data });
      }
    } catch (error) {
      Notific.error('ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ');
      console.log(error);
    }
  };
  // -------------------- Delete Item All --------------------
  const handleDeleteAll = async () => {
    Notific.confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນນີ້ແທ້ບໍ່?', async () => {
      try {
        const resault = await axios.delete(`${api}/cartimport/All/${userId}?status=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (resault.status === 200) {
          Notific.success(resault.data.message);
          setResponse({ ...resault.data.data });
        }
      } catch (error) {
        Notific.error('ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ');
        console.log(error);
      }
    });
  }

  const handleInputChange = (
    rawValue: any,
    _uuid: string,
    field: keyof ItemProduct
  ) => {
    // ⭐ แปลงให้เป็นตัวเลขก่อนเสมอ
    const value = Number(String(rawValue).replace(/,/g, "")) || 0;
    setDataSelect((prev: DataValueItem) => {
      // ⭐ 1) update เฉพาะสินค้าที่เปลี่ยนค่า
      const updatedItems = prev.itemproduct.map((item) => {
        if (item._uuid === _uuid) {
          const updated = {
            ...item,
            [field]: value,
          };
          // ⭐ 2) คำนวณ balance_total ใหม่
          const price = Number(updated.prices_order) || 0;
          const qty = Number(updated.qty_order) || 0;
          const discount = Number(updated.discount) || 0;
          updated.balance_total = price * qty - discount;
          return updated;
        }
        return item;
      });
      // ⭐ 3) รวมยอด balance_total ทั้งหมด
      const sumTotal = updatedItems.reduce(
        (sum, item) => sum + (Number(item.balance_total) || 0),
        0
      );
      // ⭐ 4) ส่งค่ากลับเข้า state
      return {
        ...prev,
        itemproduct: updatedItems,
        total_orders: sumTotal,
        balance_order: sumTotal,
      };
    });
  };
  const [loadingOrder, setLoadingOrder] = useState<boolean>(false);
  const handleSubmitOrder = async () => {
    try {
      setLoadingOrder(true);
      const resault = await axios.post(`${api}/purchase/create`, dataSelect, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (resault.status === 200) {
        Notific.success(resault.data.message);
        setResponse({ ...resault.data.data });
      }
    } catch (error) {
      Notific.error('ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ');
      console.log(error);
    } finally {
      setLoadingOrder(false);
    }
  }


  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ update values เมื่อ cartId หรือ shopid เปลี่ยน
  useEffect(() => {
    if (!cartId || !shopid || !token) return;
    setValues((prev) => ({
      ...prev,
      shopid,
      categorieid: cartId,
    }));
  }, [cartId, shopid, token]);

  // ✅ fetch data
  // const fetchProducts = async () => {
  //   if (!values.shopid || !values.categorieid) return;
  //   setLoading(true);
  //   try {
  //     const res = await axios.post(`${api}/product/search`, values, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     if (res.status !== 200) throw new Error('Failed to fetch product data');
  //     const jsonData = res.data.data || [];
  //     const data = jsonData.map((item: any) => ({
  //       label: item?.brandName,
  //       value: item?.brand_uuid,
  //       codes: item?.brandCode,
  //     }));
  //     setTreeData(data);
  //   } catch (error) {
  //     console.error('Error fetching product data:', error);
  //     setTreeData([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const [response, setResponse] = useState<any>('');
  useEffect(() => {
    if (shopid && token) {
      fetchCart();
    }

  }, [shopid, token, response]);

  const dataps = useProductData(cartId);
  const handleUse = () => {

  }

  return (
    <PageContainer>
      <ol className="breadcrumb float-end fs-5">
        <li className="breadcrumb-item">
          <Link href="/">ໜ້າຫຼັກ</Link>
        </li>
        <li className="breadcrumb-item active">ຂໍ້ມູນການສັ່ງຊື້ສິນຄ້າ</li>
      </ol>

      <h1 className="page-header">ຂໍ້ມູນການສັ່ງຊື້ສິນຄ້າ</h1>

      <div className="panel">
        <div className="panel-body p-0">
          <Grid fluid>
            <Row className="mb-3">
              <Col span={{ xs: 12, md: 6 }}>
                <label htmlFor="type" className="form-label fw-bold">
                  ເລືອກປະເພດ
                </label>
                <InputPicker
                  block
                  value={types}
                  onChange={(value) => setTypes(value ?? null)}
                  placeholder="ເລືອກປະເພດ"
                  data={[
                    {
                      label: <span className='text-start'><i className="fa-solid fa-list me-1" /> ເລືອກແບບຫຼາຍລາຍການ</span>,
                      value: 1
                    },
                    {
                      label: <span><i className="fa-solid fa-th-list me-1" /> ເລືອກແບບຕາຕາລາງ</span>,
                      value: 2
                    },
                  ]}
                />
              </Col>
              <Col span={{ xs: 12, lg: 6 }}>
                <label htmlFor="category" className="form-label fw-bold">
                  ປະເພດສິນຄ້າ
                </label>
                <InputPicker
                  block
                  data={category}
                  onChange={(value) => setCartId(value ?? null)}
                  placeholder="ເລືອກປະເພດສິນຄ້າ"
                />
              </Col>
              <Col span={{ xs: 18, lg: 10 }}>
                <label htmlFor="products" className="form-label fw-bold">
                  ລາຍການສິນຄ້າ
                </label>
                {/* <InputGroup inside>
                  <AutoComplete data={treeData} />
                  <InputGroup.Addon>
                    <SearchIcon />
                  </InputGroup.Addon>
                </InputGroup> */}
                <CheckTreePicker
                  data={dataps.treeData}
                  defaultExpandAll
                  searchable={false}
                  cleanable={false}
                  block
                  placeholder="ເລືອກສິນຄ້າ"
                />
              </Col>
              <Col span={{ xs: 6, md: 'auto' }} className="d-flex align-items-end">
                <Button
                  appearance="primary"
                  onClick={handleUse}
                  className="mt-4"
                >
                  <i className="fas fa-check me-1" /> ຢືນຢັນ
                </Button>
              </Col>
            </Row>
          </Grid>
          {itemData.length > 0 &&
            <Grid fluid>
              <Row>
                <Col span={{ xs: 12, md: 8 }}>
                  <label htmlFor="supplier" className="form-label fw-bold">ເລືອກຮ້ານຄ້າ</label>
                  <SelectPicker data={supplier} value={dataSelect.supplierid} onChange={(value) => setDataSelect({ ...dataSelect, supplierid: value })} block placeholder="ເລືອກຮ້ານຄ້າ" />
                </Col>
                <Col span={{ xs: 12, md: 10 }}>
                  <label htmlFor="description" className="form-label fw-bold">ລາຍລະອຽດ</label>
                  <Input value={dataSelect.description} onChange={(value) => setDataSelect({ ...dataSelect, description: value })} placeholder="ລາຍລະອຽດ" />
                </Col>
                <Col span={{ xs: 12, md: 6 }}>
                  <Button appearance="primary" onClick={handleSubmitOrder} disabled={loadingOrder} color="red" block className="mt-4"> {loadingOrder ? <Loader content="ກໍາລັງກວດສອບ..." /> : (<><i className="fa-brands fa-product-hunt me-2" /> ບັນທຶກການສັ່ງຊື້</>)}</Button>
                </Col>
              </Row>
            </Grid>
          }
          {/* ตารางแสดงสินค้า */}
          <div className="table-responsive mt-3">
            <table className="table table-sm table-bordered">
              <thead>
                <tr>
                  <th className="w-5 text-center">ລ/ດ</th>
                  <th className="w-1 text-center">   <IconButton
                    icon={<i className="fa fa-trash" />}
                    appearance="primary"
                    color="orange"
                    size="xs"
                    onClick={handleDeleteAll}
                  /></th>
                  <th>ລະຫັດສິນຄ້າ</th>
                  <th>ຊື່ສິນຄ້າ</th>
                  <th className="w-15 text-center">ຈຳນວນ</th>
                  <th className="w-20">ລາຄາຊື້</th>
                  <th className="w-20 text-end">ລວມເງິນ</th>
                </tr>
              </thead>
              <tbody className="fs-5">
                {itemData && itemData.length > 0 ? (
                  itemData.map((item, index) => {
                    const itemData = dataSelect.itemproduct.find((data: any) => data._uuid === item._uuid);
                    return (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">
                          <IconButton
                            icon={<i className="fa fa-trash" />}
                            appearance="primary"
                            color="red"
                            size="xs"
                            onClick={() => handleDelete(item._uuid)}
                          />
                        </td>
                        <td>{item.product.sku}</td>
                        <td>{item.product.productName}</td>
                        <td>
                          <NumberInput
                            min={1}
                            value={itemData?.qty_order || 0}
                            onChange={(value: any) => handleInputChange(value, item._uuid, "qty_order")}
                          />
                        </td>
                        <td>
                          <NumberInput min={1} value={itemData?.prices_order || 0} onChange={(value: any) =>
                            handleInputChange(value, item._uuid, 'prices_order')
                          } formatter={toThousands} />
                        </td>
                        <td className="text-end">{numeral(itemData?.balance_total || 0).format('0,0')} ₭</td>
                      </tr>
                    )
                  }
                  )
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-red">
                      =========== ບໍ່ມີລາຍການສີ້ນຄ້າ =========
                    </td>
                  </tr>
                )}

                <tr className="fw-bold fs-5 border-0">
                  <td colSpan={6} className="text-end py-2 fs-4 border-0">
                    ລວມເປັນເງິນທັງໝົດ
                  </td>
                  <td className="text-end  py-2 fs-4 border-1 text-red border-gray-200">{numeral(dataSelect.total_orders).format('0,0')} ₭</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {openAddRole && (
        <FormAddRole
          open={openAddRole}
          onClose={() => setOpenAddRole(false)}
          cartId={cartId}
          reSponse={setResponse}
        />
      )}
    </PageContainer>
  );
};

export default FormPurchase;