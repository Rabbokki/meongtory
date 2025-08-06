// lib/api/diary.ts
import type { DiaryEntry } from "../../diary";
import axios from "axios";

export async function fetchDiaries(userId?: number) {
  const url = userId 
    ? `/api/diary/user/${userId}`
    : `/api/diary`;
    
  try {
    const res = await axios.get(url);

    console.log('Fetched diaries:', res.data); // 디버깅용 콘솔
    return res.data; // json.data 대신 json 반환
  } catch (error) {
    console.error("API error:", error);
    throw new Error(`Failed to fetch diaries: ${axios.isAxiosError(error) ? error.response?.status : 'Unknown error'}`);
  }
}

export async function createDiary(data: {
  userId: number;
  text: string;
  audioUrl?: string;
  imageUrl?: string;
}) {
  try {
    const res = await axios.post(`/api/diary`, data, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  } catch (error) {
    console.error("API error:", error);
    throw new Error(`Failed to create diary: ${axios.isAxiosError(error) ? error.response?.status : 'Unknown error'}`);
  }
}

export async function updateDiary(id: number, data: any) {
  try {
    const res = await axios.put(`/api/diary/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  } catch (error) {
    console.error("API error:", error);
    throw new Error(`Failed to update diary: ${axios.isAxiosError(error) ? error.response?.status : 'Unknown error'}`);
  }
}

export async function deleteDiary(id: number) {
  try {
    const res = await axios.delete(`/api/diary/${id}`);

    return res.status === 200;
  } catch (error) {
    console.error("API error:", error);
    throw new Error(`Failed to delete diary: ${axios.isAxiosError(error) ? error.response?.status : 'Unknown error'}`);
  }
}