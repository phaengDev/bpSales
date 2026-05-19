'use client'
import React, { useState, useEffect } from 'react';
import { Grid, Row, Col, Button, Placeholder } from 'rsuite';
import { getApi } from '@/utils/Configs';
import { useToken } from '@/hooks/useToken';
import { Modal } from 'react-bootstrap';
import numeral from 'numeral';
import moment from 'moment';

interface Props {
    open?: boolean;
    onClose?: () => void;
    billid: number;
}
const BillSales: React.FC<Props> = ({ open, onClose, billid }) => {
    const token = useToken();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!open) return;

        const styleId = 'bill-sales-style';
        if (!document.getElementById(styleId)) {
            const link = document.createElement('link');
            link.id = styleId;
            link.rel = 'stylesheet';
            link.href = '/styles/style.css';
            document.head.appendChild(link);
        }

        return () => {
            document.getElementById(styleId)?.remove();
        };
    }, [open]);

    const fetchDataList = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await getApi(`/billsale/${billid}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setData(response.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }
    // const [genus, setGenus] = useState<string>('');
    useEffect(() => {
        fetchDataList();
    }, [billid, token]);

    // ด้านบนไฟล์ component // ✅ ใช้ ?inline เพื่อ import เนื้อหาเป็น string
   const handlePrint = async () => {
  const page1 = document.getElementById("print-page-1");
  if (!page1) return;

  const cssText = await fetch("/styles/style.css").then((res) => res.text());

  // 🟢 สร้าง HTML Page 2 ด้วย JS (ไม่ใช่ JSX)
  const page2HTML = `
    <main class="container receipt-wrapper">
      <ul class="text-list text-style1 mb-20">
        <li>
          <div class="text-list-title">Date:</div>
          <div class="text-list-desc">${moment(data?.createdAt).format(
            "DD/MM/YYYY"
          )}</div>
        </li>
        <li class="text-right">
          <div class="text-list-title">Time:</div>
          <div class="text-list-desc">${moment(data?.createdAt).format(
            "HH:mm:ss"
          )}</div>
        </li>
        <li>
          <div class="text-list-title">ພະນັກງານ:</div>
          <div class="text-list-desc">${data?.user?.userName}</div>
        </li>
        <li class="text-right">
          <div class="text-list-title fs-5">No.:</div>
          <div class="text-list-desc bg-dark text-light p-1">${data?.billno}</div>
        </li>
      </ul>
    </main>
  `;

  const WinPrint = window.open("", "_blank", "width=800,height=700");
  if (!WinPrint) return;

  WinPrint.document.write(`
    <html>
      <head>
        <title>Print Bill</title>
        <style>${cssText}</style>
      </head>
      <body>
        ${page1.outerHTML}
        ${page2HTML}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `);

  WinPrint.document.close();
  WinPrint.focus();
};




    return (
        <Modal show={open} onHide={onClose}>
            <Modal.Body className='body section-bg-one p-0'>
                {loading ? (
                    <Placeholder.Grid rows={5} columns={4} active />
                ) : (<>
                    <main className="container receipt-wrapper" id="print-page-1">
                        <div className="receipt-top">
                            <div className="company-logo">
                                <img src="/assets/img/logo/PLC.png" className="img-fluid w-25" alt="Company Logo" />
                            </div>
                            <div className="company-name">{data?.shop?.shopName}</div>
                            {/* <div className="company-address mt-n2">{data?.shop?.village}, {data?.shop?.district?.distName},  {data?.shop?.district?.province?.provinceName}</div>
                        <div className="company-mobile">ໂທລະສັບ: {data?.shop?.phone}</div> */}
                        </div>
                        <div className="receipt-heading fs-3 mt-n2"><span>ໃບບິນຮັບເງິນ</span></div>
                        <ul className="text-list text-style1 mb-20">
                            <li>
                                <div className="text-list-title">Date:</div>
                                <div className="text-list-desc">{moment(data?.createdAt).format('DD/MM/YYYY')}</div>
                            </li>
                            <li className="text-right">
                                <div className="text-list-title">Time:</div>
                                <div className="text-list-desc">{moment(data?.createdAt).format('HH:mm:ss')}</div>
                            </li>
                            <li>
                                <div className="text-list-title">ພະນັກງານຂາຍ:</div>
                                <div className="text-list-desc">{data?.user?.userName}</div>
                            </li>
                            <li className="text-right">
                                <div className="text-list-title">No.:</div>
                                <div className="text-list-desc ">{data?.billno}</div>
                            </li>
                        </ul>
                        <table className="receipt-table mt-n1">
                            <thead>
                                <tr className='fs-6'>
                                    <th>#</th>
                                    <th>ລາຍາກນ</th>
                                    <th className='text-end'>ລາຄາ</th>
                                    <th className='text-center'>ຈຳນວນ</th>
                                    <th className='text-end'>ລວມເງິນ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.billList?.map((item: any, index: number) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item?.product?.productName}</td>
                                        <td className='text-end'>{numeral(item.price_sales).format('0,0')}</td>
                                        <td className='text-center'>{item.quantity}</td>
                                        <td className='text-end'>{numeral(item.quantity * item.price_sales).format('0,0')}</td>
                                    </tr>
                                ))}
                                {data?.countryid !== 1 &&
                                    <tr className='fs-4'>
                                        <td colSpan={4} className='text-end'>ລວມຍອດ:</td>
                                        <td className='text-end '>{numeral(data?.balanceSale).format('0,0')} ₭</td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                        <div className="text-bill-list mb-15">
                            <div className="text-bill-list-in fs-5">
                                <div className="text-bill-title">ລວມຍອດ: </div>
                                <div className="text-bill-value">{numeral(data?.balance_payable).format('0,0.00')} {data?.country?.genus}</div>
                            </div>
                            <div className="text-bill-list-in fs-5">
                                <div className="text-bill-title">ສ່ວນຫຼຸດ: </div>
                                <div className="text-bill-value">- {numeral(data?.discount).format('0,0.00')} {data?.country?.genus}</div>
                            </div>
                            {/* <div className="text-receipt-seperator"></div> */}
                            <div className="text-bill-list-in fs-5">
                                <div className="text-bill-title">ລວມຍອດທັງໝົດ: </div>
                                <div className="text-bill-value">{numeral(data?.balanceTotal).format('0,0.00')} {data?.country?.genus}</div>
                            </div>
                            <div className="text-receipt-seperator"></div>
                        </div>
                        <div className="mb-0  text-center">
                            <span className="text-uppercase text-14 bg-title text-dark pa-10 d-block">ຂໍຂອບໃຈທີມາອຸດໜູນຮ້ານຂອງພວກເຮົາ</span>
                        </div>
                    </main>
                    

                </>)}
                <Grid fluid className='p-2'>
                    <Row>
                        <Col span={{ xs: 12, md: 12, lg: 12 }} className='text-center'>
                            <Button size='lg' onClick={onClose} appearance="primary" color='red'>ຍົກເລີກ</Button>
                        </Col>
                        <Col span={{ xs: 12, md: 12, lg: 12 }} className='text-center'>
                            <Button size='lg' onClick={handlePrint} appearance="primary" color='green'><i className="fa-solid fa-print me-2" /> ພີມບິນ</Button>
                        </Col>
                    </Row>
                </Grid>
            </Modal.Body>
        </Modal>
    )
}

export default BillSales;
