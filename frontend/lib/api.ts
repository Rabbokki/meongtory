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
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/pets?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch pets: ${response.statusText}`);
    }
    return response.json();
  },

  // 펫 생성
  createPet: async (petData: Omit<Pet, 'petId'>): Promise<Pet> => {
    const response = await fetch(`${API_BASE_URL}/pets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(petData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create pet: ${response.statusText}`);
    }
    return response.json();
  },

  // 펫 수정
  updatePet: async (petId: number, petData: Partial<Pet>): Promise<Pet> => {
    const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(petData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update pet: ${response.statusText}`);
    }
    return response.json();
  },

  // 펫 삭제
  deletePet: async (petId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete pet: ${response.statusText}`);
    }
  },

  // 펫 이미지 URL 업데이트
  updatePetImageUrl: async (petId: number, imageUrl: string): Promise<Pet> => {
    const response = await fetch(`${API_BASE_URL}/pets/${petId}/image-url?imageUrl=${encodeURIComponent(imageUrl)}`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error(`Failed to update pet image: ${response.statusText}`);
    }
    return response.json();
  },
};

// 에러 처리 유틸리티
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
}; 