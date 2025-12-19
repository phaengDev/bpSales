'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ ใช้ navigate จาก Next.js
import Navbar from './layout/Navbar';
import Header from './layout/Header';
// import Footer from './layout/Footer';
import { CONFIG } from '@/utils/Config';
// import { useToken } from '@/hooks/useToken';
import axios from 'axios';

interface PageContainerProps {
  children: React.ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  const router = useRouter();
  const api = CONFIG.URLAUTH;
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

useEffect(() => {
   if (!token) return;
  const checkTokenAndMakeRequest = async () => {
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const resp = await axios.get(`${api}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true, // ✅ ປ້ອງກັນ Axios ບໍ່ໃຫ້ເຂົ້າ catch
      });
      if (resp.status === 200) {
        return;
      }
    } catch (error: any) {
      console.error('🚨 Network error (CORS, server down, etc):', error);
      router.push('/login');
    }
  };
  checkTokenAndMakeRequest();
}, [token, api, router]);

  return (
    <div id="app" className="app app-header-fixed app-sidebar-fixed app-gradient-enabled app-content-full-height" >
      <Header />
      <Navbar />
      <div id="content" className="app-content bg-component px-3 h-auto min-vh-100">{children}</div>
      {/* <Footer /> */}
    </div>
  );
}
