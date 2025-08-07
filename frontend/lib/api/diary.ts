// lib/api/diary.ts
import type { DiaryEntry } from "../../diary";

// Access Token 가져오기 + 로그인 체크 함수
function getAccessTokenOrRedirect(): string {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    // API 요청의 경우 리다이렉트하지 않고 에러를 던짐
    throw new Error("로그인이 필요합니다.");
  }
  return accessToken;
}

// 공통 401 에러 처리 함수
async function handleUnauthorized(res: Response) {
  if (res.status === 401) {
    const errorText = await res.text();
    console.error("Unauthorized:", errorText);
    
    // 토큰 제거
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    // API 요청의 경우 리다이렉트하지 않고 에러를 던짐
    throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
  }
}

// 개별 일기 가져오기
export async function fetchDiary(id: number): Promise<DiaryEntry> {
  const accessToken = getAccessTokenOrRedirect();

  const res = await fetch(`/api/diary/${id}`, {
    method: "GET",
    headers: {
      Authorization: `${accessToken}`,
    },
  });

  console.log("Fetch diary response status:", res.status);

  if (res.status === 401) {
    await handleUnauthorized(res);
  }

  if (!res.ok) {
    const text = await res.text();
    console.error("API error response:", text);
    throw new Error(`Failed to fetch diary: ${res.status}`);
  }

  const contentType = res.headers.get("Content-Type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Non-JSON response:", text);
    throw new Error("Received non-JSON response from server");
  }

  const json = await res.json();
  console.log("Fetched diary:", json);
  return json;
}

// 일기 목록 가져오기
export async function fetchDiaries(userId?: number): Promise<DiaryEntry[]> {
  const accessToken = getAccessTokenOrRedirect();

  const url = userId
    ? `/api/diary/user/${userId}`
    : `/api/diary`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `${accessToken}`, // Bearer 제거
    },
  });

  console.log("Response status:", res.status);
  console.log("Response headers:", res.headers.get("Content-Type"));

  if (res.status === 401) {
    await handleUnauthorized(res);
  }

  if (!res.ok) {
    const text = await res.text();
    console.error("API error response:", text);
    throw new Error(`Failed to fetch diaries: ${res.status}`);
  }

  const contentType = res.headers.get("Content-Type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Non-JSON response:", text);
    throw new Error("Received non-JSON response from server");
  }

  const json = await res.json();
  console.log("Fetched diaries:", json);
  return json;
}

// 일기 생성하기
export async function createDiary(data: {
  userId: number;
  title: string;
  text: string;
  audioUrl?: string;
  imageUrl?: string;
}) {
  const accessToken = getAccessTokenOrRedirect();

  const res = await fetch(`/api/diary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (res.status === 401) await handleUnauthorized(res);

  if (!res.ok) {
    const text = await res.text();
    console.error("API error:", text);
    throw new Error(`Failed to create diary: ${res.status}`);
  }

  return res.json();
}

// 일기 수정하기
export async function updateDiary(id: number, data: any) {
  const accessToken = getAccessTokenOrRedirect();

  console.log("=== Frontend UpdateDiary Debug ===");
  console.log("Updating diary with data:", { id, data });
  console.log("API URL:", `/api/diary/${id}`);
  console.log("Access token:", accessToken ? "Present" : "Missing");

  try {
    const res = await fetch(`/api/diary/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    console.log("Update diary response status:", res.status);
    console.log("Update diary response headers:", Object.fromEntries(res.headers.entries()));

    if (res.status === 401) await handleUnauthorized(res);

    if (!res.ok) {
      const text = await res.text();
      console.error("API error response:", text);
      
      // JSON 응답인지 확인
      try {
        const errorData = JSON.parse(text);
        console.error("Parsed error data:", errorData);
        throw new Error(`Failed to update diary: ${res.status} - ${errorData.error || errorData.details || text}`);
      } catch (parseError) {
        throw new Error(`Failed to update diary: ${res.status} - ${text}`);
      }
    }

    const result = await res.json();
    console.log("Update diary success result:", result);
    return result;
  } catch (error) {
    console.error("Update diary error:", error);
    throw error;
  }
}

// 일기 삭제하기
export async function deleteDiary(id: number) {
  const accessToken = getAccessTokenOrRedirect();

  const res = await fetch(`/api/diary/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `${accessToken}`,
    },
  });

  if (res.status === 401) await handleUnauthorized(res);

  if (!res.ok) {
    const text = await res.text();
    console.error("API error:", text);
    throw new Error(`Failed to delete diary: ${res.status}`);
  }

  return res.ok;
}

// S3 이미지 업로드 함수
export async function uploadImageToS3(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/s3/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("S3 upload error:", errorData);
    throw new Error(`Failed to upload image: ${errorData.error || res.statusText}`);
  }

  const result = await res.json();
  return result.url;
}