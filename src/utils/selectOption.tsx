import { useMemo } from "react";
import ArrowRightLineIcon from "@rsuite/icons/ArrowRightLine";
import { useState, useEffect } from "react";
import { getApi } from '../utils/Configs';
import { useToken } from '@/hooks/useToken';
import { getLocalStorageItem } from '@/utils/storage'
const shopid = getLocalStorageItem("shopid");

// ===== Province =====
interface Province {
  provinceName: string;
  _uuid: string | number;
}

export function useShop() {
  const [shops, setShops] = useState<Province[]>([]);
  useEffect(() => {
    const showShop = async () => {
      try {
        const response = await getApi(`/shop/${shopid}`);
        const jsonData = response.data;
        setShops(jsonData.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    showShop();
  }, []);

  return shops;
}
export function useProvince() {
  const [itemProvince, setItemProvince] = useState<Province[]>([]);
  useEffect(() => {
    const showProvince = async () => {
      try {
        const response = await getApi('/address/province');
        const jsonData = response.data;
        setItemProvince(jsonData.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    showProvince();
  }, []);

  return itemProvince.map(item => ({
    label: item.provinceName,
    value: item._uuid,
  }));
}

// ===== District =====
interface District {
  distName: string;
  _uuid: string | number;
}

export function useDistrict(id?: string | number) {
  const [itemDistrict, setItemDistrict] = useState<District[]>([]);

  useEffect(() => {
    if (!id) return;
    const showDistrict = async () => {
      try {
        const response = await getApi(`/address/district/pv/${id}`);
        const jsonData = response.data;
        setItemDistrict(jsonData.data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    showDistrict();
  }, [id]);

  return itemDistrict.map(item => ({
    label: item.distName,
    value: item._uuid,
  }));
}

// ===== Category =====
interface Users {
  userName: string;
  user_uuid: number | string;
}
export function useUser() {
  const token = useToken();
  const [itemUser, setItemUser] = useState<Users[]>([]);

  useEffect(() => {
    const showUser = async () => {
      try {
        const response = await getApi(`/user/option/${shopid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const jsonData = response.data;
        setItemUser(jsonData.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    showUser();
  }, [token, shopid]);

  return itemUser.map(item => ({
    label: item.userName,
    value: item.user_uuid,
  }));
}
// ========= useCategory =========
interface Category {
  cateName: string;
  cate_uuid: string;
}
export function useCategory() {
  const token = useToken();
  const [itemCategory, setItemCategory] = useState<Category[]>([]);

  useEffect(() => {
    const showCategory = async () => {
      try {
        const response = await getApi(`/category/option/${shopid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const jsonData = response.data;
        setItemCategory(jsonData.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    showCategory();
  }, [token, shopid]);

  return itemCategory.map(item => ({
    label: item.cateName,
    value: item.cate_uuid,
  }));
}

// ===== Brand =====
interface Brand {
  brandName: string;
  brand_uuid: string;
  brandCode: string;
}

export function useBrand(id?: string | number) {
  const token = useToken();
  const [itemBrand, setItemBrand] = useState<Brand[]>([]);

  useEffect(() => {
    if (!id && !token) return;
    const showBrands = async () => {
      try {
        const response = await getApi(`/brand/option/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const jsonData = response.data;
        setItemBrand(jsonData.data || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    showBrands();
  }, [id, token]);

  return itemBrand.map(item => ({
    label: item.brandName,
    value: item.brand_uuid,
    codes: item.brandCode
  }));
}

// ===== Unit =====
interface Unite {
  unitName: string;
  unit_uuid: string;
}

export function useUnite() {
  const token = useToken();
  const [itemUnite, setItemUnite] = useState<Unite[]>([]);
  useEffect(() => {
    const showUnite = async () => {
      try {
        const response = await getApi(`/unit/option/${shopid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const jsonData = response.data;
        setItemUnite(jsonData.data || []);
      } catch (error) {
        console.error("Error fetching units:", error);
      }
    };
    showUnite();
  }, [token, shopid]);

  return itemUnite.map(item => ({
    label: item.unitName,
    value: item.unit_uuid,
  }));
}

// ===== Size =====
interface Size {
  sizeName: string;
  size_uuid: string;
}

export function useSizes() {
  const token = useToken();
  const [itemSizes, setItemSizes] = useState<Size[]>([]);
  useEffect(() => {
    const showSizes = async () => {
      try {
        const response = await getApi(`/size/option/${shopid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const jsonData = response.data;
        setItemSizes(jsonData.data || []);
      } catch (error) {
        console.error("Error fetching sizes:", error);
      }
    };
    showSizes();
  }, [token, shopid]);

  return itemSizes.map(item => ({
    label: item.sizeName,
    value: item.size_uuid,
  }));
}

// ===== Product =====
interface Product {
  product_uuid: string | number;
  sku: string;
  productName: string;
  buyPrices: number;
  unit: {
    unitName: string;
  }
}

export function useProduct(id: string | number | null) {
  const token = useToken();
  const [itemProduct, setItemProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (!id) return;
    const showProduct = async () => {
      try {
        setLoading(true);
        const response = await getApi(`/product/option/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const jsonData = response.data;
        setItemProduct(jsonData.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    showProduct();
  }, [id, token]);

  const products = itemProduct.map(item => ({
    label: `${item.productName} (${item.sku}) `,
    value: item.product_uuid,
    buyPrices: item.buyPrices,
    unitName: item.unit.unitName
  }));
  return { products, loading };
}

// ===== Rights =====
interface Rights {
  rights_name: string;
  rights_id: string | number;
}

export function useRights() {
  const [itemRights, setItemRights] = useState<Rights[]>([]);
  useEffect(() => {
    const showRights = async () => {
      try {
        const response = await getApi('/rights');
        const jsonData: Rights[] = response.data;
        setItemRights(jsonData);
      } catch (error) {
        console.error("Error fetching rights:", error);
      }
    };
    showRights();
  }, []);

  return itemRights.map(item => ({
    label: item.rights_name,
    value: item.rights_id,
  }));
}

// ===== Supplier =====
interface Supplier {
  _uuid: number | string;
  supplierName: string;
  country: {
    icons?: string;
    abbr?: string;
  }

}

export function useSupplier() {
  const token = useToken();
  const [itemSupplier, setItemSupplier] = useState<Supplier[]>([]);

  useEffect(() => {
    const showSupplier = async () => {
      try {
        const response = await getApi(`/supplier/option/${shopid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const jsonData = response.data;
        console.log(jsonData.data);
        setItemSupplier(jsonData.data || []);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    showSupplier();
  }, [token, shopid]);

  return itemSupplier.map(item => ({
    icon: item?.country?.icons,
    abbr: item?.country?.abbr,
    name: item.supplierName,
    label: <span className='fs-5'><i className="fa-solid fa-store" /> {item.supplierName}</span>,
    value: item._uuid,
  }));
}

// ===== Country =====
interface Country {
  icons: string;
  names: string;
  _uuid: string | number;
  genus: string;
  rate: number;
  abbr: string;
}

export function useCountry() {
  const [itemCountry, setItemCountry] = useState<Country[]>([]);
  useEffect(() => {
    const showCountry = async () => {
      try {
        const response = await getApi(`/address/country/${shopid}`);
        const jsonData: Country[] = response.data;
        setItemCountry(jsonData);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    showCountry();
  }, [shopid]);

  return itemCountry.map(item => ({
    label: `${item.icons} ${item.names}`,
    value: item._uuid,
    icon: item.icons,
    abbr: item.abbr,
    genus: item.genus,
    rate: item.rate
  }));
}

export const useExpress = () => {
  const [itemExpress, setItemExpress] = useState<any[]>([]);
  useEffect(() => {
    const showExpress = async () => {
      try {
        const response = await getApi('/address/company');
        const jsonData = response.data;
        setItemExpress(jsonData || []);
      } catch (error) {
        console.error("Error fetching express:", error);
      }
    };
    showExpress();
  }, []);

  return itemExpress.map(item => ({
    value: item._uuid,
    label: item.names,
    logo: item.logos
  }));
}

export const useTypeSale = () => {
  return [
    {
        label: <span className='text-green fs-14px'><i className="fa-solid fa-store" /> ຂາຍໜ້າຮ້ານ</span>,
        value: 1
    }, {
        label: <span className='text-orange fs-14px'><i className="fa-solid fa-truck" /> ຂາຍອອນໄລນ໌</span>,
        value: 2
    },{
        label: <span className='text-red fs-14px'>All ທັງໝົດ</span>,
        value: ''
    }
  ];
}
export const useStatus = () => {
  return [
    {
        label: <span className='text-orange fs-14px'> <i className="fa-solid fa-triangle-exclamation" /> ຄ້າງປິດຍອດ</span>,
        value: 1
    }, {
        label: <span className='text-green fs-14px'> <i className="fa-solid fa-circle-check" /> ປິດຍອດແລ້ວ</span>,
        value: 2
    },{
        label: <span className='text-red fs-14px'>All ທັງໝົດ</span>,
        value: ''
    }
  ];
}

export const usePage = (total: number) => {
  const limit = useMemo(
    () => [
      {
        label: (<span className="flex items-center gap-2"> <ArrowRightLineIcon /> 25 </span>),
        value: 25,
      },
      {
        label: (<span className="flex items-center gap-2"> <ArrowRightLineIcon /> 50 </span>),
        value: 50,
      },
      {
        label: (<span className="flex items-center gap-2"> <ArrowRightLineIcon /> 100 </span>),
        value: 100,
      },
      {
        label: (<span className="flex items-center gap-2"> <ArrowRightLineIcon /> 200</span>),
        value: 200,
      },
      {
        label: (<span className="flex items-center gap-2"> <ArrowRightLineIcon /> 500 </span>),
        value: 500,
      },
      {
        label: (<span className="flex items-center gap-2">  <ArrowRightLineIcon /> 1000  </span>),
        value: 1000,
      },
      {
        label: (<span className="flex items-center gap-2 text-primary"> <ArrowRightLineIcon /> All </span>),
        value: total,
      },
    ],
    [total]
  );

  return limit;
};
