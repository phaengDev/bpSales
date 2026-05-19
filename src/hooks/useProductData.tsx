'use client';

import { useEffect, useState } from 'react';
import { getApi } from '@/utils/Configs';
import { useToken } from '@/hooks/useToken';
// ==== Type Definitions ====
export interface ProductItem {
    label: string;
    value: string | number;
    codes?: string; // SKU
}

export interface CategoryTree {
    label: string;
    value: string | number;
    codes?: string; // brand code
    children: ProductItem[];
}

// ==== Hook ====
export const useProductData = (categoryId: string | number | null) => {
    const token = useToken();

    const [treeData, setTreeData] = useState<CategoryTree[]>([]);
    const [itemMain, setItemMain] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!categoryId) return;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await getApi(
                    `/product/brand/category/${categoryId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!res.data?.data) throw new Error("Invalid API response");

                const data = res.data.data;
                setItemMain(data);

                // 🔥 Transform to CheckTreePicker format
                const formattedTree: CategoryTree[] = data.map((brand: any) => ({
                    label: `${brand.brandName} (${brand.brandCode})`,
                    value: brand.brand_uuid,
                    codes: brand.brandCode,
                    children: (brand.products || []).map((p: any) => ({
                        label: `${p.productName} (${p.sku})`,
                        value: p.product_uuid,
                        codes: p.sku
                    }))
                }));

                setTreeData(formattedTree);
            } catch (error) {
                console.error("❌ Error fetching product data:", error);
                setTreeData([]);
                setItemMain([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId, token]);

    return { treeData, itemMain, loading };
};
