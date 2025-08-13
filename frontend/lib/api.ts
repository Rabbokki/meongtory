import axios from 'axios';
import { getApiBaseUrl } from './utils/api-config';

const API_BASE_URL = getApiBaseUrl();

// axios 인터셉터 설정 - 요청 시 인증 토큰 자동 추가
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 에러 시 토큰 갱신 시도
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/accounts/refresh`, {
            refreshToken: refreshToken
          });
          const newAccessToken = response.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          
          // 원래 요청 재시도
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios.request(error.config);
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    }
    return Promise.reject(error);
  }
);

// API 응답 타입 정의
export interface Pet {
  petId: number;
  name: string;
  breed: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  vaccinated: boolean;
  description: string;
  imageUrl: string;
  adopted: boolean;
  weight?: number;
  location?: string;
  microchipId?: string;
  medicalHistory?: string;
  vaccinations?: string;
  notes?: string;
  personality?: string;
  rescueStory?: string;
  aiBackgroundStory?: string;
  status?: string;
  type?: string;
  neutered?: boolean;
}

// 펫 API 함수들
export const petApi = {
  // 모든 펫 조회 (필터링 지원)
  getPets: async (filters?: {
    name?: string;
    breed?: string;
    gender?: 'MALE' | 'FEMALE';
    adopted?: boolean;
    vaccinated?: boolean;
    neutered?: boolean;
    status?: string;
    type?: string;
    location?: string;
    minAge?: number;
    maxAge?: number;
    limit?: number;
    lastId?: number;
  }): Promise<Pet[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await axios.get(`${API_BASE_URL}/pets?${params.toString()}`);
    return response.data;
  },

  // 펫 생성
  createPet: async (petData: Omit<Pet, 'petId'>): Promise<Pet> => {
    const response = await axios.post(`${API_BASE_URL}/pets`, petData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // 펫 수정
  updatePet: async (petId: number, petData: Partial<Pet>): Promise<Pet> => {
    const response = await axios.put(`${API_BASE_URL}/pets/${petId}`, petData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // 펫 삭제
  deletePet: async (petId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/pets/${petId}`);
  },

  // 펫 이미지 URL 업데이트
  updatePetImageUrl: async (petId: number, imageUrl: string): Promise<Pet> => {
    const response = await axios.patch(`${API_BASE_URL}/pets/${petId}/image-url`, null, {
      params: { imageUrl },
    });
    return response.data;
  },

  // 펫 입양 상태 업데이트
  updateAdoptionStatus: async (petId: number, adopted: boolean): Promise<Pet> => {
    const response = await axios.patch(`${API_BASE_URL}/pets/${petId}/adoption-status`, null, {
      params: { adopted },
    });
    return response.data;
  },
};

// S3 API 함수들
export const s3Api = {
  // 파일 업로드 (일반)
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/s3/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // 입양 펫 이미지 업로드
  uploadAdoptionFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/s3/upload/adoption`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // 파일 삭제
  deleteFile: async (fileName: string): Promise<void> => {
    const response = await axios.delete(`${API_BASE_URL}/s3/delete`, {
      params: { fileName },
    });
    
    if (response.status !== 200) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
  },
};

// 사용자 정보 API 함수들
export const userApi = {
  // 현재 로그인한 사용자 정보 가져오기
  getCurrentUser: async (): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/accounts/me`)
    return response.data.data
  },
}

// 입양신청 API 함수들
export const adoptionRequestApi = {
  // 입양신청 생성
  createAdoptionRequest: async (requestData: {
    petId: number
    applicantName: string
    contactNumber: string
    email: string
    message: string
  }): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/adoption-requests`, requestData)
    return response.data
  },

  // 관리자용 전체 입양신청 조회
  getAdoptionRequests: async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/adoption-requests`)
    return response.data.data
  },

  // 사용자별 입양신청 조회
  getUserAdoptionRequests: async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/adoption-requests/user`)
    return response.data.data
  },

  // 특정 입양신청 조회
  getAdoptionRequest: async (requestId: number): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/adoption-requests/${requestId}`)
    return response.data.data
  },

  // 입양신청 상태 변경
  updateAdoptionRequestStatus: async (requestId: number, status: string): Promise<any> => {
    const response = await axios.put(`${API_BASE_URL}/adoption-requests/${requestId}/status`, {
      status: status
    })
    return response.data
  },

  // 입양신청 수정
  updateAdoptionRequest: async (requestId: number, data: {
    applicantName: string;
    contactNumber: string;
    email: string;
    message: string;
  }): Promise<any> => {
    const response = await axios.put(`${API_BASE_URL}/adoption-requests/${requestId}`, data)
    return response.data
  },

  // 상태별 입양신청 조회
  getAdoptionRequestsByStatus: async (status: string): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/adoption-requests/status/${status}`)
    return response.data.data
  },
}

// 상품 API 함수들
export const productApi = {
  // 모든 상품 조회
  getProducts: async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data;
  },

  // 특정 상품 조회
  getProduct: async (productId: number): Promise<any> => {
    console.log('상품 조회 요청:', `${API_BASE_URL}/products/${productId}`);
    console.log('요청할 productId:', productId, '타입:', typeof productId);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      console.log('상품 조회 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('상품 조회 실패:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios 에러 상세:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method
        });
      }
      throw error;
    }
  },

  // 상품 생성
  createProduct: async (productData: any): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // 상품 수정
  updateProduct: async (productId: number, productData: any): Promise<any> => {
    const response = await axios.put(`${API_BASE_URL}/products/${productId}`, productData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // 상품 삭제
  deleteProduct: async (productId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/products/${productId}`);
  },
};

// 에러 처리 유틸리티
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
}; 