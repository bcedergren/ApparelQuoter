import React from 'react'
import Card from './Card'
import { FaHeadphones, FaShoePrints } from 'react-icons/fa'
import styles from '@/styles/ProductList.module.css'

interface Product {
  name: string
  price: string
}

interface ProductListProps {
  products: Product[]
}

const ProductList: React.FC<ProductListProps> = ({ products }) => (
  <Card title="Top Selling Product">
    <ul className={styles.productsList}>
      {products && products.length > 0 ? (
        products.map((product, index) => (
          <li key={index}>
            <FaHeadphones /> {product.name} - {product.price}
          </li>
        ))
      ) : (
        <li>No products available</li>
      )}
    </ul>
  </Card>
)

export default ProductList
