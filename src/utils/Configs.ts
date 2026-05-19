import axios, { type AxiosRequestConfig } from "axios";
import moment from 'moment';
import numeral from 'numeral';
import { Notific } from "./Notification";
 const image = 'http://localhost:3707/image';
 const auth  = 'http://localhost:3707/auth';
const api   = 'http://localhost:3707/api';
const getCurrentToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem("token") : null;

// ── Axios ─────────────────────────────────────────────────
export const tokenHeader = {
    headers: { Authorization: `Bearer ${getCurrentToken()}` },
};

export const axiosInstance = axios.create({
    baseURL: api,
});

export const axiosInstanceFile = axios.create({
    baseURL: api,
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

export const axiosAuthInstance = axios.create({
    baseURL: auth,
});

const withAuth = (config?: AxiosRequestConfig): AxiosRequestConfig => {
    const token = getCurrentToken();
    return {
        ...config,
        headers: {
            ...(config?.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };
};

// ── Helpers ───────────────────────────────────────────────
export const Notification = Notific;
export const date         = moment;
export const number       = numeral;

// ── ✅ Format functions ───────────────────────────────────
export const showImage = (url: string): string => {
   return `${image}/${url}`;
}
/** ຟໍແມັດຕົວເລກ:  1,000,000 */
export const formatNumber = (val: number | string | null | undefined): string => {
    return numeral(val ?? 0).format('0,0');
};

/** ຟໍແມັດທົດສະນິຍົມ:  1,000,000.00 */
export const formatDecimal = (val: number | string | null | undefined): string => {
    return numeral(val ?? 0).format('0,0.00');
};

/** ຟໍແມັດວັນທີ:  01/01/2026 */
export const formatDate = (val: string | Date | null | undefined): string => {
    if (!val) return '-';
    return moment(val).format('DD/MM/YYYY');
};

/** ຟໍແມັດວັນທີ + ເວລາ:  01/01/2026 10:30 */
export const formatDateTime = (val: string | Date | null | undefined): string => {
    if (!val) return '-';
    return moment(val).format('DD/MM/YYYY HH:mm');
};

// ── ✅ Axios helper functions ─────────────────────────────
/** POST request */
export const postApi = async <T = any>(url: string, payload?: any, config?: AxiosRequestConfig) => {
    const res = await axiosInstance.post<T>(url, payload, withAuth(config));
    return res; // ✅ return ທັງໝົດ — ມີ .status, .data, .headers
};

/** PUT request */
export const putApi = async <T = any>(url: string, payload?: any, config?: AxiosRequestConfig) => {
    const res = await axiosInstance.put<T>(url, payload, withAuth(config));
    return res; // ✅
};

/** GET request */
export const getApi = async <T = any>(url: string, config?: AxiosRequestConfig) => {
    const res = await axiosInstance.get<T>(url, withAuth(config));
    return res; // ✅
};

/** DELETE request */
export const deleteApi = async <T = any>(url: string, config?: AxiosRequestConfig) => {
    const res = await axiosInstance.delete<T>(url, withAuth(config));
    return res; // ✅
};

/** AUTH GET request */
export const getAuthApi = async <T = any>(url: string, config?: AxiosRequestConfig) => {
    const res = await axiosAuthInstance.get<T>(url, withAuth(config));
    return res;
};

/** Upload file */
export const uploadApi = async <T = any>(url: string, formData: FormData) => {
    const res = await axiosInstanceFile.post<T>(url, formData, withAuth());
    return res; // ✅
};
// ── ✅ Token helper ───────────────────────────────────────

/** ດຶງ token ໃໝ່ທຸກຄັ້ງ (ຫຼີກເວັ້ນ stale token) */
export const getToken = (): string | null => {
    return getCurrentToken();
};

/** ກວດສອບ token ໝົດອາຍຸ */
export const isTokenExpired = (): boolean => {
    const t = getToken();
    if (!t) return true;
    try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};
// utils/parseAmount.ts

/**
 * parse ຕົວເລກຈຳນວນເງິນຈາກຂໍ້ຄວາມ
 * "ອະນຸມັດ 500,000 ກີບ"  → 500000
 * "1ລ້ານ"                → 1000000
 * "500k"                  → 500000
 */
export function parseAmountFromText(text: string): number {
    if (!text) return 0;

    const norm = text
        .replace(/[໐-໙]/g, c => String('໐໑໒໓໔໕໖໗໘໙'.indexOf(c)))
        .toLowerCase();

    // ລ້ານ / million
    const laanMatch = norm.match(/(\d+(?:\.\d+)?)\s*(?:ລ້ານ|ลาน|million|m\b)/);
    if (laanMatch) return Math.round(parseFloat(laanMatch[1]) * 1_000_000);

    // k (ພັນ)
    const kMatch = norm.match(/(\d+(?:\.\d+)?)\s*k\b/);
    if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1_000);

    // ຕົວເລກທົ່ວໄປ — ເອົາຄ່າທີ່ໃຫຍ່ສຸດ
    const allNums = norm.match(/\d[\d,.]*/g);
    if (!allNums) return 0;

    const parsed = allNums
        .map(n => parseFloat(n.replace(/,/g, '')))
        .filter(n => !isNaN(n) && n > 0);

    return parsed.length ? Math.round(Math.max(...parsed)) : 0;
}
