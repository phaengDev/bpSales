'use client'

import React, { useState } from 'react'
import Link from 'next/link'

const Navbar: React.FC = () => {
  // ✅ state เก็บชื่อเมนูที่เปิดอยู่
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  // ✅ ฟังก์ชันเปิด/ปิด submenu
  const toggleMenu = (menu: string) => {
    setOpenMenu((prev) => (prev === menu ? null : menu))
  }
  return (
    <>
      <div id="sidebar" className="app-sidebar" data-bs-theme="dark">
        <div className="app-sidebar-content" data-scrollbar="true" data-height="100%">
          <div className="menu">

            {/* 🔹 Profile */}
            <div className="menu-profile">
              <div className="menu-profile-link">
                <div className="menu-profile-cover with-shadow"></div>
                <div className="menu-profile-image">
                  <img src="/assets/img/icon/user.png" alt="User" />
                </div>
                <div className="menu-profile-info">
                  <div className="flex-grow-1">ຜູ້ໃຊ້ລະບົບ</div>
                  <small>ADMIN</small>
                </div>
              </div>
            </div>

            <div className="menu-header pt-2">ລາຍການເມນູ</div>

            {/* 🔹 Menu Home */}
            <div className="menu-item fs-14px">
              <Link href="/" className="menu-link">
                <div className="menu-icon"><i className="fa-solid fa-house fs-4"></i></div>
                <div className="menu-text">ໜ້າຫຼັກ</div>
              </Link>
            </div>

            {/* 🔹 Menu Sales */}
            <div className="menu-item fs-14px">
              <Link href="/sale" className="menu-link">
                <div className="menu-icon"><i className="fa-solid fa-cart-plus fs-4"></i></div>
                <div className="menu-text">ຂາຍສິ້ນຄ້າ</div>
              </Link>
            </div>

           
             {/* 🔹 Dropdown: buysale */}
            <div className={`menu-item has-sub fs-14px ${openMenu === 'buysale' ? 'active' : ''}`}>
              <button
                type="button"
                className="menu-link border-0 bg-transparent w-100 text-start"
                onClick={() => toggleMenu('buysale')}
              >
                <div className="menu-icon"><i className="fa-brands fa-shopify fs-4"></i></div>
                <div className="menu-text">ຂໍ້ມູນການຊື້ຂາຍ</div>
                <div className="menu-caret"></div>
              </button>
              {openMenu === 'buysale' && (
                <div className="menu-submenu fs-13px show">
                  <div className="menu-item"><Link href="/cancel" className="menu-link"><div className="menu-text">ຍົກເລີກບິນຂາຍ</div></Link></div>
                  <div className="menu-item"><Link href="/offsale" className="menu-link"><div className="menu-text">ປິດຍອດການຂາຍ</div></Link></div>
                </div>
              )}
            </div>

            {/* 🔹 Dropdown: Purchase */}
            <div className={`menu-item has-sub fs-14px ${openMenu === 'purchase' ? 'active' : ''}`}>
              <button
                type="button"
                className="menu-link border-0 bg-transparent w-100 text-start"
                onClick={() => toggleMenu('purchase')}
              >
                <div className="menu-icon"><i className="fa-brands fa-product-hunt fs-4"></i></div>
                <div className="menu-text">ຂໍ້ມູນສິນຄ້ານຳເຂົ້າ</div>
                <div className="menu-caret"></div>
              </button>

              {openMenu === 'purchase' && (
                <div className="menu-submenu fs-13px show">
                  <div className="menu-item"><Link href="/purchase" className="menu-link"><div className="menu-text">ລາຍການສັ່ງຊື້</div></Link></div>
                  <div className="menu-item"><Link href="/import" className="menu-link"><div className="menu-text">ລົງສິນຄ້ານຳເຂົ້າ</div></Link></div>
                </div>
              )}
            </div>

            {/* 🔹 Dropdown: Product */}
            <div className={`menu-item has-sub fs-14px ${openMenu === 'product' ? 'active' : ''}`}>
              <button
                type="button"
                className="menu-link border-0 bg-transparent w-100 text-start"
                onClick={() => toggleMenu('product')}
              >
                <div className="menu-icon"><i className="fa-solid fa-layer-group fs-4"></i></div>
                <div className="menu-text">ຂໍ້ມູນສິນຄ້າ</div>
                <div className="menu-caret"></div>
              </button>

              {openMenu === 'product' && (
                <div className="menu-submenu fs-13px show">
                  <div className="menu-item"><Link href="/product" className="menu-link"><div className="menu-text">ລາຍການສິນຄ້າ</div></Link></div>
                  <div className="menu-item"><Link href="/product/price" className="menu-link"><div className="menu-text">ຕັ້ງລາຄາສົ່ງ</div></Link></div>
                  <div className="menu-item"><Link href="/product/promotion" className="menu-link"><div className="menu-text">ຕັ້ງໂປຣໂມຊັນ</div></Link></div>
                  <div className="menu-item"><Link href="/product/category" className="menu-link"><div className="menu-text">ໝວດໝູ່ສິນຄ້າ</div></Link></div>
                  <div className="menu-item"><Link href="/product/brand" className="menu-link"><div className="menu-text">ຍີ່ຫໍ້ສິນຄ້າ</div></Link></div>
                  <div className="menu-item"><Link href="/product/unit" className="menu-link"><div className="menu-text">ຫົວໜ່ວຍ</div></Link></div>
                  <div className="menu-item"><Link href="/product/size" className="menu-link"><div className="menu-text">ຂະໜາດ (ໄຊ)</div></Link></div>
                </div>
              )}
            </div>

            {/* 🔹 Dropdown: Report */}
            <div className={`menu-item has-sub fs-14px ${openMenu === 'report' ? 'active' : ''}`}>
              <button
                type="button"
                className="menu-link border-0 bg-transparent w-100 text-start"
                onClick={() => toggleMenu('report')}
              >
                <div className="menu-icon"><i className="fa-solid fa-chart-pie fs-4"></i></div>
                <div className="menu-text">ລາຍງານສິນຄ້າ</div>
                <div className="menu-caret"></div>
              </button>

              {openMenu === 'report' && (
                <div className="menu-submenu fs-13px show">
                  <div className="menu-item"><Link href="/report/daily" className="menu-link"><div className="menu-text">ລາຍງານການຂາຍ</div></Link></div>
                  <div className="menu-item"><Link href="/report/list" className="menu-link"><div className="menu-text">ລາຍງານຕາມສິນຄ້າ</div></Link></div>
                  <div className="menu-item"><Link href="/report/online" className="menu-link"><div className="menu-text">ລາຍງານຂາຍອອນໄລນ໌</div></Link></div>
                  <div className="menu-item"><Link href="/report/import" className="menu-link"><div className="menu-text">ລາຍງານການນຳເຂົ້າ</div></Link></div>
                </div>
              )}
            </div>

            {/* 🔹 Dropdown: Settings */}
            <div className={`menu-item has-sub fs-14px ${openMenu === 'settings' ? 'active' : ''}`}>
              <button
                type="button"
                className="menu-link border-0 bg-transparent w-100 text-start"
                onClick={() => toggleMenu('settings')}
              >
                <div className="menu-icon"><i className="fa-solid fa-screwdriver-wrench fs-4"></i></div>
                <div className="menu-text">ການຕັ້ງຄ່າ</div>
                <div className="menu-caret"></div>
              </button>

              {openMenu === 'settings' && (
                <div className="menu-submenu fs-13px show">
                  <div className="menu-item"><Link href="/supplier" className="menu-link"><div className="menu-text">ຜູ້ສະໜອງສິນຄ້າ</div></Link></div>
                  <div className="menu-item"><Link href="/customer" className="menu-link"><div className="menu-text">ຂໍ້ມູນລູກຄ້າ</div></Link></div>
                  <div className="menu-item"><Link href="/user" className="menu-link"><div className="menu-text">ຜູ້ໃຊ້ລະບົບ</div></Link></div>
                </div>
              )}
            </div>

            {/* 🔹 Collapse Button */}
            <div className="menu-item d-flex">
              <button
                type="button"
                className="app-sidebar-minify-btn ms-auto d-flex align-items-center text-decoration-none border-0 bg-transparent"
                onClick={() => document.body.classList.toggle('sidebar-minified')}
              >
                <i className="fa fa-angle-double-left"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="app-sidebar-bg" data-bs-theme="dark"></div>
      <div className="app-sidebar-mobile-backdrop">
        <button
          type="button"
          data-dismiss="app-sidebar-mobile"
          className="stretched-link border-0 bg-transparent"
        ></button>
      </div>
    </>
  )
}

export default Navbar
