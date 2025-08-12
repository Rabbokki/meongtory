// 스토어 관련 타입들

export interface Product {
  productId: number  // id -> productId로 변경
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string  // image -> imageUrl로 변경
  category: '의류' | '장난감' | '건강관리' | '용품' | '간식' | '사료'  // string -> enum으로 변경
  targetAnimal: 'ALL' | 'DOG' | 'CAT'  // petType -> targetAnimal으로 변경
  registrationDate: string  // LocalDate를 string으로 표현
  registeredBy: string
}

export interface WishlistItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  category: string
}

export interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  category: string
  quantity: number
  order: number
  product?: {
    productId: number
    name: string
    description: string
    price: number
    stock: number
    imageUrl: string
    category: string
    targetAnimal: string
    registrationDate: string
    registeredBy: string
  }
}

export interface Order {
  id: number
  userId: number
  orderDate: string
  status: "pending" | "completed" | "cancelled"
  totalAmount: number
  items: OrderItem[]
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  orderDate: string
  status: "completed" | "pending" | "cancelled"
  ImageUrl: string
}

// 스토어 페이지 Props
export interface StorePageProps {
  onClose: () => void
  onAddToWishlist: (product: Product) => void
  isInWishlist: (productId: number) => boolean
  isAdmin?: boolean
  isLoggedIn?: boolean
  onNavigateToStoreRegistration?: () => void
  products?: Product[]
  onViewProduct?: (productId: number) => void
}

export interface StoreProductDetailPageProps {
  productId: number
  onBack: () => void
  onAddToWishlist: (product: Product) => void
  onAddToCart: (product: Product) => void
  onBuyNow: (product: Product) => void
  isInWishlist: (productId: number) => boolean
  isInCart: (productId: number) => boolean
}

export interface StoreProductRegistrationPageProps {
  isAdmin: boolean
  onAddProduct: (product: Product) => void
  onClose: () => void
}

export interface StoreProductEditPageProps {
  productId: number
  onBack: () => void
  onSave: (product: Product) => void
}

export interface CartPageProps {
  cartItems: CartItem[]
  onRemoveFromCart: (itemId: number) => void
  onUpdateQuantity: (itemId: number, quantity: number) => void
  onCheckout: () => void
  onClose: () => void
} 