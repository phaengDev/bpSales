'use client'
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Input,
  SelectPicker,
  InputGroup,
  IconButton,
  NumberInput,
  Loader,
} from 'rsuite';
import WarningRoundIcon from '@rsuite/icons/WarningRound';
import { useCategory, useBrand, useUnite, useSizes } from '../../utils/selectOption';
import axios from 'axios';
import { postApi, putApi } from '../../utils/Configs';
import { Notific } from '../../utils/Notification';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
interface Props {
  open: boolean;
  handleClose: () => void;
  data?: any;
  resPonse: (data: any) => void;
}

interface ProductValues {
  shopid: number | any;
  sku: string;
  barcode: string;
  images: File | null;
  productName: string;
  categorieid: string | number;
  brandid: string | number;
  uniteid: string | number;
  sizeid: string | number;
  quantity: number | string;
  buyPrices: number | string;
  sellPrices: number | string;
  descripiton: string;
}

const FormProduct: React.FC<Props> = ({ open, handleClose, data, resPonse }) => {
const token = useToken();
const shopid = getLocalStorageItem('shopid');

  const [values, setValues] = useState<ProductValues>({
    shopid: shopid,
    sku: '',
    barcode: '',
    images: null,
    productName: '',
    categorieid: '',
    brandid: '',
    uniteid: '',
    sizeid: '',
    quantity: 0,
    buyPrices: 0,
    sellPrices: 0,
    descripiton: '',
  });

  const dataCategory = useCategory();
  const dataBrand = useBrand(values.categorieid);
  const dataUnite = useUnite();
  const dataSizes = useSizes();


useEffect(() => {
  if (!values.brandid || !token || dataBrand.length === 0) return;

  const brand = dataBrand.find((item) => item.value === values.brandid);
  if (brand && typeof brand.codes === "string") {
    const cleanCode = brand.codes.replace(/-/g, '');
   if(values.sku === '' || values.sku === null){
    setValues((prev: any) => ({
      ...prev,
      sku: cleanCode,
    }));
  }
  }
}, [values.brandid, token, dataBrand]);


  const [files, setFiles] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(URL.createObjectURL(file));
      setValues((prev) => ({
        ...prev,
        images: file,
      }));
    }
  };

  const handleMovefile = () => {
    setFiles(null);
    setValues((prev) => ({
      ...prev,
      images: null,
    }));
  };

  function toThousands(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '0';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') +' ₭';
  }
