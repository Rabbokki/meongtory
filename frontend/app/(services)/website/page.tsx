"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Heart, Search, Store, ShoppingCart, MessageSquare } from "lucide-react";
import AdoptionPage from "../../(pets)/adoption/page";
import AdoptionDetailPage from "../../(pets)/adoption/[id]/page";
import AnimalRegistrationPage from "../../(pets)/adoption/register/page";

import GrowthDiaryPage from "../../(pets)/diary/page";
import GrowthDiaryWritePage from "../../(pets)/diary/write/page";
import DiaryEntryDetail from "../../(pets)/diary/[id]/page";

import StorePage from "../../(store)/store/page";
import StoreProductDetailPage from "../../(store)/store/[id]/page";
import StoreProductRegistrationPage from "../../(store)/store/register/page";
import StoreProductEditPage from "../../(store)/store/edit/page";
import CartPage from "../../(store)/store/cart/page";

import PetInsurancePage from "../insurance/page";
import InsuranceDetailPage from "../insurance/[id]/page";

import CommunityPage from "../../(community)/community/page";
import CommunityDetailPage from "../../(community)/community/[id]/page";
import CommunityWritePage from "../../(community)/community/write/page";

import DogResearchLabPage from "../research/page";
import PetNamingService from "../agent/page";

import AdminPage from "../../(dashboard)/admin/page";
import MyPage from "../../(dashboard)/my/page";

import axios from "axios"
import { Toaster, toast } from "react-hot-toast"
import { getCurrentKSTDate } from "@/lib/utils"
import { getBackendUrl } from "@/lib/api";
import { useAuth } from "@/components/navigation";

// Types
import type { Pet } from "@/types/pets"
import type { Product, WishlistItem, CartItem, NaverProduct } from "@/types/store"
import type { Insurance } from "@/types/insurance"

// Product 타입 확장 (brand, image 속성 추가)
interface ExtendedProduct extends Product {
  brand?: string
  image?: string
}

interface DiaryEntry {
  id: number
  petName: string
  date: string
  title: string
  content: string
  images: string[]
  milestones: string[]
  tags?: string[]
  weight?: number
  height?: number
  mood: string
  activities: string[]
  ownerEmail?: string
  audioUrl?: string
}

interface CommunityPost {
  id: number
  title: string
  content: string
  author: string
  date: string
  category: string
  boardType: "Q&A" | "자유게시판"
  views: number
  likes: number
  comments: number
  tags: string[]
  ownerEmail?: string
}

interface AdoptionInquiry {
  id: number
  petId: number
  petName: string
  inquirerName: string
  phone: string
  email: string
  message: string
  status: "대기중" | "연락완료" | "승인" | "거절"
  date: string
}

interface Comment {
  id: number;
  postId: number;
  postTitle: string;
  author: string;
  content: string;
  date: string;
  isReported: boolean;
}

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  orderDate: string;
  status: "completed" | "pending" | "cancelled";
  ImageUrl: string;
}

