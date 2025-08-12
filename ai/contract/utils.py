from datetime import datetime
from typing import Dict, List

def replace_template_variables(content: str, petInfo: dict, userInfo: dict) -> str:
    """
    템플릿의 변수들을 실제 정보로 치환합니다.
    """
    # 기본 변수 매핑
    variable_mapping = {
        '[이름]': petInfo.get('name', ''),
        '[품종]': petInfo.get('breed', ''),
        '[나이]': petInfo.get('age', ''),
        '[성별]': petInfo.get('gender', ''),
        '[건강상태]': petInfo.get('healthStatus', ''),
        '[신청자 이름]': userInfo.get('name', ''),
        '[신청자 연락처]': userInfo.get('phone', ''),
        '[신청자 이메일]': userInfo.get('email', ''),
        '[입양인]': userInfo.get('name', ''),
        '[분양인]': userInfo.get('name', ''),
        '[날짜]': datetime.now().strftime('%Y년 %m월 %d일')
    }
    
    # 변수 치환
    for placeholder, value in variable_mapping.items():
        content = content.replace(placeholder, str(value))
    
    return content

def parse_contract_suggestions(response_text: str) -> list:
    try:
        import json
        # JSON 부분 추출
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        
        if start_idx >= 0 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            data = json.loads(json_str)
            return data.get("suggestions", [])
        else:
            # JSON 파싱 실패 시 기본 추천 반환
            return get_default_contract_suggestions()
    except:
        return get_default_contract_suggestions()

def get_default_contract_suggestions() -> list:
    return [
        {
            "suggestion": "제4조 (건강관리)",
            "type": "SECTION",
            "confidence": 0.8
        },
        {
            "suggestion": "제5조 (의료비용)",
            "type": "SECTION",
            "confidence": 0.7
        },
        {
            "suggestion": "제6조 (반려동물 행동)",
            "type": "SECTION",
            "confidence": 0.6
        },
        {
            "suggestion": "제7조 (식사 및 영양)",
            "type": "SECTION",
            "confidence": 0.5
        },
        {
            "suggestion": "제8조 (임시보호)",
            "type": "SECTION",
            "confidence": 0.4
        },
        {
            "suggestion": "제9조 (책임과 의무)",
            "type": "SECTION",
            "confidence": 0.3
        },
        {
            "suggestion": "제10조 (계약 해지)",
            "type": "SECTION",
            "confidence": 0.2
        }
    ]

def parse_clause_suggestions(response_text: str) -> list:
    suggestions = []
    lines = response_text.strip().split('\n')
    for line in lines:
        if line.strip():
            suggestions.append({"suggestion": line.strip(), "type": "CLAUSE", "confidence": 0.9})
    return suggestions

def get_default_clause_suggestions() -> list:
    return [
        {"suggestion": "제4조 (건강관리 및 의료비용)", "type": "CLAUSE", "confidence": 0.9},
        {"suggestion": "제5조 (반려동물 행동 및 훈련)", "type": "CLAUSE", "confidence": 0.8},
        {"suggestion": "제6조 (식사 및 영양 관리)", "type": "CLAUSE", "confidence": 0.7},
        {"suggestion": "제7조 (임시보호 및 위탁)", "type": "CLAUSE", "confidence": 0.6},
        {"suggestion": "제8조 (책임과 의무)", "type": "CLAUSE", "confidence": 0.5},
        {"suggestion": "제9조 (계약 해지 및 반환)", "type": "CLAUSE", "confidence": 0.4},
        {"suggestion": "제10조 (분쟁 해결)", "type": "CLAUSE", "confidence": 0.3}
    ] 