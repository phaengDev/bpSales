'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Button, SelectPicker, Card, IconButton, NumberInput, HStack, Avatar, VStack } from 'rsuite';
import PlusRoundIcon from '@rsuite/icons/PlusRound';
import MinusRoundIcon from '@rsuite/icons/MinusRound';
import { useCategory } from '@/utils/selectOption';
import { postApi } from '@/utils/Configs';
import { Notific } from '@/utils/Notification';
import numeral from 'numeral';
import { useToken } from '@/hooks/useToken';
import { useProduct } from '@/utils/selectOption';
// import { toThousands } from '@/utils/formate';
interface Props {
    open: boolean;
    onClose: () => void;
    data: any;
    resPonse: (data: any) => void;
    product: any
}
const FromAdd: React.FC<Props> = ({ open, onClose, data, resPonse, product }) => {
    const token = useToken();
    const categories = useCategory();


    const [unit, setUnit] = useState('');

    const [dataValue, setDataValue] = useState<any>({
        categoryid: null,
        productid: null,
        dataPs: [],
    });

    const { products, loading } = useProduct(dataValue.categoryid);

    const handleProductChange = (value: string | number | null) => {
        setDataValue({ ...dataValue, productid: value });
        const selected = products.find((item: any) => item.value === value);
        setUnit(selected ? selected.unitName : '');
    };

    const [rows, setRows] = useState<any[]>([{ id: 1, qty_buy: 0, qty_free: 0 }]);
    const handleAdd = () => {
        setRows([
            ...rows,
            {
                id: rows.length + 1,
                qty_buy: 0,
                qty_free: 0
            }
        ]);
    };


    function toThousands(value: number | string | null | undefined) {
        if (!value) return ' ' + unit;
        return `${value}`.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,') + ' ' + unit;
    }

    const handleMove = (id: any) => {
        setRows(rows.filter(row => row.id !== id));
    };

    const handleInputChange = (id: number | string, name: keyof (typeof rows)[0], value: number | string | null) => {
        const updatedRows = rows.map(row =>
            row.id === id ? { ...row, [name]: value } : row
        );
        setRows(updatedRows);
    };


    const [isLoading, setIsLoading] = useState(false);
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const dataForm = {
                ...dataValue,
                dataPs: rows,
            };
            const response = await postApi('/promotion/create/mt', dataForm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                onClose();
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
        if (data) {
            setRows(data.pricesList);
        }
        if (product) {
            setDataValue({
                ...dataValue,
                productid: product ? product.product_uuid : '',
                dataPs: product ? product.pricesList : [],
            });
        }


    }, [data, product]);

    return (
        <Modal open={open} onClose={onClose}>
            <Modal.Header>
                <Modal.Title className='py-1'>ບັນທຶກຂໍ້ມູນໂປຣໂມຊັນ</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {product ? (
                    <Card shaded>
                        <Card.Header>
                            <HStack>
                                <Avatar src={product?.images ? product.url : './assets/img/icon/picture.jpg'} />
                                <VStack spacing={2}>
                                    <div className='fs-5'>{product?.sku}</div>
                                    <div className='fs-5'>{product?.productName}</div>
                                </VStack>
                            </HStack>
                        </Card.Header>
                        <Card.Body className='p-0 mt-1'>
                            <div className='table-responsive'>
                                <table className='table table-sm text-nowrap'>
                                    <thead>
                                        <tr>
                                            <th className='text-center w-5'>ລ/ດ</th>
                                            <th className='text-center'>ຈຳນວນຊື້</th>
                                            <th className='text-center'>ຈຳນວນແຖມ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.proms.map((val: any, key: number) => (
                                            <tr key={key}>
                                                <td className='text-center'>{key + 1}</td>
                                                <td className='text-center'>{val.qty_buy} {product?.unit.unitName}</td>
                                                <td className='text-center'>{val.qty_free} {product?.unit.unitName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card.Body>
                    </Card>
                ) : (
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
                )}
                <div className="table-responsive">
                    <table className='w-100 table table-sm mt-3'>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className='py-1'>
                                    <td className='text-center'>
                                        {row.id === 1 ? (
                                            <IconButton size='xs' onClick={handleAdd} appearance="primary" icon={<PlusRoundIcon />} className=' mt-4' />
                                        ) : (
                                            <IconButton color="red" size='xs' onClick={() => handleMove(row.id)} appearance="primary" icon={<MinusRoundIcon />} className=' mt-4' />
                                        )}
                                    </td>
                                    <th className='form-group'>
                                        <label className='form-label'>ຈຳນວນຊື້</label>
                                        <NumberInput size='sm' value={row.qty_buy} onChange={(value) => handleInputChange(row.id, 'qty_buy', value)} formatter={toThousands} placeholder="ຊື້" required />
                                    </th>
                                    <th className='form-group'>
                                        <label className='form-label'>ຈຳນວນແຖມ</label>
                                        <NumberInput size='sm' value={row.qty_free} onChange={(value) => handleInputChange(row.id, 'qty_free', value)} formatter={toThousands} placeholder="ແຖມ" required />
                                    </th>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button appearance="primary" color='red' onClick={onClose}>
                    ປິດ
                </Button>
                <Button appearance="primary" disabled={isLoading} onClick={handleSave}>ບັນທຶກ</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default FromAdd