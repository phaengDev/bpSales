'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Button, SelectPicker, Input, IconButton, NumberInput, Loader } from 'rsuite';
import PlusRoundIcon from '@rsuite/icons/PlusRound';
import MinusRoundIcon from '@rsuite/icons/MinusRound';
import { useCategory } from '@/utils/selectOption';
import { postApi } from '@/utils/Configs';
import { Notific } from '@/utils/Notification';
import numeral from 'numeral';
import { useToken } from '@/hooks/useToken';
import { useProduct } from '@/utils/selectOption';
interface Props {
  show: boolean;
  handleClose: () => void;
  item: any;
  resPonse: (data: any) => void
}
const FormAdd: React.FC<Props> = ({ show, handleClose, item , resPonse}) => {
  const token = useToken();
  const categories = useCategory();


  const [priceMain, setPriceMain] = useState(0);

  const [dataValue, setDataValue] = useState<any>({
    categoryid: null,
    productid: null,
    dataPrices: [],
  });

  const { products, loading } = useProduct(dataValue.categoryid);

  const handleProductChange = (value: string | number | null) => {
    setDataValue({ ...dataValue, productid: value });
    const selected = products.find((item: any) => item.value === value);
    setPriceMain(selected ? selected.buyPrices : 0);
  };

  const [rows, setRows] = useState<any[]>([{ id: 1, typeName: 'ລາຄາຂາຍສົ່ງ 1', prices: 0 }]);
  const handleAdd = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        typeName: `ລາຄາຂາຍສົ່ງ ${rows.length + 1}`,
        prices: 0
      }
    ]);
  };

  const handleMove = (id: any) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleInputChange = (id: number | string | null, value: number | string | null) => {
    const updatedRows = rows.map(row =>
      row.id === id ? { ...row, prices: value } : row
    );
    setRows(updatedRows);
  };

  function toThousands(value: number | string | null | undefined) {
    if (!value) return '0 ₭';
    return `${value}`.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,') + ' ₭';
  }
const [isLoading, setIsLoading] = useState(false);
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const dataForm = {
        ...dataValue,
        dataPrices: rows,
      };
      const response = await postApi('/price/create/mt', dataForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        handleClose();
        resPonse(response.data.data);
        Notific.success(response.data.message);
      }
    } catch (error) {
      Notific.error("An error occurred while saving the data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (item) {
      setRows(item.pricesList);
    }
    setDataValue({
      categoryid: item ? item.categories_id_fk : '',
      productid: item ? item.productid : '',
      dataPrices: item ? item.pricesList : [],
    });
  }, [item]);

  return (
    <Modal open={show} onClose={handleClose} >
      <Modal.Header>
        <Modal.Title  className='py-1'>ເພີ່ມຂໍ້ມູນລາຄາສິນຄ້າ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-sm-5">
            <label className='form-label'>ປະເພດ</label>
            <SelectPicker block data={categories} value={dataValue.categoryid} onChange={(e) => setDataValue({ ...dataValue, categoryid: e })} placeholder="ປະເພດສິນຄ້າ" />
          </div>
          <div className="col-sm-7">
            <label className='form-label'>ລາຍການສິນຄ້າ</label>
            <SelectPicker block data={products} value={dataValue.productid} onChange={handleProductChange} placeholder={loading ? "ກຳລັງໂຫລດ..." : "ລາຍການສິນຄ້າ"} loading={loading} />
          </div>
        </div>
        {priceMain > 0 && (
          <h4 className='mt-3 text-red'>ລາຄາຂາຍປົກະຕິ: {priceMain ? numeral(priceMain).format('0,0.00') : "-"} ₭</h4>
        )}
        <hr />
        <table className='w-100 table table-sm mt-3'>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className='py-1'>
                <td>
                  {row.id === 1 ? (
                    <IconButton size='xs' onClick={handleAdd} appearance="primary" icon={<PlusRoundIcon />} />
                  ) : (
                    <IconButton color="red" size='xs' onClick={() => handleMove(row.id)} appearance="primary" icon={<MinusRoundIcon />} />
                  )}
                </td>
                <th>{row.typeName}</th>
                <td><NumberInput size='sm' value={row.prices} onChange={(value) => handleInputChange(row.id, value)} formatter={toThousands} placeholder="00.000" /></td>
              </tr>
            ))}
          </tbody>
        </table>

      </Modal.Body>
      <Modal.Footer className='py-2'>
        <Button color='red' appearance='primary' onClick={handleClose}>
          ປິດ
        </Button>
        <Button appearance="primary" onClick={handleSave} disabled={isLoading} > {isLoading ? <Loader content="ການບັນທຶກ..." /> : "ບັນທຶກ"}  </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default FormAdd