'use client'
import React,{ useState, useEffect,useRef} from 'react'
import { Button,Loader} from 'rsuite';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import { CONFIG } from '@/utils/Config';
import axios from 'axios';
import numeral from 'numeral';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from 'sweetalert2';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
interface Props {
    open: boolean;
    handleClose: () => void;
    data: any;
}
const ViewPurchase: React.FC<Props> = ({ open, handleClose, data }) =>{
    const api = CONFIG.URLAPI;
    const token = useToken();
    const shopId=getLocalStorageItem('shopid');
    const deletes=getLocalStorageItem('deletes');
    const [itemList, setItemList] = useState<any[]>([]);
    const feftchData = async () => {
        try {
            const response = await axios.get(`${api}/purchase/main/${data._uuid}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setItemList(response.data.data);
        } catch (error) {
            console.error("Error:", error);
        }   
    }

    const [shop,setShop]=useState<any>({});
    const fetchShop = async () => {
        try {
            const response = await axios.get(`${api}/system/${shopId}`);
            setShop(response.data);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const [loading, setLoading] = useState(false);
    // const handleDownload = () => {
    //     setLoading(true);
    //     const input = document.getElementById("pdf-content"); 
    //     html2canvas(input).then((canvas) => {
    //       const imgData = canvas.toDataURL("image/png");
    //       const pdf = new jsPDF();
    //       pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    //       pdf.save(`Bill-${data.order_number}.pdf`);
    //     }) .finally(() => {
    //       setLoading(false);
    //     });
    //   };
    


const handleDownload = async () => {
  setLoading(true);
  const input = document.getElementById("pdf-content");
  if (!input) return;

  try {
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`Bill-${data.billno}.pdf`);
  } catch (err) {
    console.error("PDF error:", err);
  } finally {
    setLoading(false);
  }
};

const handleDelete = (id:string) => {
    Swal.fire({
        icon: "warning",
        title: "ທ່ານຕ້ອງການລົບຂໍ້ມູນການສັ່ງຊື້ນີ້ແທ້ບໍ່?",
        showDenyButton: true,
        confirmButtonText: "ຕົກລົງ",
        denyButtonText: `ບໍ່ຕ້ອງການ`
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire("Saved!", "", "success");
        }
      });
}
    useEffect(() => {
        if(!data && !token) return
        feftchData();
        fetchShop();
    },[data,token]);
    return (
        <Modal size='xl' show={open} onHide={handleClose}>
            <Modal.Body id='pdf-content'>
                <table className="table table-sm">
                    <tbody>
                        <tr className='border-none'>
                            <th className='text-start border-0 py-1' style={{ width: '33.33%' }}>
                                <img src="../assets/img/logo/PLC.ico" className='w-25' alt="" />
                                <p className='fs-4'>ຮ້ານ: {data?.shop?.shopName}</p>
                                <p className='fs-5 mt-n3'>ທີຢູ່: {data?.shop?.village}, {data?.shop?.district?.distName}, {data?.shop?.district?.province?.provinceName}</p>
                                <p className='fs-5 mt-n3'>ເບີໂທລະສັບ: {data?.shop?.phone}</p>
                            </th>
                            <th className='text-center py-1 border-0  fs-3' style={{ width: '33.33%' }}>
                                <u className='mt-4'>ໃບແຈ້ງໜີ້ການສັ່ງຊື້</u>
                            </th>
                            <th className='text-end py-1 border-0' style={{ width: '33.33%' }}>
                                <p className='fs-4'>ເລກທີ່ສັ່ງຊື້: {data.billno}</p>
                                <p className='fs-5 mt-n3'>ວັນທີສັ່ງຊື້: {moment(data.createdAt).format('DD /MM /YYYY')} </p>
                                {data.imports === 1 ? <span className='fs-16px text-orange'><i className="fa-solid fa-circle-exclamation"></i> ຢູ່ລະຫວ່າງການສັ່ງຊື້ ....... </span>
                                    :data.imports === 2 ? 
                                <p className='fs-5'>ວັນທີນຳເຂົ້າ: {moment(data.updatedAt).format('DD /MM /YYYY')} 
                                    <br />
                                    <span className='fs-14px text-green'>✅ ການສັ່ງຊື້ໄດ້ຮັບການນຳເຂົ້າສຳເລັດ</span>
                                </p>
                                :
                                <span className='fs-14px text-red'>ການສັ່ງຊື້ໄດ້ຖຶກຍົກເລີກແລ້ວ {moment(data.updatedAt).format('DD /MM /YYYY HH:mm')} </span>}
                            </th>
                        </tr>
                    </tbody>
                </table>
                <table width={'100%'} className='text-nowrap mt-n3 fs-15px'>
                    <tbody >
                    <tr>
                        <th className='w-5 text-end'> ຮ້ານຄ້າ:</th>
                        <td className='border-dotted'>{data?.supplier?.supplierName}</td>,
                        <th className='w-6 text-end'>ເບີໂທລະສັບ:</th>
                        <td className='border-dotted'>{data?.supplier?.phone}</td>,
                        <th className='w-5 text-end'>ທີຢູ່:</th>
                        <td className='border-dotted'>{data?.supplier?.villageName},{data?.supplier?.districtName},{data?.supplier?.provinceName}</td>
                    </tr>
                    </tbody>
                </table>
                <table className='table table-bordered text-nowrap mt-3 mb-5'>
                    <thead className='bg-default'>
                        <tr>
                            <th className='text-center w-5'>ລ/ດ</th>
                            <th className=''>ລາຍການສິນຄ້າ</th>
                            <th className='text-end w-15'>ລາຄາຊື້</th>
                            <th className='text-center w-10'>ຈໍານວນ</th>
                            <th className='text-end w-10'>ຈຳນວນເງິນ</th>
                            <th className='text-end w-10'>ສ່ວນຫຼຸດ</th>
                            <th className='text-end w-15'>ລວມເງິນ</th>
                            </tr>
                    </thead>
                    <tbody>
                      {itemList.map((item, index) => (
                        <tr key={index}>
                          <td className='text-center'>{index + 1}</td>
                          <td>{item?.product?.productName}</td>
                          <td className='text-end'>{numeral(item.prices_order).format('0,0')} </td>
                          <td className='text-center'>{item.qty_order} {item?.product?.unit.unitName}</td>
                          <td className='text-end'>{numeral(item.balance_total).format('0,0')}</td>
                          <td className='text-end'></td>
                          <td className='text-end'></td>
                        </tr>
                      ))}
                      <tr className='fs-4 border-0'>
                        <td colSpan={3} className='border-0'>
                            <div className="row text-center">
                                <div className="col-6">ຜູ້ຮັບເງິນ <br /> CASHIER</div>
                                <div className="col-6">ຜູ້ຈ່າຍເງິນ <br /> CUSTOMER</div>
                            </div>
                        </td>
                        <td className='text-end border-0'>ລວມເງິນ <br /> TOTAL</td>
                        <td className='text-end border'>{numeral(data.total_orders).format('0,0.00')}</td>
                        <td className='text-end border'></td>
                        <td className='text-end border'></td>
                      </tr>
                    </tbody>
                </table>
            </Modal.Body>
            <Modal.Footer className='py-2'>
                <Button onClick={handleDownload} color='green' appearance="primary">{loading ? <Loader content="ກຳລັງໂຫຼດ..." /> : (<><i className="fa-solid fa-download me-1"/> PDF</>)}</Button>
                <Button onClick={handleClose} color='orange' appearance="primary">ຍົກເລີກ</Button>
                <Button onClick={()=>handleDelete(data._uuid)}  disabled={deletes !=='1'} color='red' appearance="primary">ລົບອອກ </Button>
                <Button onClick={handleClose} color='red' appearance="primary"><i className="fa-solid fa-xmark fs-3"></i></Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ViewPurchase