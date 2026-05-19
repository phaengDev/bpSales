'use client'
// import AWN from "awesome-notifications";
import Swal from 'sweetalert2';

let AWN: any
if (typeof window !== 'undefined') {
  // ✅ โหลดเฉพาะตอนรันบน browser
  AWN = require('awesome-notifications').default
}

const notifier = AWN
  ? new AWN({
      position: 'top-right',
      maxNotifications: 3,
      durations: { success: 3000 },
      labels: {
        success: '🎉 ຢືນຢັນ!',
        warning: '⚠️ ແຈ້ງເຕື່ອນ',
        alert: '❌ ຂໍອະໄພ',
        confirm: 'ຕ້ອງການຢືນຢັນ',
      },
      icons: { enabled: true },
    })
  : null

// const notifier = new AWN({
//     position: "top-right", 
//     maxNotifications: 3,
//     durations: { success: 3000 }, // 3 seconds
//     labels: { success: "🎉 ຢືນຢັນ!",warning:'⚠️ ແຈ້ງເຕື່ອນ',alert:'❌ ຂໍອະໄພ',confirm:'ຕ້ອງການຢືນຢັນ' },
//     icons: { enabled: true },
//   });

interface Notification {
    success: (message: string) => void;
    warning: (message: string) => void;
    error: (message: string) => void;
    confirm: (message: string, onConfirm?: () => void, onCancel?: () => void) => void;
    loading: (promise: Promise<any>) => void;
  }
  export const Notific: Notification = {
    success: (message) => {
        notifier.success(message);
      },
      warning: (message) => {
        notifier.warning(message);
      },
      error: (message) => {
        notifier.alert(message);
      },
      confirm: (message,  onConfirm, onCancel) => {
          notifier.confirm(message, () => {
            if (onConfirm) {
              onConfirm();
            }
          }, () => {
            if (onCancel) {
              onCancel();
            }
          });
      },
      loading: (promise) => {
        notifier.asyncBlock(promise);
      }
    };

    export const Alert = {
      errorLogin: (message: string) => { 
        Swal.fire({
          title: 'ຂໍອະໄພ!',
          text: message,
          icon: 'error',
          width: 400,
          confirmButtonText: 'ຕົກລົງ',
          confirmButtonColor: '#3085d6',
        });
      },
      errorData: (message: string) => { 
        Swal.fire({
          title: 'ຂໍອະໄພ!',
          text: message,
          icon: 'error',
          width: 400,
          confirmButtonText: 'ຕົກລົງ',
          confirmButtonColor: '#3085d6',
        });
      },
      successData: (message: string) => { 
        Swal.fire({
          title: 'ຢືນຢັນ!',
          text: message,
          icon: 'success',
          width: 350,
          confirmButtonText: 'ຕົກລົງ',
          confirmButtonColor: '#0fac29',
        });
      },
      warningData: (message: string) => { 
        Swal.fire({
          title: 'ຂໍອະໄພ',
          text: message,
          icon: 'info',
          width: 400,
          confirmButtonColor: '#0fac29',
        });
      },
    };
