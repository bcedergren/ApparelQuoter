import React from 'react'
import Card from './Card'
import { FaShippingFast, FaBoxOpen } from 'react-icons/fa'
import styles from '@/styles/OrderList.module.css'

interface Order {
  customerName: string
  product: string
  amount: string
}

interface OrderListProps {
  orders: Order[]
}

const OrderList: React.FC<OrderListProps> = ({ orders }) => (
  <Card title="Recent Orders">
    <ul className={styles.ordersList}>
      {orders && orders.length > 0 ? (
        orders.map((order, index) => (
          <li key={index}>
            <FaShippingFast /> {order.customerName} - {order.product} -{' '}
            {order.amount}
          </li>
        ))
      ) : (
        <li>No orders available</li>
      )}
    </ul>
  </Card>
)

export default OrderList