const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  try {
    if(!data){
    const response = await postApi(`/product/create`, values, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });

    if (response.status === 200) {
      resPonse(response.data.data);
      handleClose();
      Notific.success(response.data.message);
    }
  }else{
    const response = await putApi(`/product/${btoa(data.product_uuid)}`, values, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    if (response.status === 200) {
      resPonse(response.data.data);
      handleClose();
      Notific.success(response.data.message);
    }
  }
  } catch (error: any) {
    // ✅ ກວດວ່າເປັນ AxiosError ແລະມີ response ກັບມາ
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      // ✅ ຖ້າ backend ສົ່ງ 409 (Conflict)
      if (status === 409) {
        Notific.warning(data.error || 'Product already exists');
      } else if (status === 400) {
        Notific.warning(data.error || 'Invalid data');
      } else {
        Notific.error(data.error || 'Failed to create product');
      }
    } else {
      // ❌ ຖ້າເປັນ error ອື່ນໆ (network, parse, etc.)
      Notific.error('Network or unknown error occurred');
      console.error('Error:', error);
    }
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (data) {
      setValues({
        ...values,
        sku: data.sku || '',
        barcode: data.barcode || '',
        productName: data.productName || '',
        categorieid: data?.brand?.categorieid || '',
        brandid: data.brandid || '',
        uniteid: data.uniteid || '',
        sizeid: data.sizeid || '',
        quantity: data.quantity || 0,
        buyPrices: data.buyPrices || 0,
        sellPrices: data.sellPrices || 0,
        descripiton: data.descripiton || '',
      });

      if (data.images) {
        setFiles(`${data.url}`);
      }
    }
  }, [data]);

  return (
    <Modal open={open} onClose={handleClose} size="md" backdrop="static">
      <Modal.Header>
        <Modal.Title className="py-1">{data ? 'ແກ້ໄຂຂໍ້ມູນສິນຄ້າ' : 'ເພີ່ມຂໍ້ມູນສິນຄ້າໃໝ່'}</Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body className="fs-14px">
          <div className="row">
            {/* ========== Upload Image ========== */}
            <div className="col-12 mb-2">
              <div className="profile w-20 float-center">
                <label className="profile-image" role="button">
                  <img
                    src={files || '../assets/img/icon/picture.jpg'}
                    className="w-100 rounded-3"
                    alt="avatar"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="d-none"
                  />
                </label>
                {files && (
                  <div className="move-profile">
                    <IconButton
                      color="red"
                      size="xs"
                      onClick={handleMovefile}
                      appearance="primary"
                      icon={<WarningRoundIcon />}
                      circle
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ========== Product Info ========== */}
            <div className="form-group col-sm-6 col-12 mb-2">
              <label className="form-label fs-bold">
                ຊື່ສິນຄ້າ <span className="text-danger">*</span>
              </label>
              <Input
                value={values.productName}
                onChange={(value) =>
                  setValues((prev) => ({ ...prev, productName: value }))
                }
                placeholder="ຊື່ສິນຄ້າ" required />
            </div>

            <div className="form-group col-sm-6 col-12 mb-2">
              <label className="form-label fs-bold">ລະຫັດບາໂຄດ</label>
              <InputGroup inside>
                <InputGroup.Addon>
                  <i className="fa-solid fa-barcode" />
                </InputGroup.Addon>
                <Input
                  value={values.barcode}
                  onChange={(value) =>
                    setValues((prev) => ({ ...prev, barcode: value }))
                  }
                  placeholder="ລະຫັດບາໂຄດ"
                />
              </InputGroup>
            </div>

            {/* ========== Dropdowns ========== */}
            <div className="form-group row mb-2">
              <div className="col-6">
                <label className="form-label fs-bold">ປະເພດສິນຄ້າ</label>
                <SelectPicker
                  block
                  value={values.categorieid}
                  onChange={(value) =>
                    setValues((prev) => ({ ...prev, categorieid: value ?? '' }))
                  }
                  data={dataCategory}
                  placeholder="ປະເພດສິນຄ້າ"
                  
                />
              </div>
              <div className="col-6">
                <label className="form-label fs-bold">ຍີ່ຫໍ້ສິນຄ້າ</label>
                <SelectPicker
                  block
                  data={dataBrand}
                  value={values.brandid}
                  onChange={(value) =>
                    setValues((prev) => ({ ...prev, brandid: value ?? '' }))
                  }
                  placeholder="ຍີ່ຫໍ້ສິນຄ້າ"
                />
              </div>
            </div>

            <div className="form-group col-6 col-sm-4 mb-2">
              <label className="form-label fs-bold">ຂະໜາດ</label>
              <SelectPicker
                block
                data={dataSizes}
                value={values.sizeid}
                onChange={(value) =>
                  setValues((prev) => ({ ...prev, sizeid: value ?? '' }))
                }
                placeholder="ຂະໜາດ"
              />
            </div>

            <div className="form-group col-6 col-sm-4 mb-2">
              <label className="form-label fs-bold">ຈຳນວນ</label>
              <NumberInput
                value={values.quantity}
                onChange={(value) =>
                  setValues((prev) => ({ ...prev, quantity: value ?? 0 }))
                }
                placeholder="0"
              />
            </div>

            <div className="form-group col-6 col-sm-4 mb-2">
              <label className="form-label fs-bold">ຫົວໜ່ວຍ</label>
              <SelectPicker
                block
                data={dataUnite}
                value={values.uniteid}
                onChange={(value) =>
                  setValues((prev) => ({ ...prev, uniteid: value ?? '' }))
                }
                placeholder="ຫົວໜ່ວຍ"
              />
            </div>

            {/* ========== Prices ========== */}
            <div className="form-group col-6 col-sm-6 mb-2">
              <label className="form-label fs-bold">ລາຄາຕົ້ນທຶນ</label>
                <NumberInput prefix="₭"
                  value={values.buyPrices}
                  onChange={(value) =>
                    setValues((prev) => ({ ...prev, buyPrices: value ?? 0 }))
                  }
                  formatter={toThousands}
                  placeholder="0,00"
                />
            </div>

            <div className="form-group col-6 col-sm-6 mb-2">
              <label className="form-label fs-bold">ລາຄາຂາຍ</label>
                <NumberInput prefix="₭"
                  value={values.sellPrices}
                  onChange={(value) =>
                    setValues((prev) => ({ ...prev, sellPrices: value ?? 0 }))
                  }
                  formatter={toThousands}
                  placeholder="0,00"
                />
            </div>

            {/* ========== Description ========== */}
            <div className="form-group col-12 mb-2">
              <label className="form-label fs-bold">ໝາຍເຫດ</label>
              <Input
                as="textarea"
                value={values.descripiton}
                onChange={(value) =>
                  setValues((prev) => ({ ...prev, descripiton: value }))
                }
                placeholder="ໝາຍເຫດ"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" disabled={loading} appearance="primary">
           {loading && <Loader content="ກຳລັງບັນທຶກ..." />} {data ? 'ອັບເດດ' : 'ບັນທຶກ'}
          </Button>
          <Button color="red" onClick={handleClose} appearance="primary">
            ປິດ
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default FormProduct;
