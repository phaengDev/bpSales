import numeral from "numeral";
import React, { useEffect, useState } from "react";
import { Modal, Button, Placeholder } from "rsuite";
import { postApi, getApi } from "@/utils/Configs";
import { useToken } from "@/hooks/useToken";
import { Notific } from "@/utils/Notification";
import { getLocalStorageItem } from "@/utils/storage";
interface Props {
  open: boolean;
  onClose: () => void;
  cartId: any;
  reSponse: (data: any[]) => void;
}

interface ChildItem {
  product_uuid: string | number;
  sku: string | number;
  productName: string;
  quantity: number;
  unit: {
    unitName: string;
  };
  buyPrices: number;
}

interface ParentItem {
  brand_uuid: string | number;
  brandCode: string | number;
  brandName: string;
  products?: ChildItem[];
}

const FormAddRole: React.FC<Props> = ({ open, onClose, reSponse, cartId }) => {
  const token = useToken();
const userid = getLocalStorageItem("user_uuid");
  const [loading, setLoading] = useState<boolean>(false);
  const [itemData, setItemData] = useState<any[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    if(!cartId || !token) return;
    try {
      const res = await getApi(`/product/brand/category/${cartId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const dataJson = await res.data;
      setItemData(dataJson.data);
    } catch (error) {
      console.error('Error fetching product data:', error);
      setItemData([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!cartId || !token) return;
    fetchProducts();
  }, [cartId, token]);

  // ✅ handle parent or child

  const [checkedItems, setCheckedItems] = useState<ChildItem[]>([]);
  const handleCheck = (item: ParentItem | ChildItem) => {
    if ((item as ParentItem).products) {
      // 👉 parent (has products)
      const parent = item as ParentItem;
      const children = parent.products || [];

      const isAllChecked = children.every((child) =>
        checkedItems.some((p) => p.product_uuid === child.product_uuid)
      );
      let newSelected: ChildItem[] = [];
      if (isAllChecked) {
        // uncheck all children
        newSelected = checkedItems.filter(
          (p) => !children.some((c) => c.product_uuid === p.product_uuid)
        );
      } else {
        const toAdd = children.filter(
          (c) => !checkedItems.some((p) => p.product_uuid === c.product_uuid)
        );
        newSelected = [...checkedItems, ...toAdd];
      }
      setCheckedItems(newSelected);
    } else {
      // 👉 child
      const child = item as ChildItem;
      const exists = checkedItems.some((p) => p.product_uuid === child.product_uuid);
      const newSelected = exists
        ? checkedItems.filter((p) => p.product_uuid !== child.product_uuid)
        : [...checkedItems, child];

      setCheckedItems(newSelected);
    }
  };

  // ✅ confirm use
  const [loadingConfirm, setLoadingConfirm] = useState<boolean>(false);
 const handleConfirm = async () => {
    const payload = {
        userbyid: userid,
        status: 2,
        items: checkedItems.map((item: any) => ({
            productid: item.product_uuid,
        })),
    }
    try {
      setLoadingConfirm(true);
      const res = await postApi(  `/cartimport/create`,payload,{
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 200) {
        Notific.success(res.data.message);
        reSponse({...res.data.data});
        onClose();
  };
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingConfirm(false);
    }
  };

  return (
    <Modal size="lg" open={open} onClose={onClose}>
      <Modal.Header>
        <Modal.Title>FormAddRole</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="table-responsive">
          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                <th className="w-5 text-center">ລ/ດ</th>
                <th className="w-1 text-center">#</th>
                <th>ລະຫັດສິນຄ້າ</th>
                <th>ຊື່ສິນຄ້າ</th>
                <th className="w-15 text-center">ຈຳນວນ</th>
                <th className="w-20 text-end">ລາຄາຊື້</th>
              </tr>
            </thead>
            <tbody className="fs-5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    <Placeholder.Grid rows={5} columns={6} active />
                  </td>
                </tr>
              ) :
                itemData && itemData.length > 0 ? (
                  itemData.map((item, index) => (
                    <React.Fragment key={item.brand_uuid}>
                      {/* ✅ Parent Row */}
                      <tr className="bg-red-100">
                        <td className="text-center">
                             <input
                            className="form-check-input"
                            type="checkbox"
                            id={`checkbox${index}`}
                            checked={
                              item.products
                                ? item.products.every((child: ChildItem) =>
                                  checkedItems.includes(child)
                                )
                                : false
                            }
                            onChange={() => handleCheck(item)}
                          />
                        </td>
                        <td className="text-center">
                       {index + 1}
                        </td>
                        <td colSpan={4}>  ({item.brandCode}) {item.brandName}  </td>
                      </tr>

                      {/* ✅ Child Rows */}
                      {item.products &&
                        item.products.map((child: ChildItem, cIndex: number) => (
                          <tr key={child.product_uuid}>
                            <td className="text-center">{cIndex + 1}</td>
                            <td className="text-center">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`checkbox-child-${index}-${cIndex}`}
                                checked={checkedItems.includes(child)}
                                onChange={() => handleCheck(child)}
                              />
                            </td>
                            <td>{child.sku}</td>
                            <td>{child.productName}</td>
                            <td className="text-center">
                              {child.quantity} {child?.unit?.unitName}
                            </td>
                            <td className="text-end">
                              {numeral(child.buyPrices).format("0,0.00")}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">
                      No data available
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleConfirm} loading={loadingConfirm} appearance="primary">ຢືນຢັນ</Button>
        <Button onClick={onClose} appearance="primary" color="red">
          ຍົກເລີກ
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FormAddRole;
