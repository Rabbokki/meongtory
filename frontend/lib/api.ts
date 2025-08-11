import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

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
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/pets?${params.toString()}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 펫 생성
  createPet: async (petData: Omit<Pet, 'petId'>): Promise<Pet> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_BASE_URL}/pets`, petData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 펫 수정
  updatePet: async (petId: number, petData: Partial<Pet>): Promise<Pet> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`${API_BASE_URL}/pets/${petId}`, petData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 펫 삭제
  deletePet: async (petId: number): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.delete(`${API_BASE_URL}/pets/${petId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 펫 이미지 URL 업데이트
  updatePetImageUrl: async (petId: number, imageUrl: string): Promise<Pet> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(`${API_BASE_URL}/pets/${petId}/image-url`, null, {
        params: { imageUrl },
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 펫 입양 상태 업데이트
  updateAdoptionStatus: async (petId: number, adopted: boolean): Promise<Pet> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(`${API_BASE_URL}/pets/${petId}/adoption-status`, null, {
        params: { adopted },
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// S3 API 함수들
export const s3Api = {
  // 파일 업로드 (일반)
  uploadFile: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('access_token');

      const response = await axios.post(`${API_BASE_URL}/s3/upload`, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 입양 펫 이미지 업로드
  uploadAdoptionFile: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('access_token');

      const response = await axios.post(`${API_BASE_URL}/s3/upload/adoption`, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 파일 삭제
  deleteFile: async (fileName: string): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.delete(`${API_BASE_URL}/s3/delete`, {
        params: { fileName },
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      if (response.status !== 200) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// 사용자 정보 API 함수들
export const userApi = {
  // 현재 로그인한 사용자 정보 가져오기
  getCurrentUser: async (): Promise<any> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/accounts/me`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// 입양신청 API 함수들
export const adoptionRequestApi = {
  // 입양신청 생성
  createAdoptionRequest: async (requestData: {
    petId: number;
    applicantName: string;
    contactNumber: string;
    email: string;
    message: string;
  }): Promise<any> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_BASE_URL}/adoption-requests`, requestData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 관리자용 전체 입양신청 조회
  getAdoptionRequests: async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/adoption-requests`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 사용자별 입양신청 조회
  getUserAdoptionRequests: async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/adoption-requests/user`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 특정 입양신청 조회
  getAdoptionRequest: async (requestId: number): Promise<any> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/adoption-requests/${requestId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 입양신청 상태 변경
  updateAdoptionRequestStatus: async (requestId: number, status: string): Promise<any> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(
        `${API_BASE_URL}/adoption-requests/${requestId}/status`,
        { status },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 입양신청 수정
  updateAdoptionRequest: async (
    requestId: number,
    data: {
      applicantName: string;
      contactNumber: string;
      email: string;
      message: string;
    }
  ): Promise<any> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`${API_BASE_URL}/adoption-requests/${requestId}`, data, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 상태별 입양신청 조회
  getAdoptionRequestsByStatus: async (status: string): Promise<any[]> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/adoption-requests/status/${status}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// 상품 API 함수들
export const productApi = {
  // 모든 상품 조회
  getProducts: async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      console.error('상품 목록 조회 실패:', error);
      throw handleApiError(error);
    }
  },

  // 특정 상품 조회
  getProduct: async (productId: number): Promise<any> => {
    console.log('상품 조회 요청:', `${API_BASE_URL}/products/${productId}`);
    console.log('요청할 productId:', productId, '타입:', typeof productId);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

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
          method: error.config?.method,
        });
      }
      throw handleApiError(error);
    }
  },

  // 상품 생성
  createProduct: async (productData: any): Promise<any> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_BASE_URL}/products`, productData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 상품 수정
  updateProduct: async (productId: number, productData: any): Promise<any> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`${API_BASE_URL}/products/${productId}`, productData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 상품 삭제
  deleteProduct: async (productId: number): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.delete(`${API_BASE_URL}/products/${productId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// 네이버 API 함수들
export const naverApi = {
  // 네이버 상품 검색 (GET)
  searchProducts: async (params: {
    query: string;
    display?: number;
    start?: number;
    sort?: string;
  }): Promise<any> => {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/naver/products/search?${searchParams.toString()}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data.data || response.data;
    } catch (error) {
      console.error('네이버 상품 검색 실패:', error);
      throw handleApiError(error);
    }
  },

  // 네이버 상품 검색 (POST)
  searchProductsPost: async (requestData: {
    query: string;
    display?: number;
    start?: number;
    sort?: string;
  }): Promise<any> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_BASE_URL}/naver/products/search`, requestData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
      }

      return response.data.data || response.data;
    } catch (error) {
      console.error('네이버 상품 검색 (POST) 실패:', error);
      throw handleApiError(error);
    }
  },
};

// 에러 처리 유틸리티
export const handleApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      return new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
    } else if (status === 403) {
      return new Error('접근이 거부되었습니다.');
    } else if (status === 404) {
      return new Error('요청한 리소스를 찾을 수 없습니다.');
    } else if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
      return new Error('인증이 필요합니다. 로그인 페이지로 이동합니다.');
    } else if (data?.message) {
      return new Error(data.message);
    } else {
      return new Error(`서버 오류: ${status || '알 수 없음'}`);
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('알 수 없는 오류가 발생했습니다.');
};