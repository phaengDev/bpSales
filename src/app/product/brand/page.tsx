'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { Grid, Row, Col, Input, InputGroup,HStack, InputPicker,Placeholder, Loader } from 'rsuite';
import FormBrand from './FormBrand';
import axios from 'axios';
import { CONFIG } from  '../../../utils/Config';
import { usePage } from '../../../utils/selectOption';
import NextPages from '../../../utils/NextPages';
import { Notific } from '../../../utils/Notification';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage';
const BrandPage: React.FC = () =>{
  const api = CONFIG.URLAPI;
  const shopid = getLocalStorageItem('shopid');
  const token = useToken();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState('');
  const [response, setResponse] = useState(null);
  const handleNewForm = () => {
    setOpen(true);
    setData('');
  }
  const handleEdit = (data: any) => {
    setOpen(true);
    setData(data);
  }
  const handleDelete = (id: string) => {
    Notific.confirm('ທ່ານຕ້ອງການລົບຂໍ້ມູນນີ້ແທ້ບໍ່?', async () => {
      try {
        const response = await axios.delete(api + '/brand/' + btoa(id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const jsonData = await response.data;
        if (response.status === 200) {
          Notific.success(jsonData.message);
          setResponse(response.data.data);
        }
      } catch (error) {
        Notific.error('ລົບຂໍ້ມູນບໍ່ສໍາເລັດ');
        console.error('Error fetching data:', error);
      }
    });
  }

const [search, setSearch] = useState({
  categorieid: '',
  shopid: shopid
});


  const [itemData, setItemData] = useState<any[]>([]);
  const [filter, setFilter] = useState<any[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const skipItem = ((currentPage - 1) * itemsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${api}/brand/fetch?skip=${skipItem}&limit=${itemsPerPage}`,search, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const jsonData = await response.data;
      setItemData(jsonData.data);
      setFilter(jsonData.data);
      setTotalItems(jsonData.total);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const pages=usePage(totalItems);
  //======================================
  const handleFilter = (event: any) => {
    const query = event.toLowerCase();
    setItemData(
      filter.filter(
        n =>
          n.brandName.toLowerCase().includes(query) ||
          n.brandCode.toLowerCase().includes(query)
      )
    );
  };
  
  useEffect(() => {
    if(token){
    fetchBrands();
    }
  }, [response,token, itemsPerPage, currentPage]);
  

    const columns = [
        { class: 'text-center w-5', col: 'ລຳດັບ' },
        { class: 'text-center w-5', col: 'ລະຫັດ' },
        { class: '', col: 'ຊື່ຍີ່ຫໍ້' },
        { class: '', col: 'ໝວດໝູ່' },
        { class: '', col: 'ລາຍລະອຽດ' },
        { class: 'text-center w-5', col: 'ຕັ້ງຄ່າ' }
    ]

  return (
    <PageContainer>
      <ol className="breadcrumb float-end fs-5">
        <li className="breadcrumb-item"><Link href={'/'}>ໜ້າຫຼັກ</Link></li>
        <li className="breadcrumb-item"><span role='button' onClick={handleNewForm} className="text-blue fs-5"><i className="fa fa-plus"></i> ເພີ່ມຍີ່ຫໍ້ </span></li>
        <li className="breadcrumb-item active">ລາຍການຍີ່ຫໍ້ສິນຄ້າ</li>
      </ol>
      <h1 className="page-header">ຂໍ້ມູນຍີ່ຫໍ້ສິນຄ້າ</h1>
      <div className="panel">
        <div className="panel-body p-0">
          <Grid fluid>
            <Row className="show-grid">
            <Col xs={6} sm={8} md={8} lg={5} xl={4}>
              <HStack>
                 <label className='d-sm-block d-none'>ສະແດງ</label>
                  <InputPicker value={itemsPerPage} onChange={(e)=>setItemsPerPage(e)}  data={pages} />
                  <label className='d-sm-block d-none'>ລາຍການ</label>
              </HStack>
              </Col>
              <Col xs={10} xsPush={8} sm={8} smPush={8} lg={6} lgPush={13} xl={6} xlPush={14}>
                <InputGroup inside>
                  <InputGroup.Addon><i className="fa fa-search" /></InputGroup.Addon>
                  <Input onChange={handleFilter} placeholder="ຄົ້ນຫາ ..." />
                </InputGroup>
              </Col>
            </Row>
          </Grid>
          <div className="table-responsive mb-2 mt-2">
            <table className="table table-striped table-bordered text-nowrap mb-0">
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th key={index} className={column.class}>{column.col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='fs-5'>
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className='text-center'>
                       <Placeholder.Grid rows={5} columns={6} active />
                      <Loader size='lg' content="ກຳລັງໂຫຼດຂໍ້ມູນ..." vertical />
                    </td>
                  </tr>
                ):
                itemData.length > 0 ? (
                  itemData.map((item, index) =>
                    <tr key={index}>
                      <td className='text-center'>{index + 1}</td>
                      <td>{item.brandCode}</td>
                      <td>{item.brandName}</td>
                      <td>{item.category.cateName}</td>
                      <td>{item.description}</td>
                      <td className='text-center'>
                        <button type='button' onClick={() => handleEdit(item)} className='btn btn-xs btn-blue me-2'><i className="fa-solid fa-pen-to-square" /></button>
                        <button type='button' onClick={() => handleDelete(item.brand_uuid)} className='btn btn-xs btn-danger'><i className="fa-solid fa-trash" /></button>
                      </td>
                    </tr>
                  )
                ) : (
                  <tr>
                    <td colSpan={columns.length} className='text-center text-red'>ບໍ່ພົບຂໍ້ມູນທີ່ມີການບັນທຶກ</td>
                  </tr>
                )
                }
              </tbody>
            </table>
          </div>
          <NextPages dataTotal={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      </div>
      {open &&
        <FormBrand open={open} handleClose={() => setOpen(false)} data={data} fetchData={setResponse} />
      }
    </PageContainer>
  )
}

export default BrandPage