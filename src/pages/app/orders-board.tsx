import { useEffect, useState, useCallback } from 'react'
import Router from 'next/router'
import { Container } from 'react-bootstrap'
import { useSession } from 'next-auth/react'
import Layout from '@/components/app/Layout'
import { initialOrders, OrdersState } from '@/utils/ordersUtils'
import styles from '@/styles/Ordersboard.module.css'
import { DropResult } from '@hello-pangea/dnd'
import dynamic from 'next/dynamic'
import { updateDatabase } from '@/utils/updateQuote'
import { Quote } from '@/types/Quote'
import { ToastContainer, toast } from 'react-toastify'

// Dynamic import of OrdersBoardComponent with SSR disabled
const OrdersBoardComponent = dynamic(
  () => import('@/components/app/OrdersBoardComponent'),
  {
    ssr: false,
  }
)

const OrdersBoardPage = () => {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<OrdersState>(initialOrders)

  useEffect(() => {
    if (status === 'unauthenticated') {
      Router.push('/login')
    }
  }, [status])

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`/api/quotes/${session?.user?.companyId}`)

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`)
      }

      const data = await response.json()

      if (!Array.isArray(data.quotes)) {
        console.error('Expected an array of quotes, received:', data)
        return initialOrders
      }

      const categorizedQuotes: OrdersState = data.quotes.reduce(
        (acc: OrdersState, quote: Quote) => {
          if (quote.quoteType === 'closedOrders') {
            return acc // Skip closed orders
          }

          let category: keyof OrdersState

          switch (quote.quoteType) {
            case 'savedQuotes':
              category = 'savedQuotes'
              break
            case 'openOrders':
              category = 'openOrders'
              break
            case 'savedOrders':
              category = 'savedOrders'
              break
            case 'completedOrders':
              category = 'completedOrders'
              break
            default:
              category = 'savedQuotes'
              break
          }

          acc[category].push(quote)
          return acc
        },
        { ...initialOrders }
      )

      setOrders(categorizedQuotes)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setOrders(initialOrders)
    }
  }, [session])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.companyId) {
      fetchOrders()
    }
  }, [session, status, fetchOrders])

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) {
      return
    }

    const startKey = source.droppableId as keyof OrdersState
    const finishKey = destination.droppableId as keyof OrdersState

    // Prevent moving items out of the completedOrders column to any column other than closedOrders
    if (startKey === 'completedOrders' && finishKey !== 'closedOrders') {
      toast.error('A completed order can no longer be reopened.')
      return
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const start = orders[startKey]
    const finish = orders[finishKey]

    let updatedOrderId = draggableId

    // Determine the new quoteType based on the finish column
    let newStatus = finishKey as string
    let newQuoteType: string

    switch (newStatus) {
      case 'savedQuotes':
        newQuoteType = 'savedQuotes'
        break
      case 'openOrders':
        newQuoteType = 'openOrders'
        break
      case 'savedOrders':
        newQuoteType = 'savedOrders'
        break
      case 'completedOrders':
        newQuoteType = 'completedOrders'
        break
      case 'closedOrders':
        newQuoteType = 'closedOrders'
        break
      default:
        newQuoteType = 'savedQuotes'
        break
    }

    if (start === finish) {
      const newOrderItems = Array.from(start)
      const [removed] = newOrderItems.splice(source.index, 1)
      newOrderItems.splice(destination.index, 0, removed)

      const newOrders = {
        ...orders,
        [startKey]: newOrderItems,
      }

      setOrders(newOrders)
    } else {
      const startOrderItems = Array.from(start)
      const [removed] = startOrderItems.splice(source.index, 1)
      const finishOrderItems = Array.from(finish)
      finishOrderItems.splice(destination.index, 0, removed)

      const newOrders = {
        ...orders,
        [startKey]: startOrderItems,
        [finishKey]: finishOrderItems,
      }

      setOrders(newOrders)
    }

    if (session?.user) {
      updateDatabase(updatedOrderId, newQuoteType, session).catch((error) =>
        console.error('Error updating order:', error)
      )
    }
  }

  const onCloseOrder = async (orderId: string) => {
    try {
      const result = await updateDatabase(orderId, 'closedOrders', session)

      if (!result) {
        toast.error('An error occurred while closing the order.')
      } else {
        toast.success('Order closed successfully.')

        // Directly remove the closed order from the orders state
        const updatedOrders = Object.keys(orders).reduce((acc, key) => {
          acc[key as keyof OrdersState] = orders[
            key as keyof OrdersState
          ].filter((order) => order._id !== orderId)
          return acc
        }, {} as OrdersState)

        setOrders(updatedOrders)
      }
    } catch (error) {
      console.error('Error closing order:', error)
      toast.error('An error occurred while closing the order.')
    }
  }

  return (
    <Layout>
      <Container fluid className={styles.dashboardContainer}>
        <h1>Orders Board</h1>
        <OrdersBoardComponent
          orders={orders}
          onDragEnd={onDragEnd}
          onCloseOrder={onCloseOrder}
        />
        <ToastContainer />
      </Container>
    </Layout>
  )
}

export default OrdersBoardPage