export default function PetServiceWebsite() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState("home");
  const { isLoggedIn, isAdmin, currentUser, setIsLoggedIn, setIsAdmin, setCurrentUser } = useAuth();
  // 로컬 상태 제거, AuthContext 사용
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);
  const [selectedDiaryEntry, setSelectedDiaryEntry] = useState<DiaryEntry | null>(null);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [favoriteInsurance, setFavoriteInsurance] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [adoptionInquiries, setAdoptionInquiries] = useState<AdoptionInquiry[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [showContractTemplatePage, setShowContractTemplatePage] = useState(false);
  const [showContractGenerationPage, setShowContractGenerationPage] = useState(false);

  // 현재 페이지 결정
  useEffect(() => {
    const getCurrentPage = () => {
      if (pathname === "/") {
        // URL 파라미터 확인 (예: /?page=cart)
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        if (pageParam) {
          return pageParam;
        }
        return "home";
      }
      
      // /store/cart 경로 특별 처리
      if (pathname === "/store/cart") return "cart";
      
      const path = pathname.split("/")[2] || pathname.split("/")[1];
      return path || "home";
    };
    setCurrentPage(getCurrentPage());
  }, [pathname]);

  // 로딩 타임아웃
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // 로그인 상태 확인 (layout.tsx로 이동했으므로 주석 처리)
  /*
  useEffect(() => {
    let isRefreshing = false;
    const checkLoginStatus = async () => {
      if (typeof window === "undefined" || isRefreshing) return;
      setIsLoading(true);
      let accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${getBackendUrl()}/api/accounts/me`, {
          headers: { "Access_Token": accessToken },
          timeout: 5000,
        });
        const { id, email, name, role } = response.data.data;
        setCurrentUser({ id, email, name });
        setIsAdmin(role === "ADMIN");
        setIsLoggedIn(true);
        console.log("Initial login check successful:", { id, email, name, role });
      } catch (err: any) {
        console.error("사용자 정보 조회 실패:", err);
        if (err.code === "ECONNABORTED" || err.code === "ERR_NETWORK" || !err.response) {
          console.log("백엔드 서버 연결 실패, 로그아웃 처리");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setIsLoggedIn(false);
          setCurrentUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        if (err.response?.status === 401) {
          isRefreshing = true;
          accessToken = await refreshAccessToken();
          if (accessToken) {
            try {
              const response = await axios.get(`${getBackendUrl()}/api/accounts/me`, {
                headers: { "Access_Token": accessToken },
                timeout: 5000,
              });
              const { id, email, name, role } = response.data.data;
              setCurrentUser({ id, email, name });
              setIsLoggedIn(true);
              setIsAdmin(role === "ADMIN");
              console.log("Retry login check successful:", { id, email, name, role });
            } catch (retryErr) {
              console.error("재시도 실패:", retryErr);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              setIsLoggedIn(false);
              setCurrentUser(null);
              setIsAdmin(false);
            }
          } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setIsLoggedIn(false);
            setCurrentUser(null);
            setIsAdmin(false);
          }
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setIsLoggedIn(false);
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } finally {
        isRefreshing = false;
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);
  */

  // OAuth 콜백 처리는 Navigation 컴포넌트의 AuthContext에서 처리됨

  // 이벤트 핸들러 (기존과 동일)
  const handleAddToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.find((w) => w.id === item.id);
      if (exists) {
        toast.success("위시리스트에서 제거되었습니다", { duration: 5000 });
        return prev.filter((w) => w.id !== item.id);
      } else {
        toast.success("위시리스트에 추가되었습니다", { duration: 5000 });
        return [...prev, item];
      }
    });
  };

  const isInWishlist = (id: number) => {
    return wishlist.some((item) => item.id === id)
  }


  const handleAddToCart = async (product: Product) => {
    if (!isLoggedIn) {
      toast.error("로그인이 필요합니다", { duration: 5000 })
      return
    }

    // 일반 상품 처리
    try {
      const accessToken = localStorage.getItem("accessToken")
      const refreshToken = localStorage.getItem("refreshToken")
      
      if (!accessToken || accessToken.trim() === '') {
        console.error("Access Token이 없거나 비어있습니다!")
        toast.error("인증 토큰이 없습니다. 다시 로그인해주세요.", { duration: 5000 })
        return
      }

      // 수량 추출 (상품 상세페이지에서 전달받은 수량 또는 기본값 1)
      const quantity = (product as any).selectedQuantity || 1
      console.log("추가할 수량:", quantity)

      // 재고 확인
      const stock = typeof product.stock === 'number' ? product.stock : 0
      if (quantity > stock) {
        toast.error(`재고가 부족합니다. (재고: ${stock}개, 요청: ${quantity}개)`, { duration: 5000 })
        return
      }

      // 장바구니 추가 API (수량 포함)
      const response = await axios.post(`${getBackendUrl()}/api/carts?productId=${product.productId}&quantity=${quantity}`, null, {
        headers: { 
          "Access_Token": accessToken,
          "Content-Type": "application/x-www-form-urlencoded" 
        },
        timeout: 5000,
      })
      if (response.status !== 200 || !response.data.success) {
        throw new Error(response.data?.error?.message || `장바구니 추가에 실패했습니다. (${response.status})`)
      }
      await fetchCartItems()
      toast.success(`${product.name}을(를) 장바구니에 추가했습니다`, { duration: 5000 })
      // 전체 새로고침으로 장바구니 데이터 확실하게 로드
      window.location.href = "/store/cart"
    } catch (error: any) {
      console.error("장바구니 추가 오류:", error)
      toast.error("백엔드 서버 연결에 실패했습니다. 장바구니 추가가 불가능합니다.", { duration: 5000 })
    }
  }

  const isInCart = (id: number) => {
    return cart.some((item) => item.id === id)
  }

  const fetchCartItems = async () => {
    if (!isLoggedIn) return;
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.log("Access token이 없습니다.");
        return;
      }
      const response = await axios.get(`${getBackendUrl()}/api/carts`, {
        headers: { "Access_Token": accessToken },
        timeout: 5000,
      });
      if (response.status !== 200) {
        throw new Error("장바구니 조회에 실패했습니다.");
      }
      // ResponseDto 형태로 응답이 오므로 response.data.data를 사용
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error?.message || "API 응답이 올바르지 않습니다.");
      }
      
      const cartData = response.data.data || [];
      const cartItems: CartItem[] = cartData
        .sort((a: any, b: any) => a.id - b.id)
        .map((item: any, index: number) => {
          // 네이버 상품인지 일반 상품인지 확인
          if (item.naverProduct) {
            // 네이버 상품
            return {
              id: item.id,
              name: item.naverProduct.title,
              brand: item.naverProduct.brand || "네이버 쇼핑",
              price: item.naverProduct.price,
              image: item.naverProduct.imageUrl || "/placeholder.svg",
              category: item.naverProduct.category1 || "기타",
              quantity: item.quantity,
              order: index,
              isNaverProduct: true,
              product: {
                id: item.naverProduct.id,
                name: item.naverProduct.title,
                description: item.naverProduct.description,
                price: item.naverProduct.price,
                stock: 999,
                imageUrl: item.naverProduct.imageUrl,
                category: item.naverProduct.category1 || "기타",

                registrationDate: new Date().toISOString(),
                registeredBy: "네이버 쇼핑"
              }
            }
          } else {
            // 일반 상품
            return {
              id: item.id,
              name: item.product.name,
              brand: "브랜드 없음",
              price: item.product.price,
              image: item.product.imageUrl || "/placeholder.svg",
              category: item.product.category,
              quantity: item.quantity,
              order: index,
              isNaverProduct: false,
              product: {
                id: item.product.id,
                name: item.product.name,
                description: item.product.description,
                price: item.product.price,
                stock: item.product.stock,
                imageUrl: item.product.imageUrl,
                category: item.product.category,

                registrationDate: item.product.registrationDate,
                registeredBy: item.product.registeredBy,
              }
            }
          }
        })
      setCart(cartItems)
      console.log('장바구니 설정 완료:', cartItems.length, '개')
    } catch (error: any) {
      console.error("장바구니 조회 오류:", error);
      setCart([]);
      toast.error("백엔드 서버 연결에 실패했습니다. 장바구니를 불러올 수 없습니다.", { duration: 5000 });
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchCartItems();
  }, [isLoggedIn]);


  // 장바구니에서 상품 제거
  const onRemoveFromCart = async (cartId: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        toast.error("로그인이 필요합니다")
        return
      }

      const response = await axios.delete(`${getBackendUrl()}/api/carts/${cartId}`, 
      {
        headers: { "Access_Token": accessToken }
      })
      
      if (response.status === 200 && response.data.success) {
        await fetchCartItems()
        toast.success("장바구니에서 상품을 삭제했습니다")
      } else {
        throw new Error(response.data?.error?.message || "장바구니에서 삭제에 실패했습니다.")
      }
    } catch (error: any) {
      console.error("장바구니 삭제 오류:", error)
      toast.error("장바구니에서 삭제에 실패했습니다")
    }
  }

  // 수량 업데이트
  const onUpdateQuantity = async (cartId: number, quantity: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        toast.error("로그인이 필요합니다")
        return
      }

      const response = await axios.put(`${getBackendUrl()}/api/carts/${cartId}?quantity=${quantity}`, null, {
        headers: { "Access_Token": accessToken }
      })
      
      if (response.status === 200 && response.data.success) {
        await fetchCartItems()
        toast.success("장바구니 수량을 업데이트했습니다")
      } else {
        throw new Error(response.data?.error?.message || "수량 업데이트에 실패했습니다.")
      }
    } catch (error: any) {
      console.error("수량 업데이트 오류:", error)
      toast.error("수량 업데이트에 실패했습니다")
    }
  }

  // handleUpdateCartQuantity 함수 추가 (CartPage에서 사용)
  const handleUpdateCartQuantity = async (cartId: number, quantity: number) => {
    return onUpdateQuantity(cartId, quantity)
  }

  // 전체 구매
  const onPurchaseAll = async (items: CartItem[]) => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        toast.error("로그인이 필요합니다")
        return
      }

      // 현재 사용자 정보 확인
      if (!currentUser?.id) {
        toast.error("사용자 정보를 가져올 수 없습니다")
        return
      }

      // 모든 상품을 배열로 준비
      const orderItems = items.map(item => {
        if (item.isNaverProduct || 
            item.id.toString().startsWith('naver-') || 
            item.id.toString().startsWith('backend-naver-')) {
          // 네이버 상품
          let naverProductId: number;
          if (item.naverProduct && item.naverProduct.id) {
            naverProductId = item.naverProduct.id;
          } else if (item.product && item.product.id) {
            naverProductId = item.product.id;
          } else {
            naverProductId = item.id;
          }
          
          return {
            type: 'naver',
            naverProductId: naverProductId,
            quantity: item.quantity,
            name: item.name
          };
        } else {
          // 일반 상품
          return {
            type: 'regular',
            productId: item.product?.id || item.id,
            quantity: item.quantity,
            name: item.name
          };
        }
      });

      console.log("주문할 상품들:", orderItems);

      // 모든 상품을 한 번에 전송
      const orderData = {
        accountId: currentUser.id,
        items: orderItems
      };

      console.log("전체 주문 데이터:", orderData);

      const response = await axios.post(`${getBackendUrl()}/api/orders/bulk-all`, orderData, {
        headers: { "Access_Token": accessToken }
      });

      console.log("전체 주문 응답:", response.data);

      if (response.data && response.data.success) {
        // 장바구니 비우기
        for (const item of items) {
          await onRemoveFromCart(item.id)
        }

        toast.success(`전체 구매가 완료되었습니다. (${orderItems.length}개 상품)`)
        router.push("/my")
      } else {
        throw new Error("주문 처리에 실패했습니다")
      }
    } catch (error: any) {
      console.error("전체 구매 오류:", error)
      toast.error("전체 구매에 실패했습니다")
    }
  }

  // 개별 구매
  const onPurchaseSingle = async (item: CartItem) => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        toast.error("로그인이 필요합니다")
        return
      }

      const orderData = {
        accountId: currentUser?.id || 1,
        productId: item.product?.id || item.id,
        quantity: item.quantity,
      }

      const response = await axios.post(`${getBackendUrl()}/api/orders`, orderData, {
        headers: { "Access_Token": accessToken }
      })

      if (response.status === 200) {
        await onRemoveFromCart(item.id)
        toast.success("개별 구매가 완료되었습니다")
        router.push("/my")
      } else {
        throw new Error("개별 구매에 실패했습니다.")
      }
    } catch (error: any) {
      console.error("개별 구매 오류:", error)
      toast.error("개별 구매에 실패했습니다")
    }
  }

  const createOrder = async (orderData: { userId: number; amount: number }) => {
    try {
      const response = await axios.post(`${getBackendUrl()}/api/orders`, orderData, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status !== 200) {
        throw new Error("주문 생성에 실패했습니다.");
      }
      // ResponseDto 형태로 응답이 오므로 response.data.data를 사용
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error?.message || "API 응답이 올바르지 않습니다.");
      }
      
      const newOrder = response.data.data;
      setOrders((prev) => [...prev, newOrder]);
      toast.success("주문이 생성되었습니다", { duration: 5000 });
      return newOrder;
    } catch (error) {
      console.error("주문 생성 오류:", error);
      toast.error("주문 생성에 실패했습니다", { duration: 5000 });
      throw error;
    }
  };


  const purchaseAllFromCart = async () => {
    if (!isLoggedIn || !currentUser) {
      toast.error("로그인이 필요합니다", { duration: 5000 })
      return
    }
    try {
      const response = await axios.post(`${getBackendUrl()}/api/orders/purchase-all/${currentUser.id}`)
      if (response.status !== 200) {
        throw new Error("전체 구매에 실패했습니다.")
      }
      const newOrder = response.data
      setOrders((prev) => [...prev, newOrder])
      setCart([])
      await fetchUserOrders()
      toast.success("전체 구매가 완료되었습니다", { duration: 5000 })
      router.push("/my")
    } catch (error) {
      console.error("전체 구매 오류:", error)
      toast.error("전체 구매에 실패했습니다", { duration: 5000 })
    }
  }

  const purchaseSingleItem = async (cartItem: CartItem) => {
    if (!isLoggedIn || !currentUser) {
      toast.error("로그인이 필요합니다", { duration: 5000 })
      return
    }
    try {
      const accessToken = localStorage.getItem("accessToken")
      const headers: any = {
        "Content-Type": "application/json",
        Accept: "application/json",
      }
      if (accessToken) headers["access_token"] = accessToken
      const orderData = {
        accountId: currentUser.id,
        productId: cartItem.product?.id || cartItem.id,
        quantity: cartItem.quantity,
      }
      const response = await axios.post(`${getBackendUrl()}/api/orders`, orderData, {
        headers,
        timeout: 10000,
      })
      if (response.status !== 200) {
        throw new Error("개별 구매에 실패했습니다.")
      }
              await onRemoveFromCart(cartItem.id)
      await fetchUserOrders()
      toast.success("개별 구매가 완료되었습니다", { duration: 5000 })
      router.push("/my")
    } catch (error: any) {
      console.error("개별 구매 오류:", error)
      toast.error("개별 구매에 실패했습니다", { duration: 5000 })
    }
  }

  const fetchUserOrders = useCallback(async () => {
    if (!isLoggedIn || !currentUser) return;
    try {
      const response = await axios.get(`${getBackendUrl()}/api/orders/user/${currentUser.id}`)
      if (response.status !== 200) {
        throw new Error("주문 조회에 실패했습니다.");
      }
      // ResponseDto 형태로 응답이 오므로 response.data.data를 사용
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error?.message || "API 응답이 올바르지 않습니다.");
      }
      
      const userOrders = response.data.data || [];
      const orderItems: OrderItem[] = userOrders.flatMap((order: any) => {
        if (order.orderItems && order.orderItems.length > 0) {
          return order.orderItems.map((item: any) => ({
            id: item.id || order.orderId,
                            productId: item.id || 0,
            productName: item.productName || `주문 #${order.orderId}`,
                          price: item.price || order.amount,
            quantity: item.quantity || 1,
            orderDate: order.orderedAt || new Date().toISOString(),
            status: order.paymentStatus === "COMPLETED" ? "completed" : order.paymentStatus === "PENDING" ? "pending" : "cancelled",
            ImageUrl: item.ImageUrl || "/placeholder.svg",
          }));
        } else {
          return [
            {
              id: order.orderId,
              productId: 0,
              productName: `주문 #${order.orderId}`,
              price: order.amount,
              quantity: 1,
              orderDate: order.orderedAt || new Date().toISOString(),
              status: order.paymentStatus === "COMPLETED" ? "completed" : order.paymentStatus === "PENDING" ? "pending" : "cancelled",
              ImageUrl: "/placeholder.svg",
            },
          ];
        }
      });
      const sortedOrderItems = orderItems.sort((a, b) => {
        const dateA = new Date(a.orderDate).getTime();
        const dateB = new Date(b.orderDate).getTime();
        return dateB - dateA;
      });
      setOrders(sortedOrderItems);
    } catch (error) {
      console.error("주문 조회 오류:", error);
      toast.error("주문 조회에 실패했습니다", { duration: 5000 });
    }
  }, [isLoggedIn, currentUser]);

  const deleteOrder = async (orderId: number) => {
    try {
      const response = await axios.delete(`${getBackendUrl()}/api/orders/${orderId}`)
      if (response.status !== 200) {
        throw new Error("주문 삭제에 실패했습니다.");
      }
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      toast.success("주문이 삭제되었습니다", { duration: 5000 });
    } catch (error) {
      console.error("주문 삭제 오류:", error);
      toast.error("주문 삭제에 실패했습니다", { duration: 5000 });
    }
  };

  const updatePaymentStatus = async (orderId: number, status: "PENDING" | "COMPLETED" | "CANCELLED") => {
    try {
      const response = await axios.put(`${getBackendUrl()}/api/orders/${orderId}/status?status=${status}`)
      if (response.status !== 200) {
        throw new Error("결제 상태 업데이트에 실패했습니다.");
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: status === "COMPLETED" ? "completed" : status === "PENDING" ? "pending" : "cancelled" }
            : order
        )
      );
      toast.success("결제 상태가 업데이트되었습니다", { duration: 5000 });
    } catch (error) {
      console.error("결제 상태 업데이트 오류:", error);
      toast.error("결제 상태 업데이트에 실패했습니다", { duration: 5000 });
    }
  };

  const handleAddPet = (petData: any) => {
    const newPet: Pet = {
      id: pets.length + 1,
      ...petData,
      dateRegistered: getCurrentKSTDate(),
      adoptionStatus: "available",
    };
    setPets((prev) => [...prev, newPet]);
    toast.success("새로운 펫이 등록되었습니다", { duration: 5000 });
    router.push("/adoption");
  };

  // 홈페이지에서는 상품 목록을 가져오지 않음 - 스토어 페이지에서만 가져옴
  useEffect(() => {
    // 홈페이지 로드 시 상품 목록은 비워둠
    setProducts([]);
  }, []);

  const handleAddProduct = (productData: any) => {
    const newProduct: Product = {
      id: products.length + 1,
      ...productData,
      registrationDate: getCurrentKSTDate(),
      registeredBy: currentUser?.email || "admin",
      petType: productData.petType || "all",
    };
    setProducts((prev) => [...prev, newProduct]);
    toast.success("새로운 상품이 등록되었습니다", { duration: 5000 });
    router.push("/store");
  };

  const handleViewProduct = (product: Product) => {
    console.log("handleViewProduct called with:", product)
    
    // 일반 상품인지 확인
    if ('id' in product && product.id) {
      console.log("일반 상품으로 인식됨:", product)
      setSelectedProductId(Number(product.id))
      setCurrentPage("product-detail")
    }
  }

  const handleEditProduct = (product: Product) => {
    router.push(`/store/edit?productId=${product.id}`);
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    toast.success("상품이 수정되었습니다", { duration: 5000 });
  };

  const addToInsuranceFavorites = (id: number) => {
    setFavoriteInsurance((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    toast.success("펫보험이 즐겨찾기에 추가되었습니다", { duration: 5000 });
  };

  const removeFromInsuranceFavorites = (id: number) => {
    setFavoriteInsurance((prev) => prev.filter((itemId) => itemId !== id));
    toast.success("펫보험이 즐겨찾기에서 제거되었습니다", { duration: 5000 });
  };

  const handleUpdateDiaryEntry = (updatedEntry: DiaryEntry) => {
    setDiaryEntries((prev) => prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)));
    setSelectedDiaryEntry(updatedEntry);
    toast.success("성장일기가 수정되었습니다", { duration: 5000 });
  };

  const handleDeleteDiaryEntry = (entryId: number) => {
    setDiaryEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    setSelectedDiaryEntry(null);
    toast.success("성장일기가 삭제되었습니다", { duration: 5000 });
  };

  const handleDeleteCommunityPost = (postId: number) => {
    setCommunityPosts((prev) => prev.filter((post) => post.id !== postId));
    setSelectedPost(null);
    toast.success("게시물이 삭제되었습니다", { duration: 5000 });
  };

  const handleBuyNow = async (product: Product) => {
    if (!isLoggedIn || !currentUser) {
      toast.error("로그인이 필요합니다", { duration: 5000 });
      return;
    }
    try {
      const accessToken = localStorage.getItem("accessToken");
      const headers: any = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (accessToken) headers["access_token"] = accessToken;
      const orderData = {
        userId: currentUser.id,
        totalPrice: product.price,
        orderItems: [
          {
            productId: product.id,
            productName: product.name || product.brand + " " + product.category,
            imageUrl: product.image || "/placeholder.svg",
            quantity: 1,
            price: product.price,
          },
        ],
      }
      const response = await axios.post(`${getBackendUrl()}/api/orders`, orderData, {
        headers,
        timeout: 10000,
      });
      if (response.status !== 200) {
        throw new Error("주문 생성에 실패했습니다.");
      }
      await fetchUserOrders();
      toast.success("바로구매가 완료되었습니다", { duration: 5000 });
      router.push("/my");
    } catch (error: any) {
      console.error("바로구매 오류:", error);
      toast.error("바로구매에 실패했습니다", { duration: 5000 });
    }
  };

  const renderCurrentPage = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      );
    }

    switch (currentPage) {
      case "adoption":
        return (
          <AdoptionPage
            pets={pets}
            onViewPet={(pet) => {
              router.push(`/adoption/${pet.petId}`);
            }}
            onClose={() => router.push("/")}
            isAdmin={isAdmin}
            isLoggedIn={isLoggedIn}
            onNavigateToAnimalRegistration={() => router.push("/adoption/register")}
          />
        );

      case "animalRegistration":
        return (
          <AnimalRegistrationPage
            onClose={() => router.push("/admin")}
            onAddPet={handleAddPet}
            isAdmin={isAdmin}
            currentUserId={isLoggedIn ? currentUser?.id.toString() : undefined}
          />
        );

      case "store":
        return (
          <StorePage
            onClose={() => router.push("/")}
            onAddToWishlist={handleAddToWishlist}
            isInWishlist={isInWishlist}
            isAdmin={isAdmin}
            isLoggedIn={isLoggedIn}
            onNavigateToStoreRegistration={() => router.push("/store/register")}
            products={products}
            onViewProduct={handleViewProduct}
          />
        );




      case "product-detail":
        return (
          <StoreProductDetailPage
            productId={selectedProductId!}
            onBack={() => {
              setSelectedProductId(null)
              router.push("/store")
            }}
            onAddToWishlist={handleAddToWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isInWishlist={isInWishlist}
            isInCart={isInCart}
          />
        )


      case "storeRegistration":
        return (
          <StoreProductRegistrationPage
            onClose={() => router.push("/admin")}
            onAddProduct={handleAddProduct}
            isAdmin={isAdmin}
            currentUserId={isLoggedIn ? currentUser?.id.toString() : undefined}
            products={products}
          />
        );

      case "cart":
        // 장바구니는 독립적인 페이지로 처리
        router.push("/store/cart");
        return null;

      case "insurance":
        if (selectedInsurance) {
          return <InsuranceDetailPage insurance={selectedInsurance} onBack={() => setSelectedInsurance(null)} />;
        }
        return (
          <PetInsurancePage
            favoriteInsurance={favoriteInsurance}
            onAddToFavorites={addToInsuranceFavorites}
            onRemoveFromFavorites={removeFromInsuranceFavorites}
            onViewDetails={(insurance) => setSelectedInsurance(insurance)}
          />
        );

      case "diary":
        return (
          <GrowthDiaryPage
            entries={diaryEntries}
            onViewEntry={() => {}}
            onClose={() => router.push("/")}
            onAddEntry={() => {}}
            isLoggedIn={isLoggedIn}
            currentUserId={currentUser?.id?.toString()}
            onNavigateToWrite={() => router.push("/diary/write")}
          />
        );

      case "growthDiaryWrite":
        return (
          <GrowthDiaryWritePage
            onBack={() => router.push("/diary")}
            onSubmit={(entryData) => {
              const newEntry: DiaryEntry = {
                id: diaryEntries.length + 1,
                ...entryData,
                date: new Date().toISOString().split("T")[0],
                ownerEmail: currentUser?.email,
                audioUrl: entryData.audioUrl,
              };
              setDiaryEntries((prev) => [...prev, newEntry]);
              toast.success("성장일기가 작성되었습니다", { duration: 5000 });
              router.push("/diary");
            }}
          />
        );

      case "community":
        if (selectedPost) {
          return (
            <CommunityDetailPage
              post={selectedPost}
              onBack={() => setSelectedPost(null)}
              isLoggedIn={isLoggedIn}
              onUpdatePost={(updatedPost) => {
                setCommunityPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
                setSelectedPost(updatedPost);
                toast.success("게시물이 수정되었습니다", { duration: 5000 });
              }}
              onDeletePost={handleDeleteCommunityPost}
              currentUserEmail={currentUser?.email}
            />
          );
        }
        return (
          <CommunityPage
            posts={communityPosts}
            isLoggedIn={isLoggedIn}
            onUpdatePosts={setCommunityPosts}
          />
        );

      case "communityWrite":
        return (
          <CommunityWritePage
            onBack={() => router.push("/community")}
            onSubmit={(postData) => {
              const newPost: CommunityPost = {
                id: communityPosts.length + 1,
                title: postData.title,
                content: postData.content,
                author: currentUser?.name || "현재사용자",
                date: new Date().toISOString().split("T")[0],
                category: "일반",
                boardType: postData.type,
                views: 0,
                likes: 0,
                comments: 0,
                tags: [],
                ownerEmail: currentUser?.email,
              };
              setCommunityPosts((prev) => [newPost, ...prev]);
              toast.success("게시물이 작성되었습니다", { duration: 5000 });
              router.push("/community");
            }}
          />
        );

      case "research":
        return <DogResearchLabPage onClose={() => router.push("/")} />;


      case "cart":
        if (!isLoggedIn) {
          return (
            <div className="min-h-screen bg-gray-50 pt-20">
              <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h3>
                  <p className="text-gray-600 mb-6">장바구니를 이용하려면 로그인해주세요.</p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push("/")}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      홈으로 돌아가기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        return (
          <CartPage
            cartItems={cart}
            onRemoveFromCart={onRemoveFromCart}
            onNavigateToStore={() => router.push("/store")}
            onPurchaseAll={purchaseAllFromCart}
            onPurchaseSingle={purchaseSingleItem}
            onUpdateQuantity={handleUpdateCartQuantity}
          />
        )

      case "naming":
        return <PetNamingService onClose={() => router.push("/")} />;

      case "admin":
        return (
          <AdminPage
            onClose={() => router.push("/")}
            products={products}
            pets={pets}
            communityPosts={communityPosts}
            adoptionInquiries={adoptionInquiries}
            comments={comments}
            onNavigateToStoreRegistration={() => router.push("/store/register")}
            onNavigateToAnimalRegistration={() => router.push("/adoption/register")}
            onNavigateToCommunity={() => router.push("/community")}
            onUpdateInquiryStatus={(id, status) => {
              setAdoptionInquiries((prev) =>
                prev.map((inquiry) => (inquiry.id === id ? { ...inquiry, status } : inquiry))
              );
              toast.success("입양 문의 상태가 업데이트되었습니다", { duration: 5000 });
            }}
            onDeleteComment={(id) => {
              setComments((prev) => prev.filter((comment) => comment.id !== id));
              toast.success("댓글이 삭제되었습니다", { duration: 5000 });
            }}
            onDeletePost={(id) => {
              setCommunityPosts((prev) => prev.filter((post) => post.id !== id));
              toast.success("게시물이 삭제되었습니다", { duration: 5000 });
            }}
            onUpdatePet={(updatedPet) => {
              setPets((prev) => prev.map((pet) => (pet.id === updatedPet.id ? updatedPet : pet)));
            }}
            onEditProduct={handleEditProduct}
            onDeleteProduct={(productId) => {
              setProducts((prev) => prev.filter((product) => product.id !== productId));
              toast.success("상품이 삭제되었습니다", { duration: 5000 });
            }}
            onUpdateOrderStatus={updatePaymentStatus}
            isAdmin={isAdmin}
          />
        );

      case "my":
        return (
          <MyPage
            currentUser={currentUser}
            userPets={pets.filter((pet) => pet.ownerEmail === currentUser?.email)}
            userAdoptionInquiries={adoptionInquiries.filter((inquiry) => inquiry.email === currentUser?.email)}
            userOrders={orders}
            onClose={() => router.push("/")}
            onRefreshOrders={fetchUserOrders}
          />
        );

      case "contract":
        if (!isAdmin) {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
                <p className="text-gray-600">AI 계약서 서비스는 관리자만 접근할 수 있습니다.</p>
                <Button onClick={() => router.push("/")} className="mt-4">
                  홈으로 돌아가기
                </Button>
              </div>
            </div>
          );
        }
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto p-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">AI 계약서 서비스</h1>
                <p className="text-gray-600">템플릿을 관리하고 AI의 도움을 받아 맞춤형 계약서를 생성하세요.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setShowContractTemplatePage(true)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      템플릿 관리
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">계약서 템플릿을 생성, 수정, 관리할 수 있습니다.</p>
                  </CardContent>
                </Card>
                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setShowContractGenerationPage(true)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      계약서 생성
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">AI의 도움을 받아 맞춤형 계약서를 생성하세요.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="min-h-screen bg-white">
            <section className="bg-gradient-to-br from-yellow-50 to-orange-50 py-20">
              <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      펫보험 추천으로
                      <br />더 편한
                      <br />
                      반려 라이프를 즐기세요
                    </h1>
                    <p className="text-xl text-gray-600">우리 아이의 시간을 더 행복하게, 반려동물의 삶을 더 편하게</p>
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => router.push("/insurance")}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        펫보험 추천받기
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => router.push("/store")}
                        className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                      >
                        펫용품 쇼핑
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="relative z-10">
                      <Image
                        src="/jjj_포메라니안.jpg"
                        alt="Pet service interface mockup"
                        width={600}
                        height={400}
                        className="w-full h-auto rounded-2xl shadow-2xl"
                      />
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-200 rounded-full opacity-50 animate-pulse"></div>
                    <div className="absolute -top-10 -left-10 w-24 h-24 bg-orange-200 rounded-full opacity-30 animate-bounce"></div>
                  </div>
                </div>
              </div>
            </section>
            <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
              <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">우리 아이를 위한 모든 것</h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">입양부터 쇼핑, 보험까지 반려동물과 함께하는 행복한 라이프스타일</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 justify-center max-w-6xl mx-auto">
                  <Card className="relative overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 rounded-2xl">
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold transform rotate-12 shadow-lg">
                      NEW
                    </div>
                    <CardHeader className="text-center pb-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-2xl">
                      <CardTitle className="text-3xl font-bold text-gray-900 border-b-4 border-yellow-400 inline-block pb-3">
                        🏠 입양 & 상담
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 p-8">
                      <div className="grid grid-cols-2 gap-6">
                        <button onClick={() => router.push("/adoption")} className="group text-center space-y-4 w-full p-4 rounded-xl hover:bg-yellow-50 transition-all duration-300">
                          <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <Heart className="w-10 h-10 text-yellow-600 fill-yellow-600" />
                          </div>
                          <p className="text-base font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">보호소 입양</p>
                        </button>
                        <button onClick={() => router.push("/agent")} className="group text-center space-y-4 w-full p-4 rounded-xl hover:bg-yellow-50 transition-all duration-300">
                          <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <MessageSquare className="w-10 h-10 text-yellow-600" />
                          </div>
                          <p className="text-base font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">AI 입양 상담</p>
                        </button>
                        {isAdmin && isLoggedIn && (
                          <button
                            onClick={() => router.push("/adoption/register")}
                            className="group text-center space-y-4 w-full p-4 rounded-xl hover:bg-yellow-50 transition-all duration-300 col-span-2"
                          >
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <Search className="w-10 h-10 text-yellow-600" />
                            </div>
                            <p className="text-base font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">동물 등록</p>
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 rounded-2xl">
                    <CardHeader className="text-center pb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                      <CardTitle className="text-3xl font-bold text-gray-900 border-b-4 border-green-400 inline-block pb-3">
                        🛍️ 스토어 & 쇼핑
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 p-8">
                      <div className="grid grid-cols-2 gap-6">
                        <button onClick={() => router.push("/store")} className="group text-center space-y-4 w-full p-4 rounded-xl hover:bg-green-50 transition-all duration-300">
                          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <Store className="w-10 h-10 text-green-600" />
                          </div>
                          <p className="text-base font-semibold text-gray-800 group-hover:text-green-600 transition-colors">펫용품 쇼핑</p>
                        </button>
                        <button
                          onClick={() => {
                            if (!isLoggedIn) {
                              toast.error("장바구니를 이용하려면 로그인이 필요합니다", { duration: 5000 });
                              return;
                            } else {
                              router.push("/store/cart");
                            }
                          }}
                          className="group text-center space-y-4 w-full p-4 rounded-xl hover:bg-green-50 transition-all duration-300 relative"
                        >
                          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg relative">
                            <ShoppingCart className="w-10 h-10 text-green-600" />
                            {isLoggedIn && cart.length > 0 && (
                              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                                {cart.length}
                              </span>
                            )}
                          </div>
                          <p className="text-base font-semibold text-gray-800 group-hover:text-green-600 transition-colors">장바구니</p>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
            
            {/* 새로운 섹션: 서비스 하이라이트 */}
            <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">특별한 서비스</h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">AI 기술과 함께하는 스마트한 반려동물 케어</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  <div className="text-center group">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <MessageSquare className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">AI 챗봇</h3>
                    <p className="text-gray-600 leading-relaxed">24시간 언제든 반려동물 관련 질문에 답변해드립니다</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Heart className="w-12 h-12 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">펫보험 추천</h3>
                    <p className="text-gray-600 leading-relaxed">AI가 분석한 맞춤형 펫보험 상품을 추천해드립니다</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Store className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">스마트 쇼핑</h3>
                    <p className="text-gray-600 leading-relaxed">개인화된 펫용품 추천과 편리한 쇼핑 경험</p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* 새로운 섹션: 통계 및 성과 */}
            <section className="py-20 bg-white">
              <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">500+</div>
                    <p className="text-gray-600">입양 성공</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">1,200+</div>
                    <p className="text-gray-600">상품 판매</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">800+</div>
                    <p className="text-gray-600">보험 가입</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">2,000+</div>
                    <p className="text-gray-600">만족 고객</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderCurrentPage()}
    </div>
  );
}