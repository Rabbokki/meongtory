import os
import openai
from fastapi import HTTPException
from .models import ContractSuggestionRequest, ClauseSuggestionRequest, ContractGenerationRequest
from .prompts import build_contract_suggestion_prompt, build_clause_suggestion_prompt, build_template_based_contract_prompt
from .utils import parse_contract_suggestions, parse_clause_suggestions, get_default_contract_suggestions, get_default_clause_suggestions, replace_template_variables

class ContractAIService:
    def __init__(self):
        # OpenAI 설정
        openai.api_key = os.getenv("OPENAI_API_KEY", "")
        if not openai.api_key:
            print("Warning: OPENAI_API_KEY not set")
    
    async def get_contract_suggestions(self, request: ContractSuggestionRequest):
        """계약서 조항 추천 서비스"""
        try:
            # 프롬프트 구성
            prompt = build_contract_suggestion_prompt(request)
            
            # OpenAI API 호출
            model_name = os.getenv("OPENAI_CONTRACT_MODEL", "gpt-4")
            response = openai.ChatCompletion.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": """당신은 반려동물 관련 계약서 조항 추천 전문가입니다. 

당신의 역할:
1. 반려동물의 특성(품종, 나이, 건강상태)을 고려한 맞춤형 조항 제목 추천
2. 입양인의 상황과 책임을 명확히 하는 조항 제목 제시
3. 실제 계약서에서 유용한 조항 제목 제공
4. '제X조 (제목)' 형식으로 작성

주의사항:
- 조항 제목만 추천하고, 내용 설명은 하지 않음
- 추상적이거나 일반적인 설명 금지
- "제X조 (제목)" 형식으로만 작성"""},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            suggestions_text = response.choices[0].message.content.strip()
            suggestions = parse_contract_suggestions(suggestions_text)
            
            return {
                "suggestions": suggestions
            }
            
        except Exception as e:
            print(f"Error in contract suggestions: {e}")
            return {
                "suggestions": get_default_contract_suggestions()
            }
    
    async def get_clause_suggestions(self, request: ClauseSuggestionRequest):
        """조항 추천 서비스"""
        try:
            # 프롬프트 구성
            prompt = build_clause_suggestion_prompt(request)
            
            # OpenAI API 호출
            model_name = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
            response = openai.ChatCompletion.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": """당신은 반려동물 계약서 조항 추천 전문가입니다.

당신의 역할:
1. 반려동물의 특성(품종, 나이, 건강상태)을 고려한 맞춤형 조항 제목 추천
2. 입양인의 상황과 책임을 명확히 하는 조항 제목 제시
3. 실제 계약서에서 유용한 구체적인 조항 제목 제공
4. '제X조 (구체적인 제목)' 형식으로 작성

주의사항:
- 추상적이거나 일반적인 설명 금지
- 반려동물의 특성에 맞는 구체적인 조항 제목 제시
- 조항 제목만 추천하고, 내용 설명은 하지 않음"""},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            suggestions_text = response.choices[0].message.content.strip()
            suggestions = parse_clause_suggestions(suggestions_text)
            
            return {
                "suggestions": suggestions
            }
            
        except Exception as e:
            print(f"Error in clause suggestions: {e}")
            return {
                "suggestions": get_default_clause_suggestions()
            }
    
    async def generate_contract(self, request: ContractGenerationRequest):
        """계약서 생성 서비스"""
        try:
            # 프롬프트 구성
            prompt = build_template_based_contract_prompt(request)
            
            # OpenAI API 호출
            model_name = os.getenv("OPENAI_CONTRACT_MODEL", "gpt-4")
            response = openai.ChatCompletion.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "당신은 반려동물 관련 계약서 작성 전문가입니다. 주어진 정보를 바탕으로 완성된 계약서를 작성해주세요."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.3
            )
            
            contract_content = response.choices[0].message.content.strip()
            
            # 변수 치환
            final_contract_content = replace_template_variables(contract_content, request.petInfo, request.userInfo)
            
            return {
                "content": final_contract_content,
                "status": "success",
                "message": "계약서가 성공적으로 생성되었습니다."
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"계약서 생성 실패: {str(e)}") 