import Layout from "@/components/Layout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function DeleteProductPage() {
    const router = useRouter();
    const {id} = router.query;
    const [productInfo, setProductInfo] = useState();
    
    function goBack() {
        router.push('/products');
    }

    async function deleteProduct() {
        await axios.delete('/api/products?id='+id);
        goBack();
    }
    
    useEffect(() => {
        if (!id) return;
        axios.get('/api/products?id='+id).then(response => {
            setProductInfo(response.data);
        });
    }, [id]);

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                    Confirm Deletion
                </h1>
                <p className="text-gray-600 mb-8 text-center">
                    Are you sure you want to delete <span className="font-medium">"{productInfo?.title}"</span>?
                </p>
                
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={deleteProduct}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    >
                        Yes, Delete
                    </button>
                    <button
                        onClick={goBack}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Layout>
    );
}