'use client';
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { InputGroup, Input, NumberInput, Button, Whisper, Popover, RadioGroup, Radio, Grid, Row, Col, Stat, Loader, Textarea, Toggle } from 'rsuite';
// import SearchIcon from '@rsuite/icons/Search';
import numeral from 'numeral';
import { postApi } from '../../utils/Configs';
import { Notific } from '../../utils/Notification';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
import { useCountry } from '@/utils/selectOption';
import { toThousands } from '@/utils/formate';
interface Props {
    open: boolean;
    handleClose: () => void;
    data: any;
    reSpons: (data: any) => void;
    billId: (data: any) => void
}
const FormPaySales: React.FC<Props> = ({ open, handleClose, data, reSpons, billId }) => {
    const token = useToken();
    const shopid = getLocalStorageItem('shopid');
    const userid = getLocalStorageItem('user_uuid');
    const country = useCountry();

    const [inputs, setInputs] = useState<any>({
        shopid: shopid,
        customerid: 0,
        typesale: 1,
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
        createby: userid,
        description: ''
    });


    const [activeField, setActiveField] = useState<"getCash" | "getTransfer" | "discount">("getCash");
    const [autoAmounts, setAutoAmounts] = useState<number[]>([]);
    const handleChange = (name: keyof typeof inputs, value: any) => {
        const val = Number(value) || 0;
        setInputs({
            ...inputs,
            [name]: value
        });
        if (val > 0) {
            const base = val * 1000;
            setAutoAmounts([
                base,              // x1000
                base * 10,         // x10000
                base * 100,        // x100000
                base * 1000,        // x100000
            ]);
        } else {
            setAutoAmounts([]);
        }
    }
    // const handleFocus = (name: "getCash" | "getTransfer" | "discount") => {
    //     setActiveField(name);
    //     setAutoAmounts([]); // 🔥 รีเซ็ตปุ่มทุกครั้งที่เปลี่ยนช่อง
    // };

    const handleQuickAdd = (amount: number) => {
        setInputs((prev: any) => ({
            ...prev,
            [activeField]: amount,
        }));
    };


    useEffect(() => {
        setInputs((prevInputs: any) => {
            const rete = parseFloat(String(prevInputs.rate)) || 1;
            const getCash = parseFloat(String(prevInputs.getCash)) || 0;
            const getTransfer = parseFloat(String(prevInputs.getTransfer)) || 0;
            const balanceTotal = parseFloat(String(prevInputs.balance_payable)) || 0;
            const discount = parseFloat(String(prevInputs.discount)) || 0;
            const balance = balanceTotal - discount; // ຍອດຫຼັງຫຼັກສ່ວນຫຼຸດ

            const playBalance = getCash + getTransfer;
            const refund = playBalance >= balance ? playBalance - balance : 0;
            const balance_refund = refund * rete;
            return {
                ...prevInputs,
                balanceTotal: balance,
                balance_pays: playBalance,
                refund: balance_refund,
            };
        });
    }, [inputs.getCash, inputs.getTransfer, inputs.balance_payable, inputs.discount]);

    const [genus, setGenus] = useState<string>("₭");
    const [flag, setFlag] = useState<any>('🇱🇦');
    const handleCountry = (value: string | number, _event: React.SyntheticEvent) => {
        const selected = country.find((item) => item.value === value);
        const rate = selected?.rate ?? 1;
        const genusSymbol = selected?.genus ?? "";
        setFlag(selected?.icon ?? '');
        setGenus(genusSymbol);
        setInputs((prev: any) => ({
            ...prev,
            countryid: value,
            rate,
            discount: 0,
            balanceSale: Number(data.total || 0),
            balance_payable: Number(data.total || 0) / rate,
            getCash: 0,
            getTransfer: 0,
            balance_pays: 0,
            refund: 0,
        }));
    };

    const formatWithGenus = (value: number | string | null | undefined) => toThousands(value, genus);

    const speaker = (
        <Popover title="ສະກຸນເງິນ" >
            <RadioGroup name="radio-group" className='fs-5' defaultValue={inputs.countryid} onChange={handleCountry}>
                {country.map((item: any, index: number) => (
                    <Radio key={index} value={item.value} >{item.icon} {item.abbr} ( {item.genus} )</Radio>
                ))}
            </RadioGroup>
        </Popover>
    );

    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            const res = await postApi('/billsale/create', inputs, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            if (res.status === 200) {
                Notific.success(res.data.message);
                handleClose();
                reSpons(res.data);
                billId(res.data.billid);
            } else {
                Notific.error('ບໍ່ສາມາດສົ່ງຂໍ້ມູນນີ້ໄດ້');
            }
        } catch (error) {
            console.error('ບໍ່ສາມາດສົ່ງຂໍ້ມູນນີ້ໄດ້', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setInputs({
            ...inputs,
            shopid: shopid,
            balanceSale: data.total,
            balanceTotal: data.total,
            balance_payable: data.total,
            orderList: data.dataOrder.map((item: any) => ({
                cart_uuid: item.cart_uuid,
                productid: item?.productid,
                price_buy: item?.product?.buyPrices,
                price_sales: item.salePrices, // ✅ เปลี่ยนชื่อ field
                quantity: item.quantity,
                stock: item?.product?.stock
            })),
        });
    }, [shopid, data, data.total]);

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

    const [keyValue, setKeyValue] = useState<string>("");
    useEffect(() => {
        if (keyValue === "") {
            setInputs((prev: any) => ({ ...prev, [activeField]: 0 }));
        } else {
            setInputs((prev: any) => ({
                ...prev,
                [activeField]: parseFloat(keyValue) || 0,
            }));
        }
    }, [keyValue, activeField]);
    const handleKeyPress = (key: string) => {
        if (key === "C") {
            setKeyValue("");
            setInputs({
                ...inputs,
                discount: 0,
                getCash: 0,
                getTransfer: 0,
                balance_pays: 0,
            });
            setAutoAmounts([]);
            return;
        }

        if (key === "BACK") {
            setKeyValue((prev) => prev.slice(0, -1));
            return;
        }

        if (key === ".") {
            setKeyValue((prev) => (prev.includes(".") ? prev : prev + "."));
            return;
        }

        setKeyValue((prev) => prev + key);
        setTimeout(restoreFocus, 0);
    };
    const handleFocus = (name: "getCash" | "getTransfer" | "discount") => {
        setActiveField(name);
        setKeyValue(String(inputs[name] || ""));
        setAutoAmounts([]);
    };

    const cashRef = React.useRef<any>(null);
    const transferRef = React.useRef<any>(null);
    const discountRef = React.useRef<any>(null);

    const focusMap: Record<string, React.RefObject<any>> = {
        getCash: cashRef,
        getTransfer: transferRef,
        discount: discountRef,
    };

    const restoreFocus = () => {
        const ref = focusMap[activeField];
        ref?.current?.focus?.();
    };

    useEffect(() => {
        restoreFocus();
    }, [activeField]);


    return (
        <>
            <Modal {...modalProps} show={open} onHide={handleClose} className='modal-pos' scrollable={true}>
                <form onSubmit={handleSubmit}>
                    <Modal.Body className='modal-content modal-body-scroll'>
                        <div className="row">
                            {inputs.countryid !== 1 && (
                                <div className="col-sm-6">
                                    <div className="widget widget-stats bg-orange">
                                        <div className="stats-info">
                                            <h3>ລວມຍອດຂາຍ</h3>
                                            <p className='fs-1'>{toThousands(data.total, genus)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className={`${inputs.countryid === 1 ? '12' : 'col-sm-6'}`}>
                                <div className="widget widget-stats bg-blue">
                                    <div className="stats-icon text-white border rounded-pill" >
                                        <Whisper placement="auto" trigger="click" speaker={speaker}>
                                            <span role="button" style={{ cursor: 'pointer' }} >
                                                {genus}
                                            </span>
                                        </Whisper>
                                    </div>
                                    <div className="stats-info">
                                        <h3>ຍອດທີ່ຕ້ອງຈ່າຍ <span className="text-orange fs-5">({flag}: {toThousands(inputs.rate, genus)})</span></h3>
                                        <p className='fs-1'>{toThousands(numeral(inputs.balance_payable).format('0,0.000'), genus)}</p>
                                    </div>
                                </div>
                            </div>


                        </div>
                        <div className="row">
                            <div className={`${inputs.discount > 0 ? 'col-sm-6 col-6' : 'col-sm-12 col-12'} mb-2`}>
                                <div className="form-group">
                                    <label htmlFor="" className="form-label fs-5">ສ່ວນຫຼົດ</label>
                                    <NumberInput ref={cashRef} size='lg' value={inputs.discount} onChange={(value) => handleChange('discount', value)} onFocus={() => handleFocus("discount")} placeholder="0,00" formatter={formatWithGenus} className='px-1 border-orange' />
                                </div>
                            </div>
                            {inputs.discount > 0 && (
                                <div className='col-sm-6 col-6'>
                                    <div className="form-group">
                                        <label htmlFor="" className="form-label fs-5">ຍອດທີ່ຕ້ອງຈ່າຍ</label>
                                        <InputGroup inside className='bg-green-300 text-white'>
                                            {genus && <InputGroup.Addon className='text-white'>{genus}</InputGroup.Addon>}
                                            <Input size='lg' value={numeral(inputs.balanceTotal).format('0,0.00')} placeholder="0,00" className='px-1 fs-bold bg-green-300 text-white' />
                                        </InputGroup>
                                    </div>
                                </div>
                            )}

                            <div className="col-sm-6 mb-2">
                                <div className="form-group">
                                    <label htmlFor="" className="form-label fs-5">ຮັບເງິນສົດ</label>
                                    <NumberInput ref={transferRef} size='lg' value={inputs.getCash} onChange={(value) => handleChange('getCash', value)} onFocus={() => handleFocus("getCash")} placeholder="0,00" formatter={formatWithGenus} className='px-1' />
                                </div>
                            </div>
                            <div className="col-sm-6 mb-2">
                                <div className="form-group">
                                    <label htmlFor="" className="form-label fs-5">ຮັບເງິນໂອນ</label>
                                    <NumberInput ref={discountRef} size='lg' value={inputs.getTransfer} onChange={(value) => handleChange('getTransfer', value)} onFocus={() => handleFocus("getTransfer")} placeholder="0,00" formatter={formatWithGenus} className='px-1' />
                                </div>
                            </div>
                            {inputs.refund > 0 && (
                                <div className="col-sm-12 mb-12">
                                    <Stat bordered icon={<i className="fa-solid fa-kip-sign fs-1" />} className='bg-orange-200 py-2'>
                                        <Stat.Value>{numeral(inputs.refund).format('0,0.00')}</Stat.Value>
                                        <Stat.Label className='fs-5'>ເງິນທອນ</Stat.Label>
                                    </Stat>
                                </div>
                            )}
                        </div>
                        {autoAmounts.length > 0 && (
                            <Grid fluid className="w-100 mt-1">
                                <Row gutter={4}>
                                    {autoAmounts.map((amt) => (
                                        <Col span={{xs:6}} key={amt}>
                                            <Button
                                                appearance="ghost"
                                                size="lg"
                                                block
                                                onClick={() => handleQuickAdd(amt)}
                                            >
                                                {numeral(amt).format("0,0")}
                                            </Button>
                                        </Col>
                                    ))}
                                </Row>
                            </Grid>
                        )}
                        <div className="fs-5 mb-2 text-end">
                            <span className='px-3 fs-5'><i className="fa-regular fa-keyboard" /> keyboard</span>
                            <Toggle size={'sm'} checkedChildren="ເປິດ" unCheckedChildren="ປິດ" defaultChecked />
                        </div>
                        <Grid fluid>
                            <Row gutter={[3, 3]}>
                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" onClick={() => handleKeyPress("7")} className='fs-2' block> 7 </Button></Col>
                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" onClick={() => handleKeyPress("8")} className='fs-2' block> 8 </Button></Col>
                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" onClick={() => handleKeyPress("9")} className='fs-2' block> 9 </Button></Col>
                                <Col span={6}><Button color="orange" size='lg' appearance="primary" onClick={() => handleKeyPress("BACK")} className='fs-2' block> <i className="fa-solid fa-delete-left fs-2" /></Button></Col>

                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" onClick={() => handleKeyPress("4")} className='fs-2' block> 4 </Button></Col>
                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" onClick={() => handleKeyPress("5")} className='fs-2' block> 5 </Button></Col>
                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" onClick={() => handleKeyPress("6")} className='fs-2' block> 6 </Button></Col>
                                <Col span={6}><Button color="red" size='lg' appearance="primary" onClick={() => handleKeyPress("C")} className='fs-2' block>C</Button></Col>

                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" onClick={() => handleKeyPress("1")} className='fs-2' block> 1 </Button></Col>
                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" onClick={() => handleKeyPress("2")} className='fs-2' block> 2 </Button></Col>
                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" onClick={() => handleKeyPress("3")} className='fs-2' block> 3 </Button></Col>
                                <Col span={6}><Button color="green" size='lg' appearance="primary" onClick={() => {
                                    setKeyValue(String(inputs.balanceTotal));
                                }} className='fs-3' block>ຈ່າຍພໍດິ</Button></Col>

                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" className='fs-2' onClick={() => handleKeyPress(".")} block> . </Button></Col>
                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" className='fs-2' onClick={() => handleKeyPress("0")} block> 0 </Button></Col>
                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" className='fs-2' onClick={() => handleKeyPress("00")} block> 00 </Button></Col>
                                <Col span={6}><Button color="cyan" size='lg' appearance="primary" className='fs-2' onClick={() => handleKeyPress("000")} block>000</Button></Col>
                            </Row>
                        </Grid>
                        {/* <div className="form-group mt-2">
                            <label htmlFor="" className="form-label fs-5">ລາຍລະອຽດ</label>
                            <Textarea  value={inputs.description} onChange={(e) => handleChange('description', e)} placeholder="ລາຍລະອຽດ"  />
                        </div> */}
                    </Modal.Body>
                    <Modal.Footer className={`modal-footer-responsive  ${!isDesktop ? "mobile" : ""}`}>
                        <div className="row w-100 m-0">
                            <div className="col-6 p-1">
                                <Button color="red" size="lg" onClick={handleClose} appearance="primary" block > ຍົກເລີກ </Button>
                            </div>
                            <div className="col-6 p-1">
                                <Button type="submit" size="lg" disabled={loading} appearance="primary" block > {loading ? <Loader content={'ກໍາລັງບັນທຶກ...'} /> : "ບັນທຶກຂາຍ"} </Button>
                            </div>
                        </div>
                    </Modal.Footer>
                </form>
            </Modal >

        </>
    )
}

export default FormPaySales
