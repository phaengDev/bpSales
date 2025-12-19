// utils/formate.ts
import {
  addDays,
  // subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  // endOfMonth,
  // addMonths
} from "date-fns";
import type { DateRangePickerProps }  from 'rsuite';

// ⭐ TYPE ของ RSuite
// interface RangeItem {
//   label: string;
//   value: [Date, Date];
//   closeOverlay?: boolean;
//   placement?: 'left' | 'right';
// }

export function toThousands(value: number | string | null | undefined): string {
  if (value == null || value === '') return '0 ₭';

  // แปลงเป็น string เพื่อใช้ regex ได้ทุกกรณี
  const str = String(value);
  return str.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,') + ' ₭';
}



export const setupDate:  NonNullable<DateRangePickerProps['ranges']> = [
  {
    label: 'ມື້ນີ້',
    value: [new Date(), new Date()]
  },
  {
    label: 'ມື້ວານນີ້',
    value: [addDays(new Date(), -1), addDays(new Date(), -1)]
  },
  {
    label: 'ອາທິດນີ້',
    value: [startOfWeek(new Date()), endOfWeek(new Date())]
  },
  {
    label: 'ເດືອນນີ້',
    value: [startOfMonth(new Date()), new Date()]
  },
  {
    label: 'ປີນີ້',
    value: [new Date(new Date().getFullYear(), 0, 1), new Date()]
  },
];