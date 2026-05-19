'use client'
import React, { useEffect, useState } from 'react'
import PageContainer from '@/components/PageContainer';
import { Col, Grid, Row, DateRangePicker, SelectPicker, InputPicker, HStack, InputGroup, Input, Button, IconButton, Popover, Dropdown, Whisper, Loader, Placeholder } from 'rsuite';
import { setupDate } from '@/utils/formate';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
// import PageEndIcon from '@rsuite/icons/PageEnd';
import SearchIcon from '@rsuite/icons/Search';
import { usePage,useExpress } from '@/utils/selectOption';
import GridIcon from '@rsuite/icons/Grid';
import CheckIcon from '@rsuite/icons/Check';
import MoveDownIcon from '@rsuite/icons/MoveDown';
import numeral from 'numeral';
import { postApi } from '@/utils/Configs';
import moment from 'moment';
import NextPages from '@/utils/NextPages';
import DocPassIcon from '@rsuite/icons/DocPass';
import WarningRoundIcon from '@rsuite/icons/WarningRound';
import CheckRoundIcon from '@rsuite/icons/CheckRound';
import { BsPrinterFill } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
import { FaBarcode } from "react-icons/fa6";
import { BsPaypal } from "react-icons/bs";
import { MdAccountBalanceWallet } from "react-icons/md";
import { FaListOl } from "react-icons/fa";
const SalesOnle: React.FC = () => {
    const token = useToken();
    const shopid = getLocalStorageItem('shopid');
    const company = useExpress();
    const [values, setValues] = useState({
        shopid: shopid,
        companyid: '',
        status_pay: null,
        cod: null,
        startDate: new Date(),
        endDate: new Date(),
    });


    const [isLoading, setIsLoading] = useState(true);
    const [itemData, setItemData] = useState<any[]>([]);
    const [filter, setFilter] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const offset = (currentPage - 1) * itemsPerPage;
const [sum,setSum] = useState<any>({});
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await postApi(`/online/fetch?skip=${offset}&limit=${itemsPerPage}`, values, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const dataJson = await response.data;
            if (response.status === 200) {
                setItemData(dataJson.data);
                setFilter(dataJson.data);
                setTotalItems(dataJson.total);
                setSum(dataJson.sums);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };


    const pages = usePage(totalItems);
    const handleFilter = (event: any) => {
        const query = event.toLowerCase();
        setItemData(
            filter.filter(
                n => n.codebill.toLowerCase().includes(query) ||
                    n.phone.toLowerCase().includes(query)
            )
        );
    };

    useEffect(() => {
        if (!token || !shopid) return
        fetchData();
    }, [token, shopid, currentPage, itemsPerPage]);



    const [dateRange, setDateRange] = useState<[Date, Date] | null>([
        values.startDate,
        values.endDate,
    ]);
    const handleDateChange = (range: [Date, Date] | null) => {
        if (range) {
            setDateRange(range);
            setValues({
                ...values,
                startDate: range[0],
                endDate: range[1],
            });
        }
    };

    const renderSpeaker = (props: any, ref: React.Ref<HTMLDivElement>) => {
        const { onClose, className, left, top, ...rest } = props;

        const handleSelect = () => {
            onClose?.();
        };

        return (
            <Popover
                ref={ref}
                className={className}
                style={{ left, top }}
                full
                {...rest}

            >
                <Dropdown.Menu onSelect={handleSelect} className='px-1'>
                    <Dropdown.Item icon={<BsPrinterFill />} eventKey={3} className='rounded-4'>  ພີມລາຍງານ </Dropdown.Item>
                    <Dropdown.Item icon={<FaBarcode/>} eventKey={4} className='rounded-4'> ພີມບິນບາໂຄດ </Dropdown.Item>
                    <Dropdown.Item icon={<FaCheckCircle />} eventKey={5} className='rounded-4 text-green'> ອັບເດດສະຖານະ</Dropdown.Item>
                </Dropdown.Menu>
            </Popover>
        );
    };

    const printBill = (bill_uuid: number) => {
        console.log("Print bill", bill_uuid);
    };



    const columns = [
        { class: 'text-center w-5', cols: 'ລ/ດ' },
        { class: 'text-center', cols: 'ວັນທີຂາຍ' },
        { class: 'text-center', cols: 'ລະຫັດບິນ' },
        { class: '', cols: 'ຊື່ສິນຄ້າ' },
        { class: '', cols: 'ຊື່ລູກຄ້າ' },
        { class: '', cols: 'ເບີໂທລະສັບ' },
        { class: '', cols: 'ບໍລິສັດຂົນສົ່ງ' },
        { class: '', cols: 'ສາຂາ' },
        { class: 'text-center', cols: 'ສະຖານະຈ່າຍ' },
        { class: 'text-end', cols: 'COD' },
        { class: 'text-center', cols: 'ສະຖານະສົ່ງສຳເລັດ' },
        { class: 'text-center sticky-col right-col', cols: '#' },
    ]
    return (
        <PageContainer>
            <div className="row">
                {/* BEGIN col-3 */}
                <div className="col-xl-3 col-md-6">
                    <div className="widget widget-stats bg-dark border-bottom border-4 border-red rounded-bottom-4 rounded-top-4">
                        <div className="stats-icon text-white">
                            <FaListOl />
                        </div>
                        <div className="stats-info">
                            <h4 className="fs-5">ຍອດຂາຍທັງໝົດ</h4>
                            <p>{sum.total_items || 0} ອໍເດີ</p>
                        </div>
                    </div>
                </div>
                {/* END col-3 */}
                {/* BEGIN col-3 */}
                <div className="col-xl-3 col-md-6">
                    <div className="widget widget-stats bg-dark border-bottom border-4 border-red rounded-bottom-4 rounded-top-4">
                        <div className="stats-icon text-white">
                            <BsPaypal />
                        </div>
                        <div className="stats-info">
                            <h4 className="fs-5">ຍອດຈ່າຍຕົ້ນທາງ</h4>
                            <p>{sum.item_start || 0} ອໍເດີ</p>
                        </div>
                    </div>
                </div>
                {/* END col-3 */}
                {/* BEGIN col-3 */}
                <div className="col-xl-3 col-md-6">
                    <div className="widget widget-stats bg-dark border-bottom border-4 border-red rounded-bottom-4 rounded-top-4">
                        <div className="stats-icon text-white">
                            <i className="fa fa-users" />
                        </div>
                        <div className="stats-info">
                            <h4 className="fs-5">ຍອດຈ່າຍປາຍທາງ</h4>
                            <p>{sum.item_end || 0} ອໍເດີ</p>
                        </div>
                    </div>
                </div>
                {/* END col-3 */}
                {/* BEGIN col-3 */}
                <div className="col-xl-3 col-md-6">
                    <div className="widget widget-stats bg-dark border-bottom border-4 border-red rounded-bottom-4 rounded-top-4">
                        <div className="stats-icon text-white">
                            <MdAccountBalanceWallet />
                        </div>
                        <div className="stats-info">
                            <h4 className="fs-5">ລວມຍອດ COD</h4>
                            <p>{numeral(sum.total_cod || 0).format('0,0')}</p>
                        </div>
                    </div>
                </div>
                {/* END col-3 */}
            </div>

            <Grid fluid className='mb-3'>
                <Row>
                    <Col span={{ xs:24, sm:12, md:6, lg:6}}>
                        <div className="form-group">
                            <label className='form-label'>ວັນທີຂາຍ</label>
                            <DateRangePicker
                                value={dateRange}
                                onChange={handleDateChange}
                                format="dd/MM/yyyy"
                                placeholder="ເລືອກວັນທີ"
                                showOneCalendar
                                ranges={setupDate} // ✅ ใช้ preset ມື້ນີ້/ອາທິດນີ້/ເດືອນນີ້
                                block
                            />

                        </div>
                    </Col>
                    <Col span={{xs:24, sm:12, md:6, lg:6}}>
                        <div className="form-group">
                            <label className='form-label'>ບໍລິສັດຂົນສົ່ງ</label>
                            <SelectPicker data={company} value={values.companyid} onChange={(e)=>setValues({...values,companyid:e})} placeholder='ເລືອກບໍລິສັດຂົນສົ່ງ' block />
                        </div>
                    </Col>
                    <Col span={{xs:24, sm:12, md:4, lg:4}}>
                        <div className="form-group">
                            <label className='form-label'>ສະຖານະຈ່າຍ</label>
                            <InputPicker data={[
                                { value: 1, label: <span className='fs-5'><CheckIcon color='green' /> ຈ່າຍຕົ້ນທາງ</span> },
                                { value: 2, label: <span className='fs-5'><MoveDownIcon color='orange' /> ຈ່າຍປາຍທາງ</span> },
                            ]} value={values.status_pay} onChange={(e)=>{setValues({...values,status_pay:e})}} placeholder='ເລືອກສະຖານະຈ່າຍ' block />
                        </div>
                    </Col>
                    <Col span={{xs:24, sm:12, md:4,lg:4 }}>
                        <div className="form-group">
                            <label className='form-label'>COD</label>
                            <InputPicker data={[
                                { value: 1, label: <span><WarningRoundIcon color='red' /> ບໍ່ມີ COD</span> },
                                { value: 2, label: <span><CheckRoundIcon color='green' /> ມີຄ່າ COD</span> },
                            ]} value={values.cod} onChange={(e)=>setValues({...values,cod:e})} placeholder='COD' block />
                        </div>
                    </Col>
                    <Col span={{xs:4, sm:12, md:4, lg:4 }}>
                        <Button appearance='primary' onClick={fetchData} className='mt-4' color='red'>ຄົ້ນຫາ</Button>
                        <Whisper placement="bottomEnd" trigger="click" speaker={(props, ref) => renderSpeaker(props, ref)}>
                            <IconButton icon={<GridIcon />} appearance="ghost" className='mt-4 ms-2' />
                        </Whisper>
                    </Col>
                </Row>
            </Grid>
            <Grid fluid className='mb-1'>
                <Row className="show-grid">
                    <Col span={{ xs: 6, sm: 8, md: 8, lg: 5, xl: 4 }}>
                        <HStack>
                            <label className='d-sm-block d-none'>ສະແດງ</label>
                            <InputPicker data={pages} value={itemsPerPage} onChange={(e) => setItemsPerPage(e)} />
                            <label className='d-sm-block d-none'>ລາຍການ</label>
                        </HStack>
                    </Col>
                    <Col span={{ xs: 10, sm: 8, lg: 6, xl: 6 }} push={{ xs: 8, sm: 8, lg: 13, xl: 14 }}>
                        <InputGroup inside>
                            <InputGroup.Addon><SearchIcon /></InputGroup.Addon>
                            <Input onChange={handleFilter} placeholder="ເລກທີ່ບິນ /ຊື່ລູກຄ້າ.." />
                        </InputGroup>
                    </Col>
                </Row>
            </Grid>
            <div className="table-responsive wrapper">
                <table className="table table-bordered table-striped table-hover text-nowrap">
                    <thead>
                        <tr>
                            {columns.map((item: any, index: number) => (
                                <th key={index} className={item.class}>{item.cols}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center">
                                    <Placeholder.Grid rows={5} columns={6} active />
                                    <Loader content={'ກຳລັງໂຫຼດຂໍ້ມູນ...'} size='lg' vertical />
                                </td>
                            </tr>
                        ) : (itemData.length > 0 ?
                            itemData.map((item: any, index: number) => (
                                <tr key={index}>
                                    <td className='text-center'>{index + offset + 1}</td>
                                    <td className='text-center'>{moment(item.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                                    <td className='text-center text-green'>
                                        <Whisper
                                            placement="top"
                                            trigger="click"
                                            speaker={
                                                <Popover title={
                                                    <div className="flex items-center gap-1">
                                                        <DocPassIcon /> {item.codebill}
                                                    </div>
                                                } className='p-1 px-2'>
                                                    <Button size='sm'
                                                        color="green"
                                                        appearance="ghost"
                                                        block
                                                        onClick={() => printBill(item.bill_uuid)}
                                                    >
                                                        ພີມບິນຝາກເຄື່ອງ
                                                    </Button>
                                                </Popover>
                                            }
                                        >
                                            <span role='button'> {item.codebill}</span>
                                        </Whisper>
                                    </td>
                                    <td>{item.title}</td>
                                    <td>{item.fullnames}</td>
                                    <td>{item.phone}</td>
                                    <td>{item.company.names}</td>
                                    <td>{item.branch_name}</td>
                                    <td className='text-center'>{item.status_pay === 1 ? <><CheckIcon color='green' /> ເກັບຕົ້ນທາງ </> : <><MoveDownIcon color='orange' /> ເກັບປາຍທາງ</>}</td>
                                    <td className='text-end'>{numeral(item.balance).format('0,0')}</td>
                                    <td className='text-center'>{item.status === 1 ? 'ລໍຖ້າຮັບເຄື່ອງ' : <><CheckIcon color='green' /> ສົ່ງສຳເລັດ</>}</td>
                                    <td className='text-center bg-white sticky-col right-col'>
                                        {item.status === 1 ? (
                                            <input className="form-check-input" type="checkbox" id={`key${index}`} />
                                        ) : (
                                            <i className="fa-solid fa-square-check fs-3 text-blue" />
                                        )}

                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center text-red">=========== ບໍ່ມີຂໍ້ມູນການຂາຍ =============</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
            <NextPages dataTotal={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />

        </PageContainer>
    )
}

export default SalesOnle