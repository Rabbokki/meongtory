import axios from 'axios';

// API 설정을 위한 공통 유틸리티
export const getBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:8080';
  console.log('Backend URL:', url);
  console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
  return url;
};

export const getApiBaseUrl = () => {
  return `${getBackendUrl()}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// axios 인터셉터 설정 - 요청 시 인증 토큰 자동 추가
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['Access_Token'] = token; // 백엔드에서 Access_Token 헤더 사용
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
            refreshToken: refreshToken,
          });
          const newAccessToken = response.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);

          // 원래 요청 재시도
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          error.config.headers['Access_Token'] = newAccessToken;
          return axios.request(error.config);
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
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
    console.log('Fetching pets with URL:', `${API_BASE_URL}/pets?${params.toString()}`);
    const response = await axios.get(`${API_BASE_URL}/pets?${params.toString()}`);
    return response.data.data;
  },

  createPet: async (petData: Omit<Pet, 'petId'>): Promise<Pet> => {
    console.log('Creating pet with URL:', `${API_BASE_URL}/pets`);
    console.log('Pet data:', petData);
    const response = await axios.post(`${API_BASE_URL}/pets`, petData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Create pet response:', response.data);
    return response.data.data;
  },

  updatePet: async (petId: number, petData: Partial<Pet>): Promise<Pet> => {
    const response = await axios.put(`${API_BASE_URL}/pets/${petId}`, petData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  },

  deletePet: async (petId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/pets/${petId}`);
  },

  updatePetImageUrl: async (petId: number, imageUrl: string): Promise<Pet> => {
    const response = await axios.patch(`${API_BASE_URL}/pets/${petId}/image-url`, null, {
      params: { imageUrl },
    });
    return response.data.data;
  },

  updateAdoptionStatus: async (petId: number, adopted: boolean): Promise<Pet> => {
    const response = await axios.patch(`${API_BASE_URL}/pets/${petId}/adoption-status`, null, {
      params: { adopted },
    });
    return response.data.data;
  },
};

// S3 API 함수들
export const s3Api = {
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/s3/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  uploadAdoptionFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/s3/upload/adoption`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

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
  getCurrentUser: async (): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/accounts/me`);
    return response.data.data;
  },
};

// 입양신청 API 함수들
export const adoptionRequestApi = {
  createAdoptionRequest: async (requestData: {
    petId: number;
    applicantName: string;
    contactNumber: string;
    email: string;
    message: string;
  }): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/adoption-requests`, requestData);
    return response.data.data;
  },

  getAdoptionRequests: async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/adoption-requests`);
    return response.data.data;
  },

  getUserAdoptionRequests: async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/adoption-requests/user`);
    return response.data.data;
  },

  getAdoptionRequest: async (requestId: number): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/adoption-requests/${requestId}`);
    return response.data.data;
  },

  updateAdoptionRequestStatus: async (requestId: number, status: string): Promise<any> => {
    const response = await axios.put(`${API_BASE_URL}/adoption-requests/${requestId}/status`, {
      status: status,
    });
    return response.data.data;
  },

  updateAdoptionRequest: async (
    requestId: number,
    data: {
      applicantName: string;
      contactNumber: string;
      email: string;
      message: string;
    }
  ): Promise<any> => {
    const response = await axios.put(`${API_BASE_URL}/adoption-requests/${requestId}`, data);
    return response.data.data;
  },

  getAdoptionRequestsByStatus: async (status: string): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/adoption-requests/status/${status}`);
    return response.data.data;
  },
};

// 상품 API 함수들
export const productApi = {
  getProducts: async (): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data.data;
  },

  getProduct: async (productId: number): Promise<any> => {
    console.log('상품 조회 요청:', `${API_BASE_URL}/products/${productId}`);
    console.log('요청할 productId:', productId, '타입:', typeof productId);
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      console.log('상품 조회 성공:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('상품 조회 실패:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios 에러 상세:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
        });
      }
      throw error;
    }
  },

  createProduct: async (productData: any): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  },

  updateProduct: async (productId: number, productData: any): Promise<any> => {
    const response = await axios.put(`${API_BASE_URL}/products/${productId}`, productData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  },

  deleteProduct: async (productId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/products/${productId}`);
  },
};

// 에러 처리 유틸리티
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || '서버 오류가 발생했습니다.';
  }
  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
};