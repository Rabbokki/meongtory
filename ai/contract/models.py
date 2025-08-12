from pydantic import BaseModel
from typing import Optional, List, Dict

# 계약서 AI 추천 요청 모델
class ContractSuggestionRequest(BaseModel):
    templateId: int = None
    currentContent: str = ""
    petInfo: dict = {}
    userInfo: dict = {}

# 조항 추천 요청 모델
class ClauseSuggestionRequest(BaseModel):
    templateId: Optional[int] = None
    currentClauses: list[str] = []
    petInfo: dict = {}
    userInfo: dict = {}

# 계약서 생성 요청 모델
class ContractGenerationRequest(BaseModel):
    templateId: int
    templateContent: str = ""
    templateSections: list = []
    customSections: list = []
    removedSections: list = []
    petInfo: dict = {}
    userInfo: dict = {}
    additionalInfo: str = ""

# 템플릿 섹션 모델
class TemplateSection(BaseModel):
    id: int
    title: str
    content: str
    isRequired: bool = False
    orderNum: int
    type: str = "TEXT"
    options: str = ""

# 계약서 템플릿 모델
class ContractTemplate(BaseModel):
    id: int
    name: str
    description: str
    category: str
    content: str
    sections: list[TemplateSection] = []
    isDefault: bool = False 