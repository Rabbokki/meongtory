// lib/api/diary.ts
import type { DiaryEntry } from "../../diary";

export async function fetchDiaries(userId?: number) {
  const url = userId 
    ? `/api/diary/user/${userId}`
    : `/api/diary`;
    
  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const text = await res.text();
    console.error("API error:", text);
    throw new Error(`Failed to fetch diaries: ${res.status}`);
  }

  return res.json() as Promise<DiaryEntry[]>;
}


export async function createDiary(data: {
  userId: number;
  text: string;
  audioUrl?: string;
  imageUrl?: string;
}) {
  const res = await fetch(`/api/diary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API error:", text);
    throw new Error(`Failed to create diary: ${res.status}`);
  }

  return res.json();
}


export async function updateDiary(id: number, data: any) {
  const res = await fetch(`/api/diary/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API error:", text);
    throw new Error(`Failed to update diary: ${res.status}`);
  }

  return res.json();
}

export async function deleteDiary(id: number) {
  const res = await fetch(`/api/diary/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API error:", text);
    throw new Error(`Failed to delete diary: ${res.status}`);
  }

  return res.ok;
}
