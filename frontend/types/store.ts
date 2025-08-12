export interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  tags: string[]
  stock: number
  registrationDate: string
  registeredBy: string
}

export interface CartItem {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: number
  items: CartItem[]
  totalAmount: number
  orderDate: string
  status: "pending" | "completed" | "cancelled"
} 