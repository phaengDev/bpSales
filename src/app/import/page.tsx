'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import {
  InputGroup,
  Input,
  InputPicker,
  SelectPicker,
  Button,
  IconButton,
  NumberInput,
  Loader
} from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import UnvisibleIcon from '@rsuite/icons/Unvisible';
import EyeRoundIcon from '@rsuite/icons/EyeRound';
import TrashIcon from '@rsuite/icons/Trash';
import numeral from 'numeral';

import { postApi, getApi, deleteApi } from '@/utils/Configs';
import { Notific } from '@/utils/Notification';
import { useCategory } from '@/utils/selectOption';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import { toThousands } from '@/utils/formate';
// import FormImportPurchaes from './FormImportPurchaes';
import ViewProductCatgory from './ViewProductCatgory';
import FormPurchase from './FormPurchase';

// -------------------- Interface Types --------------------

interface DataValueItem {
  productid: string | null;
  quantity: number;
  quantity_old: number;
  discount: number;
  sell_price: number;
  sell_price_old: number;
  buy_price: number;
  buy_price_old: number;
  createbyid: string;
}

// ==========================================================
const ItemPurchase: React.FC = () => {
  const userId = getLocalStorageItem('user_uuid');
  const shopId = getLocalStorageItem('shopid');
  const token = useToken();

  const itemCategory = useCategory();

  const [tab, setTab] = useState<number>(1);
  const [types, setTypes] = useState<number>(1);
  const [open, setOpen] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [itemData, setItemData] = useState<any[]>([]);

  const [dataValue, setDataValue] = useState<any[]>([]);

  const [sumTotal, setSumTotal] = useState<number>(0);
  const [balanceTotal, setBalanceTotal] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>('');

  // -------------------- Event Handlers --------------------
  const handleTap = (tabIndex: number) => setTab(tabIndex);
  const handleUseSearch = (index: number) => {
    setTypes(index);
  }

  const [cateId, setCateId] = useState<string | number>('');
  const onChangeCate = (value: string) => {
    setCateId(value);
    setOpen(true);
  };

  const handleCheck = () => setChecked((prev) => !prev);
  const handleToggle = () => setIsVisible((prev) => !prev);

  // -------------------- Fetch Cart --------------------
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getApi(`/cartimport/fetch/${userId}?status=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const jsonData = response.data;
      setItemData(jsonData.data || []);

      const initialData = jsonData.data.map((item: any) => ({
        _uuid: item._uuid,
        productid: item.product.product_uuid || null,
        quantity: 1,
        quantity_old: item.product.quantity || 0,
        discount: 0,
        sell_price: item.product.sellPrices || 0,
        sell_price_old: item.product.sellPrices || 0,
        buy_price: item.product.buyPrices || 0,
        buy_price_old: item.product.buyPrices || 0,
        types: 1,
        createbyid: userId
      }));
      setDataValue(initialData);
      const initialBalance = initialData.reduce((total: number, item: any) =>
        total + (item.buy_price || 0) * (item.quantity || 1), 0
      );
      setSumTotal(initialBalance);
      setBalanceTotal(initialBalance);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }
  // -------------------- Update Input --------------------
  const handleInputChange = (value: string, _uuid: string, field: keyof DataValueItem) => {
    const numericValue =
      field === 'quantity' ? parseInt(value, 10) : parseFloat(value.replace(/,/g, ''));

    setDataValue((prev) => {
      const updatedData = prev.map((item) =>
        item._uuid === _uuid ? { ...item, [field]: numericValue } : item
      );

      const amountTotal = updatedData.reduce(
        (sum, item) => sum + (item.buy_price || 0) * (item.quantity || 0),
        0
      );

      const total = updatedData.reduce(
        (sum, item) =>
          sum +
          (item.buy_price || 0) * (item.quantity || 0) -
          (item.discount || 0),
        0
      );
      const totalDis = updatedData.reduce((sum, item) => sum + (item.discount || 0), 0);
      setTotalDiscount(totalDis);
      setSumTotal(amountTotal);
      setBalanceTotal(total);
      return updatedData;
    });
  };

  // -------------------- Delete Item --------------------
  const handleDelete = async (id: string) => {
    try {
      const resault = await deleteApi(`/cartimport/${id}`, {
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
        const resault = await deleteApi(`/cartimport/All/${userId}?status=1`, {
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
  // -------------------- Import Purchase --------------------
  const handleImport = async () => {
    Notific.confirm('ທ່ານຕ້ອງການບັນທຶກຂໍ້ມູນການນຳເຂົ້າສິນຄ້ານີ້ແທ້ບໍ່?', async () => {

      setLoading(true);
      try {
        const response = await postApi(`/import/create`, { product: dataValue },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          Notific.success(response.data.message);
          setResponse({ ...response.data.data });
        }
      } catch (error) {
        console.error('Error importing data:', error);
        Notific.error('Failed to import data.');
      } finally {
        setLoading(false);
      }
    });
  };
  // -------------------- search sku  --------------------
  const [searchsku, setSearchsku] = useState<any>({
    sku: '',
    shopid: shopId,
    createbyid: userId,
    status: 1
  });
  const handleSearchSku = async (value: string) => {
    setSearchsku((prev: any) => ({ ...prev, sku: value }));   // ✔ FIX
    if (value.length < 7) return;
    try {
      const response = await postApi(`/cartimport/createbysku`,
        { ...searchsku, sku: value },                  // ✔ ส่ง sku ใหม่
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        Notific.success(response.data.message);
        setResponse(response.data.data);
        setSearchsku((prev: any) => ({ ...prev, sku: "" }));
      }

    } catch (error: any) {
      if (error.response?.status === 404) {
        Notific.error("ບໍ່ພົບສິນຄ້າ");
      }
      if (error.response?.status === 409) {
        Notific.warning("ສິນຄ້ານີ້ມີແລ້ວໃນການນຳເຂົ້າ");
      }
      console.log(error);
    }
  };

  // -------------------- search barcode  --------------------
  const [searchbarcode, setSearchbarcode] = useState<any>({
    barcode: '',
    shopid: shopId,
    createbyid: userId,
    status: 1
  });

const handleBarcodeKeyDown = (e: any) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (searchbarcode.barcode.trim() !== "") {
      // setSearchbarcode((prev: any) => ({ ...prev, barcode: "" }));
      handleSearchBarcode(searchbarcode.barcode);
    }
  }
};

const handleSearchBarcode = async (value: string) => {
  const payload = {
    ...searchbarcode,
    barcode: value,
  };
if(!payload.barcode || payload.barcode.length < 7) return;
  try {
    const response = await postApi(`/cartimport/barcode`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
      Notific.success(response.data.message);
      setResponse(response.data.data);
      setSearchbarcode((prev: any) => ({ ...prev, barcode: "" }));
      setTimeout(() => {
        document.getElementById("barcodeInput")?.focus();
      }, 50);
    }

  } catch (error: any) {
    if (error.response?.status === 404) {
      Notific.error("ບໍ່ພົບສິນຄ້າ");
    }
    if (error.response?.status === 409) {
      Notific.warning("ສິນຄ້ານີ້ມີແລ້ວໃນການນຳເຂົ້າ");
    }
    console.log(error);
    setSearchbarcode((prev: any) => ({ ...prev, barcode: "" }));
    setTimeout(() => {
      document.getElementById("barcodeInput")?.focus();
    }, 50);
  }
};


  // -------------------- Lifecycle --------------------
  useEffect(() => {
    if (!token || !userId) return
    fetchCart();
  }, [response, token, userId]);

  // ==========================================================
  return (
    <PageContainer>
      <ol className="breadcrumb float-end fs-5">
        <li className="breadcrumb-item">
          <Link href="/">ໜ້າຫຼັກ</Link>
        </li>
        <li className="breadcrumb-item active">ຂໍ້ມູນການນຳເຂົ້າສິນຄ້າ</li>
      </ol>

      <h1 className="page-header">ຂໍ້ມູນການນຳເຂົ້າສິນຄ້າ</h1>

      <ul className="nav nav-pills mb-2 fs-15px">
        <li className="nav-item">
          <button
            type="button"
            onClick={() => handleTap(1)}
            className={`nav-link ${tab === 1 ? 'active' : ''}`}
          >
            <span className="d-sm-block">
              <i className="fas fa-list me-2" /> ຈັດການນຳເຂົ້າແບບປົກະຕິ
            </span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            onClick={() => handleTap(2)}
            className={`nav-link ${tab === 2 ? 'active' : ''}`}
          >
            <span className="d-sm-block">
              <i className="fa-brands fa-product-hunt me-2" /> ນຳເຂົ້າຜ່ານການສັ່ງຊື້
            </span>
          </button>
        </li>
      </ul>

      <div className="panel">
        <div className="panel-body">
          {tab === 1 ? (
            <div>
              <div className="row">
                <div className="col-md-3 col-sm-3">
                  <label className="form-label fw-bold fs-4">ຮູບແບບ</label>
                  <InputPicker
                    block
                    value={types}
                    data={[
                      { label: 'ແບບພິມຄົ້ນຫາ sku', value: 1 },
                      { label: 'ເລືອກຕາມໝວດໝູ່', value: 2 },
                      { label: 'ແບບສະແກນ', value: 3 },
                    ]}
                    onChange={handleUseSearch}
                  />
                </div>

                {types === 1 ? (
                  <div className="col-md-6">
                    <label className="form-label fw-bold fs-4">ລະຫັດສິນຄ້າ</label>
                    <InputGroup inside>
                      <InputGroup.Addon>
                        <SearchIcon />
                      </InputGroup.Addon>
                      <Input placeholder="SKU" value={searchsku.sku} onChange={handleSearchSku} />
                    </InputGroup>
                  </div>
                ) : types === 2 ? (
                  <div className="col-md-6">
                    <label className="form-label fw-bold">ປະເພດສິນຄ້າ</label>
                    <SelectPicker block data={itemCategory} onChange={(value) => onChangeCate(value as string)} value={cateId} />
                  </div>
                ) : (
                  <div className="col-md-6 text-center">
                    <label className="form-label fw-bold fs-4">ລະຫັດບາໂຄດ</label>
                    <form action="">
                    <InputGroup inside size="md">
                      <Input
                        className="text-center"
                        autoFocus={types === 3}
                        value={searchbarcode.barcode}
                         onChange={(e) => setSearchbarcode({ ...searchbarcode, barcode: e})}
                          onKeyDown={handleBarcodeKeyDown}
                        placeholder="|||||||||||||||||||||||||"
                        readOnly={!checked}
                        required
                      />
                      <InputGroup.Addon>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          onChange={handleCheck}
                          checked={checked}
                        />
                      </InputGroup.Addon>
                    </InputGroup>
                    </form>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="panel mt-3">
                <div className="panel-heading px-0 d-flex justify-content-between align-items-center">
                  <div>
                    <Button
                      color="red"
                      appearance="primary"
                      disabled={itemData.length === 0}
                      onClick={handleDeleteAll}
                      className="ms-1"
                    >
                      <i className="fa-solid fa-trash me-1"></i> ລົບທັງໝົດ
                    </Button>
                    <IconButton
                      color={isVisible ? 'orange' : 'cyan'}
                      icon={isVisible ? <EyeRoundIcon /> : <UnvisibleIcon />}
                      onClick={handleToggle}
                      appearance="primary"
                      className="ms-1 fw-bold"
                    >
                      {numeral(balanceTotal).format('0,0')} ₭
                    </IconButton>
                  </div>
                  <div>
                    <Button
                      color="blue"
                      appearance="primary"
                      onClick={handleImport}
                      disabled={loading || itemData.length === 0}
                    >
                      {loading ? <Loader content="ກຳລັງບັນທຶກ..." /> : 'ຢືນຢັນນຳເຂົ້າ'}
                    </Button>
                  </div>
                </div>
                {/* table data */}
                <div className="table-responsive">
                  {itemData.length > 0 ? (
                    <table className="table table-bordered table-sm text-nowrap">
                      <thead>
                        <tr>
                          <th className="text-center w-5">ລ/ດ</th>
                          <th className="text-center w-5">  </th>
                          <th className="text-center">sku</th>
                          <th className="text-center">ບາໂຄດ</th>
                          <th>ຊື່ສິນຄ້າ</th>
                          <th>ຂະໜາດ</th>
                          <th className="w-10">ຈຳນວນນຳເຂົ້າ</th>
                          <th className="w-15">ລາຄາຊື້ເຂົ້າ</th>
                          <th className="w-15">ສ່ວນຫຼຸດ</th>
                          <th className='w-15 text-end'>ຈຳນວນເງິນ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemData.map((item: any, index: number) => {
                          const itemData = dataValue.find(data => data._uuid === item._uuid);
                          return (
                            <tr key={index}>
                              <td className="text-center">{index + 1}</td>
                              <td className="text-center"> <IconButton icon={<TrashIcon />} onClick={() => handleDelete(item._uuid)} appearance="ghost" color="red" size='xs' />  </td>
                              <td className="text-center">{item.product.sku}</td>
                              <td className="text-center">{item.product.barCode}</td>
                              <td>{item.product.productName}</td>
                              <td>{item.product.size.sizeName}</td>
                              <td className="text-center py-1">
                                <NumberInput min={1} value={itemData?.quantity || 0} onChange={(value: any) =>
                                  handleInputChange(value, item._uuid, 'quantity')
                                } />
                              </td>
                              <td className="text-end py-1">
                                <NumberInput min={1} value={itemData?.buy_price || 0} onChange={(value: any) =>
                                  handleInputChange(value, item._uuid, 'buy_price')
                                } formatter={toThousands} />
                              </td>
                              <td className="text-end py-1">
                                <NumberInput min={1} value={itemData?.discount || 0} onChange={(value: any) =>
                                  handleInputChange(value, item._uuid, 'discount')
                                } formatter={toThousands} />
                              </td>
                              <td className='text-end'> {(itemData?.buy_price || 0) * (itemData?.quantity || 0) - (itemData?.discount || 0)} ₭</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className='text-center'>
                      <img src="../assets/img/icon/ic_no_result.svg" className="img-fluid w-25" alt="" />
                      <div className="text-danger">========= ບໍ່ມີຂໍ້ມູນສິນຄ້າ =========</div>
                    </div>
                  )}

                </div>
                <div className="row">
                  <div className="col-sm-8 col-0"></div>
                  {isVisible &&
                    <div className="col-sm-4">
                      <table className='table border-red table-sm table-bordered'>
                        <tbody className='text-end'>
                          <tr>
                            <th>ຍອດທັງໝົດ:</th>
                            <td>{numeral(sumTotal).format('0,0')} ₭</td>
                          </tr>
                          <tr>
                            <th>ຍອດສ່ວນຫຼຸດ:</th>
                            <td>{numeral(totalDiscount).format('0,0')} ₭</td>
                          </tr>
                          <tr>
                            <th>ຍອດຫຼັງຫັກສ່ວນຫຼຸດ:</th>
                            <td>{numeral(sumTotal - totalDiscount).format('0,0')} ₭</td>
                          </tr>
                          <tr>
                            <th>ຍອດຕ້ອງຈ່າຍ:</th>
                            <td>{numeral(balanceTotal).format('0,0')} ₭</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  }
                </div>
              </div>
            </div>
          ) : (
            <FormPurchase />
          )}
        </div>
      </div>

    
      {open && (
        <ViewProductCatgory
          open={open}
          onClose={() => setOpen(false)}
          data={itemData.map((item: any) => item.product || [])}
          cartid={cateId}
          fetchData={setResponse}
        />
      )}
    </PageContainer>
  );
};

export default ItemPurchase;
