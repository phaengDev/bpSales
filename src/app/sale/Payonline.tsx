'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import numeral from 'numeral';
import { Input, InputGroup, Button, Loader } from 'rsuite';
import Select from "react-select";
import { useExpress, useProvince } from '@/utils/selectOption';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import { postApi } from '@/utils/Configs';
import { Notific } from '@/utils/Notification';
interface Props {
    open: boolean;
    onClose: () => void;
    data: any;
    resPonse: (data: any) => void;
}

interface OptionType {
    value: string | number;
    label: string;
}

const Payonline: React.FC<Props> = ({ open, onClose, data, resPonse }) => {
    const token = useToken();

    const userName = getLocalStorageItem('userName');
    const shopid = getLocalStorageItem('shopid');

    const companies = useExpress();
    const provinces = useProvince();

    const [values, setValues] = useState<any>({
        title: '',
        companyid: '',
        provinceid: '',
        fullnames: '',
        phone: '',
        branch_name: null,
        cod: 1,
        balance: 0,
        typepay: 1,

        shopid: shopid,
        customerid: 0,
        typesale: 2,
        countryid: 1,
        rate: 1,
        balanceSale: 0,
        balanceTotal: 0,
        taxBalance: 0,
        discount: 0,
        balance_payable: 0,
        getCash: 0,
        getTransfer: 0,
        balance_pays: 0,
        refund: 0,

        orderList: [],
        createby: userName,
    });
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            const res = await postApi('/billsale/create/online', values, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            if (res.status === 200) {
                Notific.success(res.data.message);
                onClose();
                resPonse(res.data.data);
            } else {
                Notific.error('ບໍ່ສາມາດສົ່ງຂໍ້ມູນນີ້ໄດ້');
            }
        } catch (error) {
            console.error('ບໍ່ສາມາດສົ່ງຂໍ້ມູນນີ້ໄດ້', error);
        } finally {
            setLoading(false);
        }
    }

    // -----------------------------------
    //  LOAD INITIAL DATA
    // -----------------------------------
    useEffect(() => {
        if (!data) return;

        setValues((prev: any) => ({
            ...prev,
            cod: 1,
            balance: data.total,
            typepay: 1,
            shopid: shopid,
            balanceSale: data.total,
            balanceTotal: data.total,
            balance_payable: data.total,
            getTransfer: data.total,
            balance_pays: data.total,
            orderList: data.dataOrder.map((item: any) => ({
                cart_uuid: item.cart_uuid,
                productid: item?.productid,
                price_buy: item?.product?.buyPrices,
                price_sales: item.salePrices,
                quantity: item.quantity,
                stock: item?.product?.stock
            }))
        }));

    }, [data, shopid]);

    // -----------------------------------
    //  HANDLE COD CHECKBOX
    // -----------------------------------
    const handleInputChange = (checked: boolean) => {
        const value = checked ? 2 : 1;

        setValues((prev: any) => ({
            ...prev,
            cod: value,
            balance: value === 2 ? data.total : 0
        }));
    };
    const [isDesktop, setIsDesktop] = useState<boolean>(true);
    // ✅ ตรวจสอบขนาดหน้าจอ
    useEffect(() => {
        const checkScreen = () => setIsDesktop(window.innerWidth >= 992); // breakpoint: lg ขึ้นไป
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);
    const modalProps = isDesktop
        ? { size: 'lg' as const }
        : { fullscreen: true as const };

    return (
        <Modal {...modalProps} show={open} onHide={onClose} size="lg" backdrop="static">
            <form onSubmit={handleSubmit}>
                <Modal.Body className="p-0">
                    {/* TOP BAR */}
                    <div className="widget widget-stats bg-red py-1 rounded-bottom-5">
                        <div className="stats-icon text-white border rounded-pill">
                            <i className="fa-solid fa-kip-sign"></i>
                        </div>
                        <div className="stats-info">
                            <h3>ຍອດທີ່ຕ້ອງຈ່າຍ</h3>
                            <p className="fs-1">
                                {numeral(data.total).format('0,0')}
                                <i className="fa-solid fa-kip-sign"></i>
                            </p>
                        </div>
                    </div>
                    {/* FORM */}
                    <div className="px-3">
                        <div className="row mb-4">

                            {/* Title */}
                            <div className="col-sm-12 mb-2">
                                <label className="form-label">ຊື່ສິນຄ້າ</label>
                                <Input
                                    value={values.title}
                                    onChange={(e) => setValues({ ...values, title: e })}
                                    placeholder="ຊື່ສິນຄ້າ"
                                />
                            </div>

                            {/* Customer Name */}
                            <div className="col-sm-6 mb-2">
                                <label className="form-label">ຊື່ຜູ້ຮັບ</label>
                                <Input
                                    value={values.fullnames}
                                    onChange={(e) =>
                                        setValues({ ...values, fullnames: e })
                                    }
                                    placeholder="ຊື່ຜູ້ຮັບ"
                                />
                            </div>

                            {/* phone */}
                            <div className="col-sm-6 mb-2">
                                <label className="form-label">ເບີໂທລະສັບ</label>
                                <InputGroup inside>
                                    <InputGroup.Addon>
                                        <i className="fa-solid fa-phone"></i>
                                    </InputGroup.Addon>
                                    <Input
                                        value={values.phone}
                                        onChange={(e) =>
                                            setValues({ ...values, phone: e })
                                        }
                                        placeholder="ເບີໂທ"
                                    />
                                </InputGroup>
                            </div>

                            {/* Company */}
                            <div className="col-sm-6 mb-2">
                                <label className="form-label">ບໍລິສັດຂົນສົ່ງ</label>
                                <Select<OptionType>
                                    options={companies}
                                    value={companies.find((o) => o.value === values.companyid) || null}
                                    onChange={(opt) =>
                                        setValues({ ...values, companyid: opt?.value ?? '' })
                                    }
                                    placeholder="ເລືອກບໍລິສັດ"
                                    isClearable
                                    isSearchable
                                    className="fs-5"
                                />
                            </div>

                            {/* Province */}
                            <div className="col-sm-6 mb-2">
                                <label className="form-label">ແຂວງ</label>
                                <Select<OptionType>
                                    options={provinces}
                                    value={provinces.find((o) => o.value === values.provinceid) || null}
                                    onChange={(opt) =>
                                        setValues({ ...values, provinceid: opt?.value ?? '' })
                                    }
                                    placeholder="ເລືອກແຂວງ"
                                    isClearable
                                    isSearchable
                                    className="fs-5"
                                />
                            </div>

                            <div className="col-sm-6">
                                <div className="row">
                                    {/* Payment Type */}
                                    <label className="form-label col-form-label col-md-3 fs-5">
                                        ຄ່າຂົນສົ່ງ:
                                    </label>

                                    <div className="col-md-9 pt-2">
                                        <div className="form-check form-check-inline fs-5">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                checked={values.typepay === 1}
                                                onChange={() =>
                                                    setValues({ ...values, typepay: 1 })
                                                }
                                            />
                                            <label className="form-check-label text-green">
                                                ຈ່າຍຕົ້ນທາງ
                                            </label>
                                        </div>

                                        <div className="form-check form-check-inline fs-5">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                checked={values.typepay === 2}
                                                onChange={() =>
                                                    setValues({ ...values, typepay: 2 })
                                                }
                                            />
                                            <label className="form-check-label text-orange">
                                                ຈ່າຍປາຍທາງ
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group mt-2">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={values.cod === 2}
                                            onChange={(e) => handleInputChange(e.target.checked)}
                                        />
                                        <label className="form-label text-blue ms-2">
                                            ເກັບປາຍທາງ COD
                                            {values.cod === 2 && (
                                                <i className="fa-solid fa-check fs-3 ms-2"></i>
                                            )}
                                        </label>

                                        {values.cod === 2 && (
                                            <div className="px-3 mt-n1 fs-3 text-green">
                                                {numeral(values.balance).format('0,0')} ₭
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* COD */}
                            <div className="col-sm-6 mb-2">
                                <div className="form-group mt-2">
                                    <label htmlFor="" className='from-label'>ສາຂາປາຍທາງ</label>
                                    <Input as={'textarea'} rows={3} value={values.branch_name} onChange={(e) => setValues({ ...values, branch_name: e })} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className={`modal-footer-responsive border-0 ${!isDesktop ? "mobile" : ""}`}>
                    <div className="row  w-100 m-0">
                        <div className="col-md-6 col-6 ">
                            <Button color="red" appearance="primary" onClick={onClose} block>
                                ຍົກເລີກ
                            </Button>
                        </div>

                        <div className="col-md-6 col-6 ">
                            <Button type="submit" disabled={loading} color="green" appearance="primary" block>
                                {loading ? <Loader content={'ກຳລັງບັນທຶກ..'} /> : 'ບັນທຶກພີມບິນ'}
                            </Button>
                        </div>

                    </div>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default Payonline;
