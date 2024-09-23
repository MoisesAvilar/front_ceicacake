import React from 'react';

interface ProductProps {
  products: { value: string; label: string }[];
}

const Products: React.FC<ProductProps> = ({ products }) => {
  return (
    <>
      {products.map(product => (
        <option key={product.value} value={product.value}>
          {product.label}
        </option>
      ))}
    </>
  );
};

export default Products;
