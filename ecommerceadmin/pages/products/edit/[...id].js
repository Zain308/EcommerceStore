import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EditProductPage() {
    const [productInfo, setProductInfo] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (!id) return;
        axios.get(`/api/products?id=${id}`).then(response => {
            setProductInfo({...response.data, _id: id});
        });
    }, [id]);

    return (
        <Layout>
            <h1 className="text-blue-900 mb-2 text-xl">Edit Product</h1>
            {productInfo && <ProductForm {...productInfo} />}
        </Layout>
    );
}