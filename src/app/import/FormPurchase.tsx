"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import numeral from "numeral";
import { Input, InputGroup, NumberInput, IconButton, Button } from "rsuite";
import { postApi } from "@/utils/Configs";
import { Notific } from "@/utils/Notification";
import FormSearch from "./FormSearch";
import { useToken } from "@/hooks/useToken";
import { getLocalStorageItem } from "@/utils/storage";
import SearchIcon from '@rsuite/icons/Search';
interface OrderItem {
  _uuid: number;
  prices_order: number;
  qty_order: number;
  discount: number;
  sell_price: number;
  productCode: string;
  productName: string;
  unitName: string;
  sizeName: string;
  imports: number;
}

export default function FormPurchase() {
  const router = useRouter();
  const logos = '../../assets/img/icon/user.png';
  const userName = getLocalStorageItem("userName");
  const token = useToken();

  const [product, setProduct] = useState<OrderItem[]>([]);
  const [order, setOrder] = useState<any>(null);

  const [openSearch, setOpenSearch] = useState(true);
  const [checked, setChecked] = useState<{ [key: number]: boolean }>({});

  const [total, setTotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);

  const [values, setValues] = useState<any>({
    order_uuid: null,
    actual_balance: 0,
    discount: 0,
    total_orders: 0,
    date_import: new Date(),
    userName,
    itemProduct: [],
  });

  // --------------------------------------------------
  // CALCULATE TOTALS
  // --------------------------------------------------
  function calcTotals(items: OrderItem[], map: any) {
    const selected = items.filter((i) => map[i._uuid]);
    const t = selected.reduce(
      (sum, x) => sum + x.prices_order * x.qty_order - x.discount,
      0
    );
    const dis = selected.reduce((sum, x) => sum + x.discount, 0);

    setTotal(t);
    setTotalDiscount(dis);
    setValues((prev: any) => ({
      ...prev,
      actual_balance: t + dis,
      discount: dis,
      total_orders: t,
    }));
  }

  // --------------------------------------------------
  // INITIALIZE ROWS WHEN ORDER CHANGES
  // --------------------------------------------------
  useEffect(() => {
    if (!order) return;

    const items = order.list.map((p: any) => ({
      _uuid: p._uuid,
      productid: p.productid,
      prices_order: p.prices_order,
      sell_price: p.product?.sellPrices,
      sell_price_old: p.product?.sellPrices,
      buy_price: p.prices_order,
      buy_price_old: p.product?.buyPrices,
      qty_order: p.qty_order,
      quantity_old: p.product?.quantity ?? 0,
      discount: p.discount,
      types: 1,
      productCode: p.product?.sku,
      productName: p.product?.productName,
      unitName: p.product?.unitName,
      sizeName: p.product?.size?.sizeName,
    }));

    setProduct(items);
    setValues((prev: any) => ({
      ...prev,

      itemProduct: items
    }));
    const checkInit: any = {};
    items.forEach((x: any) => (checkInit[x._uuid] = true));

    setChecked(checkInit);

    // 3) calculate totals
    calcTotals(items, checkInit);
  }, [order]);
  // --------------------------------------------------
  // HANDLE CHANGE (qty, price, discount)
  // --------------------------------------------------
  const handleChange = (
    field: keyof OrderItem,
    value: string | number,
    id: number
  ) => {
    const numberVal =
      typeof value === "string"
        ? parseFloat(value.replace(/,/g, "")) || 0
        : value || 0;

    const newProducts = product.map((p) =>
      p._uuid === id ? { ...p, [field]: numberVal } : p
    );

    const newValues = values.itemProduct.map((p: any) =>
      p._uuid === id ? { ...p, [field]: numberVal } : p
    );

    setProduct(newProducts);
    setValues((prev: any) => ({ ...prev, itemProduct: newValues }));

    calcTotals(newValues, checked);
  };

  // --------------------------------------------------
  // HANDLE CHECKBOX
  // --------------------------------------------------
  const toggleItem = (id: number, isChecked: boolean) => {
    const newCheck = { ...checked, [id]: isChecked };
    setChecked(newCheck);

    const newItems = values.itemProduct.map((p: any) =>
      p._uuid === id ? { ...p, imports: isChecked ? 2 : 1 } : p
    );

    setValues((prev: any) => ({ ...prev, itemProduct: newItems }));
    calcTotals(newItems, newCheck);
  };

  // --------------------------------------------------
  // SAVE
  // --------------------------------------------------
  const handleSave = async () => {
    try {
      const res = await postApi(`/import/importPurchase`, values,{
        headers: {
                        Authorization: `Bearer ${token}`,
                    }
      });
      Notific.success(res.data.message);
      router.push("/purchase/report");
    } catch (err) {
      console.log(err);
      Notific.error("ບັນທຶກບໍ່ສຳເລັດ");
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <>
      <div className="panel p-0">
        <div className="panel-heading">
          <h4 className="panel-title fs-4">ຂໍ້ມູນການສັ່ງຊື້</h4>
          <div className="panel-heading-btn">
            {product.length > 0 && (
              <Button color="green" onClick={handleSave} appearance="primary" className="me-3">  <i className="fas fa-check me-2" /> ບັນທຶກ</Button>
            )}
            <IconButton circle onClick={() => setOpenSearch(true)} icon={<SearchIcon />} appearance="ghost" />
          </div>
        </div>
        <hr className="mt-1 mb-1" />
        {/* Order Detail */}
        {order && (
          <div className="panel-body p-0">
            <table className="table table-sm table-borderless text-nowrap">
              <tbody>
                <tr>
                  <th rowSpan={4} className="w-5 text-center align-middle"
                    style={{ verticalAlign: "middle" }}>
                    <img src={`${order?.supplier?.logos === '' || order?.supplier?.logos === null ? logos : order?.supplier?.url}`} className="rounded-3 border h-50px my-n1 mx-n1 " />
                  </th>
                </tr>
                <tr>
                  <th className="text-end  fs-4 w-5">ຊື່ຮ້ານຄ້າ:</th>
                  <td className="fs-4 ">{order?.supplier?.supplierName}</td>
                  <th className="text-end fs-4">ເລກບິນ:</th>
                  <td className="w-10 fs-4 text-red">{order.billno}</td>
                </tr>
                <tr>
                  <th className="text-end w-5 ">ເບີໂທລະສັບ:</th>
                  <td className="">{order?.supplier?.phone}</td>
                  <th className="text-end ">ວັນທີ:</th>
                  <td className="w-10 text-red">
                    {moment(order.createdAt).format("DD/MM/YYYY HH:mm")}
                  </td>
                </tr>
              </tbody>
            </table>
            {product.length > 0 ? (<>
              {/* Product Table */}
              <div className="table-responsive">
                <table className="table table-bordered table-sm text-nowrap">
                  <thead>
                    <tr>
                      <th className="text-center w-5">ລ/ດ</th>
                      <th className="text-center w-5">#</th>
                      <th className="">ລະຫັດ</th>
                      <th>ຊື່ສິນຄ້າ</th>
                      <th>ຂະໜາດ</th>
                      <th className="w-15">ລາຄາຊື້</th>
                      <th className="w-15">ລາຄາຂາຍ</th>
                      <th className="w-10">ຈຳນວນ</th>
                      <th className="w-15">ສ່ວນຫຼຸດ</th>
                      <th>ລວມເງິນ</th>
                    </tr>
                  </thead>

                  <tbody>
                    {product.map((p, idx) => {
                      const isChecked = checked[p._uuid];
                      return (
                        <tr key={p._uuid}>
                          <td className="text-center">{idx + 1}</td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={isChecked}
                              onChange={(e) =>
                                toggleItem(p._uuid, e.target.checked)
                              }
                            />
                          </td>
                          <td>{p.productCode}</td>
                          <td>{p.productName}</td>
                          <td>{p.sizeName}</td>
                          <td>
                            <InputGroup size="sm" inside>
                              <InputGroup.Addon>₭</InputGroup.Addon>
                              <Input
                                disabled={!isChecked}
                                value={numeral(p.prices_order).format("0,0")}
                                onChange={(v) =>
                                  handleChange("prices_order", v, p._uuid)
                                }
                              />
                            </InputGroup>
                          </td>
                          <td>
                            <InputGroup size="sm" inside>
                              <InputGroup.Addon>₭</InputGroup.Addon>
                              <Input
                                disabled={!isChecked}
                                value={numeral(p.sell_price).format("0,0")}
                                onChange={(v) =>
                                  handleChange("sell_price", v, p._uuid)
                                }
                              />
                            </InputGroup>
                          </td>

                          <td className="text-center">
                            <NumberInput
                              disabled={!isChecked}
                              value={p.qty_order}
                              onChange={(v) =>
                                handleChange("qty_order", v!, p._uuid)
                              }
                              size="sm"
                            />
                          </td>

                          <td>
                            <InputGroup size="sm" inside>
                              <InputGroup.Addon>₭</InputGroup.Addon>
                              <Input
                                disabled={!isChecked}
                                value={numeral(p.discount).format("0,0")}
                                onChange={(v) =>
                                  handleChange("discount", v, p._uuid)
                                }
                              />
                            </InputGroup>
                          </td>

                          <td className="text-end">
                            {numeral(
                              p.prices_order * p.qty_order - p.discount
                            ).format("0,0")}
                          </td>
                        </tr>
                      );
                    })}

                    <tr className="border-0">
                      <td colSpan={8} className="border-0 text-end">ລວມຍອດນຳເຂົ້າທັງໝົດ</td>
                      <td className="text-end border">{numeral(totalDiscount).format("0,0")}</td>
                      <td className="text-end border">{numeral(total).format("0,0")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>) : (
              <div className="text-center">
                <img src="../assets/img/icon/ic_no_result.svg" className="img-fluid w-25" alt="" />
              </div>
            )}
          </div>
        )}
      </div>

      {openSearch && (
        <FormSearch
          open={openSearch}
          handleClose={() => setOpenSearch(false)}
          resPonse={setOrder}
        />
      )}
    </>
  );
}

// export default FormPurchase
