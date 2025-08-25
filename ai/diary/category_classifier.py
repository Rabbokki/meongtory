import os
import json
import logging
from openai import OpenAI
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class CategoryClassifier:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
        if not self.client.api_key:
            logger.warning("OPENAI_API_KEY not set")
    
    def classify_diary_content(self, content: str) -> List[str]:
        """
        일기 내용을 분석하여 카테고리를 자동 분류합니다.
        
        Args:
            content (str): 일기 내용
            
        Returns:
            List[str]: 분류된 카테고리 리스트 (예: ["일상"], ["건강"], ["일상", "건강"])
        """
        try:
            if not content or not content.strip():
                return []
            
            prompt = f"""
다음 일기 내용을 분석하여 카테고리를 분류해주세요.

일기 내용:
{content}

분류 규칙:
- "일상": 산책, 놀이, 일반 생활 기록, 애완동물과의 일상적인 활동
- "건강": 병원, 약, 예방접종, 진료, 치료, 건강 검진, 질병, 증상 등 건강 관련 기록

두 카테고리 모두 해당되면 둘 다 포함하세요.

반드시 다음 JSON 형식으로만 응답해주세요:
{{"categories": ["카테고리1", "카테고리2"]}}

예시:
- 산책 내용만 있으면: {{"categories": ["일상"]}}
- 병원 진료 내용만 있으면: {{"categories": ["건강"]}}
- 산책과 병원 내용이 모두 있으면: {{"categories": ["일상", "건강"]}}
- 해당하는 카테고리가 없으면: {{"categories": []}}
"""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "당신은 일기 내용을 분석하여 카테고리를 분류하는 전문가입니다. 반드시 JSON 형식으로만 응답해주세요."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100,
                temperature=0.1
            )
            
            # 응답에서 JSON 추출
            response_content = response.choices[0].message.content.strip()
            logger.info(f"OpenAI 응답: {response_content}")
            
            # JSON 파싱
            try:
                result = json.loads(response_content)
                categories = result.get("categories", [])
                
                # 유효한 카테고리만 필터링
                valid_categories = ["일상", "건강"]
                filtered_categories = [cat for cat in categories if cat in valid_categories]
                
                logger.info(f"분류된 카테고리: {filtered_categories}")
                return filtered_categories
                
            except json.JSONDecodeError as e:
                logger.error(f"JSON 파싱 오류: {e}, 응답: {response_content}")
                return []
                
        except Exception as e:
            logger.error(f"카테고리 분류 중 오류 발생: {str(e)}")
            return []
