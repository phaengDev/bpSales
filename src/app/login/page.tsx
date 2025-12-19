'use client'
import React, { useState } from 'react'
import { Loader } from 'rsuite';
import axios from 'axios';
import { CONFIG } from '../../utils/Config';
import { Notific } from '../../utils/Notification';
const Login: React.FC = () => {
    const api = CONFIG.URLAPI;
    const [inputs, setInputs] = useState<any>({
        phones: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const handleInvalid =
        (msg: string) => (e: React.InvalidEvent<HTMLInputElement>) => {
            e.currentTarget.setCustomValidity(msg);
        };
    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
        e.currentTarget.setCustomValidity("");
    };

    const [isLoading, setIsLoading] = useState(false);
    const handleSumint = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const resp = await axios.post(api + '/auth/login', inputs);
            if (resp.status === 200) {
                const {  user_uuid,shopid,shopName, userName, phones, created, updated, deleted} = resp.data.user;
                localStorage.setItem('token', resp.data.token);
                localStorage.setItem('user_uuid', user_uuid);
                localStorage.setItem('userName', userName);
                localStorage.setItem('phones', phones);
                localStorage.setItem('shopid', shopid);
                localStorage.setItem('shopName', shopName);
                localStorage.setItem('created', created); 
                localStorage.setItem('updated', updated);
                localStorage.setItem('deleted', deleted);
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Page Error:', error);
            Notific.error('ການເຂົ້າລະບົບບໍສຳເລັດ ກະລຸນາລອງໃໝ່');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div id="app" className="app">
                <div className="login login-v2 fw-bold">
                    <div className="login-cover">
                        {/* <div className="login-cover-img"
                        style={{
                            backgroundImage: "url(/assets/img/login-bg/login-bg-17.jpg)",
                        }} data-id="login-cover-image" ></div> */}
                        <div className="login-cover-bg"></div>
                    </div>
                    <div className={`login-container ${isLoading ? 'conic' : ''} bg-white text-dark rounded-3 py-3 pb-4`}>
                        <div className="text-center">
                            <img src="./assets/img/logo/PLC.png" className="navbar-logo bg-white rounded-3 w-40" />
                        </div>
                        <div className="login-header">
                            <div className="brand">
                                <div className="d-flex align-items-center text-dark">
                                    <img src="./assets/img/logo/login.webp" className='w-15' /> <b className="me-3 ">PLC</b> ຍິນດີຕ້ອນຮັບ
                                </div>
                                <small>ນຳໃຊ້ລະບົບ ສາງສິນຄ້າ</small>
                            </div>
                            <div className="icon">
                                <i className="fa-solid fa-arrow-right-to-bracket text-red" />
                            </div>
                        </div>
                        <div className="login-content">
                            <form onSubmit={handleSumint}>
                                  <div className="form-floating mb-20px">
                                <input
                                    type="text"
                                    className="form-control fs-4 h-45px rounded-3"
                                    placeholder="ເບີໂທລະສັບ"
                                    value={inputs.phones}
                                    onChange={(e) => {
                                        const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                                        setInputs({ ...inputs, phones: onlyNums });
                                    }}
                                    onInvalid={handleInvalid("ເບີໂທລະສັບຕ້ອງມີ 8 ຕົວເລກ")}
                                    onInput={handleInput}
                                    pattern="[0-9]{8}"
                                    maxLength={8} 
                                    required
                                />

                                <label className="d-flex align-items-center text-gray-600 fs-15px">ເບີໂທລະສັບ</label>
                            </div>
                            <div className="form-floating mb-20px position-relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control fs-4 h-45px pe-5 rounded-3"
                                    placeholder="ລະຫັດຜ່ານ"
                                    value={inputs.password}
                                    onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                                    onInvalid={handleInvalid("ກະລຸນາປ້ອນລະຫັດຜ່ານ")}
                                    onInput={handleInput}
                                    required
                                />
                                <label className="d-flex align-items-center text-gray-600 fs-15px">
                                    ລະຫັດຜ່ານ
                                </label>
                                {/* ปุ่ม toggle icon */}
                                <button
                                    type="button"
                                    className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent px-2 fs-4"
                                    onClick={() => setShowPassword(!showPassword)} >
                                    {showPassword ? <i className="fa-solid fa-eye" /> : <i className="fa-solid fa-eye-slash" />}
                                </button>
                            </div>
                               
                                <div className="mb-20px">
                                    <button type="submit" disabled={isLoading} className="btn btn-theme d-block w-100 h-45px btn-lg" >
                                        {isLoading ? (<Loader content="ກຳລັງກວດສອບ...." />) : <span>ເຂົ້າສູ່ລະບົບ</span>}
                                    </button>
                                </div>
                                <div className="text-gray-500">
                                    ລະບົບ ຂາຍສິນຄ້າ
                                    <span className='ms-5'>V 1.0</span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login