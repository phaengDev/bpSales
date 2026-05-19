import React, { useEffect, useState } from "react";
import {
  Modal,
  Placeholder,
  Grid,
  Row,
  Col,
  SelectPicker,
  InputGroup,
  Input,
  Button,
} from "rsuite";
import { useToken } from "@/hooks/useToken";
import { postApi } from "@/utils/Configs";
import numeral from "numeral";
import SearchIcon from "@rsuite/icons/Search";
import { useBrand } from "@/utils/selectOption";
import { getLocalStorageItem } from "@/utils/storage";
import { Notific } from "@/utils/Notification";
interface Props {
  open: boolean;
  onClose: () => void;
  data: any[]; // pre-selected items
  cartid: any;
  fetchData: (data: any) => void;
}

const ViewProductCatgory: React.FC<Props> = ({
  open,
  onClose,
  data,
  cartid,
  fetchData,
}) => {
  const token = useToken();
  const shopid = getLocalStorageItem("shopid");
  const userid = getLocalStorageItem("user_uuid");
  const brand = useBrand(cartid);

  const [searchTerm, setSearchTerm] = useState<any>({
    shopid: "",
    brandid: "",
    categorieid: "",
  });

  const [loading, setLoading] = useState(false);
  const [itemData, setItemData] = useState<any[]>([]);
  const [itemSelected, setItemSelected] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // load default values
  useEffect(() => {
    if (cartid) {
      setSearchTerm((prev: any) => ({
        ...prev,
        shopid: shopid,
        categorieid: cartid,
      }));
    }
  }, [cartid, shopid]);

  // preload selected items when modal opens
  useEffect(() => {
    if (open && Array.isArray(data)) {
      setItemSelected(data);
    }
  }, [open, data]);

  // fetch product list
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await postApi(`/product/sales`, searchTerm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItemData(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // fetch on filter change
  useEffect(() => {
    if (!token) return;
    fetchProduct();
  }, [token, searchTerm]);

  // toggle single item
  const toggleItem = (item: any) => {
    const exists = itemSelected.some(
      (i) => i.product_uuid === item.product_uuid
    );
    if (exists) {
      // remove item
      setItemSelected(
        itemSelected.filter((i) => i.product_uuid !== item.product_uuid)
      );
    } else {
      // add item
      setItemSelected([...itemSelected, item]);
    }
  };

  // select / unselect all
  const toggleSelectAll = () => {
    if (selectAll) {
      setItemSelected([]);
    } else {
      setItemSelected(itemData);
    }
    setSelectAll(!selectAll);
  };

  // auto sync selectAll
  useEffect(() => {
    setSelectAll(
      itemData.length > 0 && itemSelected.length === itemData.length
    );
  }, [itemSelected, itemData]);

  const handleConfirm = async () => {
    const payload = {
        userbyid: userid,
        status: 1,
        items: itemSelected.map((item: any) => ({
            productid: item.product_uuid,
        })),
    }
    try {
      setLoading(true);
      const res = await postApi(  `/cartimport/create`,payload,{
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 200) {
        Notific.success(res.data.message);
        fetchData(res.data.data);
        onClose();
  };
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size={"lg"}>
      <Modal.Header>
        <Modal.Title>ລາຍລະອຽດຂອງສິນຄ້າ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Grid fluid className="mb-2">
          <Row className="show-grid">
            <Col span={{ xs: 12, sm: 8, lg: 6, xl: 8 }}>
              <label className="form-label">ຍີ່ຫໍ້ສິນຄ້າ</label>
              <SelectPicker
                data={brand}
                value={searchTerm.brandid}
                onChange={(value) =>
                  setSearchTerm({ ...searchTerm, brandid: value })
                }
                block
              />
            </Col>
            <Col span={{ xs: 12, sm: 8, lg: 6, xl: 8 }} push={{ sm: 8, lg: 12, xl: 8 }}>
              <label className="form-label">ຄົ້ນຫາຊື້ສິນຄ້າ</label>
              <InputGroup inside>
                <InputGroup.Addon>
                  <SearchIcon />
                </InputGroup.Addon>
                <Input placeholder="ຄົ້ນຫາ" />
              </InputGroup>
            </Col>
          </Row>
        </Grid>

        <div className="table-responsive">
          <table className="table table-striped table-bordered table-sm text-nowrap">
            <thead>
              <tr>
                <th className="text-center w-5">ລ/ດ</th>
                <th className="text-center w-5">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="text-center">ລະຫັດສິນຄ້າ</th>
                <th>ຊື່ສິນຄ້າ</th>
                <th className="text-center">ຈຳນວນ</th>
                <th className="text-end">ລາຄາ</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    <Placeholder.Grid rows={5} columns={6} active />
                  </td>
                </tr>
              ) : itemData.length > 0 ? (
                itemData.map((item: any, index: number) => (
                  <tr key={item.product_uuid}>
                    <td className="text-center">{index + 1}</td>

                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={itemSelected.some(
                          (i) => i.product_uuid === item.product_uuid
                        )}
                        onChange={() => toggleItem(item)}
                      />
                    </td>

                    <td className="text-center">{item.sku}</td>
                    <td>{item.productName}</td>
                    <td className="text-center">
                      {item.quantity} {item.unit?.unitName}
                    </td>
                    <td className="text-end">
                      {numeral(item.buyPrices).format("0,0")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-danger">
                    ========= ບໍ່ມີຂໍ້ມູນສິນຄ້າ =========
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={onClose} appearance="primary" color="red">
          ປິດ
        </Button>
        <Button onClick={handleConfirm} appearance="primary">
          ຢືນຢັນນຳເຂົ້າ
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewProductCatgory;
