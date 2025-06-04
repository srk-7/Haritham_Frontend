import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UpdateProduct = ({ productId }) => {
    const [product, setProduct] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:8081/api/products/${productId}`)
            .then(response => {
                setProduct(response.data);
            })
            .catch(error => {
                alert('Error fetching product');
            });
    }, [productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`http://localhost:8081/api/products/${productId}`, product)
            .then(response => {
                alert('Product updated successfully');
            })
            .catch(error => {
                alert('Error updating product');
            });
    };

    if (!product) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" required />
            <input type="number" name="pricePerUnit" value={product.pricePerUnit} onChange={handleChange} placeholder="Price per Unit" required />
            <input type="number" name="quantityAvailable" value={product.quantityAvailable} onChange={handleChange} placeholder="Quantity Available" required />
            <input type="text" name="imageUrl" value={product.imageUrl} onChange={handleChange} placeholder="Image URL" />
            <button type="submit">Update Product</button>
        </form>
    );
};

export default UpdateProduct;
