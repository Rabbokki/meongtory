#!/usr/bin/env python3
"""
legodt.kr 웹사이트 디자인 분석 스크립트
디자인 요소들을 JSON 형태로 추출하여 우리 디자인에 적용할 수 있도록 함
"""

import requests
import json
import time
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
import re
from urllib.parse import urljoin
import logging
import cssutils
import base64

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LegodtDesignAnalyzer:
    def __init__(self):
        self.base_url = "https://legodt.kr"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
    def get_page_content(self, url: str) -> Optional[BeautifulSoup]:
        """웹페이지 내용을 가져옵니다."""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            logger.error(f"페이지 로드 실패 {url}: {e}")
            return None
    
    def extract_color_palette(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """색상 팔레트를 추출합니다."""
        colors = {
            'primary_colors': [],
            'secondary_colors': [],
            'accent_colors': [],
            'background_colors': [],
            'text_colors': [],
            'gradient_colors': []
        }
        
        try:
            # CSS 스타일에서 색상 추출
            style_elements = soup.find_all('style')
            for style in style_elements:
                css_content = style.get_text()
                
                # HEX 색상 코드
                hex_colors = re.findall(r'#[0-9a-fA-F]{3,6}', css_content)
                colors['primary_colors'].extend(hex_colors[:10])
                
                # RGB 색상
                rgb_colors = re.findall(r'rgb\([^)]+\)', css_content)
                colors['secondary_colors'].extend(rgb_colors[:10])
                
                # RGBA 색상
                rgba_colors = re.findall(r'rgba\([^)]+\)', css_content)
                colors['accent_colors'].extend(rgba_colors[:10])
                
                # 그라데이션
                gradients = re.findall(r'linear-gradient\([^)]+\)', css_content)
                colors['gradient_colors'].extend(gradients[:5])
            
            # 인라인 스타일에서 색상 추출
            elements_with_style = soup.find_all(attrs={'style': True})
            for elem in elements_with_style:
                style_attr = elem.get('style', '')
                hex_colors = re.findall(r'#[0-9a-fA-F]{3,6}', style_attr)
                colors['primary_colors'].extend(hex_colors)
                
                bg_colors = re.findall(r'background-color:\s*([^;]+)', style_attr)
                colors['background_colors'].extend(bg_colors)
                
                text_colors = re.findall(r'color:\s*([^;]+)', style_attr)
                colors['text_colors'].extend(text_colors)
            
            # 중복 제거
            for key in colors:
                colors[key] = list(set(colors[key]))[:10]  # 최대 10개씩
                
        except Exception as e:
            logger.error(f"색상 팔레트 추출 실패: {e}")
        
        return colors
    
    def extract_typography(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """타이포그래피 정보를 추출합니다."""
        typography = {
            'font_families': [],
            'font_sizes': [],
            'font_weights': [],
            'line_heights': [],
            'text_styles': []
        }
        
        try:
            # CSS에서 폰트 정보 추출
            style_elements = soup.find_all('style')
            for style in style_elements:
                css_content = style.get_text()
                
                # 폰트 패밀리
                font_families = re.findall(r'font-family:\s*([^;]+)', css_content)
                typography['font_families'].extend(font_families)
                
                # 폰트 크기
                font_sizes = re.findall(r'font-size:\s*([^;]+)', css_content)
                typography['font_sizes'].extend(font_sizes)
                
                # 폰트 웨이트
                font_weights = re.findall(r'font-weight:\s*([^;]+)', css_content)
                typography['font_weights'].extend(font_weights)
                
                # 라인 높이
                line_heights = re.findall(r'line-height:\s*([^;]+)', css_content)
                typography['line_heights'].extend(line_heights)
            
            # 인라인 스타일에서 추출
            elements_with_style = soup.find_all(attrs={'style': True})
            for elem in elements_with_style:
                style_attr = elem.get('style', '')
                
                font_family = re.search(r'font-family:\s*([^;]+)', style_attr)
                if font_family:
                    typography['font_families'].append(font_family.group(1))
                
                font_size = re.search(r'font-size:\s*([^;]+)', style_attr)
                if font_size:
                    typography['font_sizes'].append(font_size.group(1))
            
            # 중복 제거
            for key in typography:
                typography[key] = list(set(typography[key]))[:10]
                
        except Exception as e:
            logger.error(f"타이포그래피 추출 실패: {e}")
        
        return typography
    
    def extract_layout_structure(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """레이아웃 구조를 추출합니다."""
        layout = {
            'header_structure': {},
            'navigation_structure': {},
            'main_content_structure': {},
            'footer_structure': {},
            'grid_system': {},
            'spacing_system': {}
        }
        
        try:
            # 헤더 분석
            header = soup.find('header') or soup.find(class_=re.compile(r'header|top|head'))
            if header:
                layout['header_structure'] = {
                    'height': self.extract_dimension(header, 'height'),
                    'background': self.extract_background(header),
                    'elements': self.extract_element_structure(header)
                }
            
            # 네비게이션 분석
            nav = soup.find('nav') or soup.find(class_=re.compile(r'nav|menu|navigation'))
            if nav:
                layout['navigation_structure'] = {
                    'type': 'horizontal' if 'horizontal' in str(nav.get('class', [])) else 'vertical',
                    'items': len(nav.find_all('a')),
                    'background': self.extract_background(nav),
                    'elements': self.extract_element_structure(nav)
                }
            
            # 메인 콘텐츠 분석
            main = soup.find('main') or soup.find(class_=re.compile(r'main|content|container'))
            if main:
                layout['main_content_structure'] = {
                    'width': self.extract_dimension(main, 'width'),
                    'max_width': self.extract_dimension(main, 'max-width'),
                    'padding': self.extract_spacing(main, 'padding'),
                    'margin': self.extract_spacing(main, 'margin'),
                    'elements': self.extract_element_structure(main)
                }
            
            # 푸터 분석
            footer = soup.find('footer') or soup.find(class_=re.compile(r'footer|bottom'))
            if footer:
                layout['footer_structure'] = {
                    'height': self.extract_dimension(footer, 'height'),
                    'background': self.extract_background(footer),
                    'elements': self.extract_element_structure(footer)
                }
            
            # 그리드 시스템 분석
            grid_elements = soup.find_all(class_=re.compile(r'grid|col|row|flex'))
            if grid_elements:
                layout['grid_system'] = {
                    'type': 'flexbox' if soup.find(class_=re.compile(r'flex')) else 'grid',
                    'columns': self.analyze_grid_columns(grid_elements),
                    'gap': self.extract_gap(grid_elements)
                }
            
            # 간격 시스템 분석
            layout['spacing_system'] = self.analyze_spacing_system(soup)
            
        except Exception as e:
            logger.error(f"레이아웃 구조 추출 실패: {e}")
        
        return layout
    
    def extract_dimension(self, element, property_name: str) -> str:
        """요소의 크기 속성을 추출합니다."""
        try:
            style_attr = element.get('style', '')
            match = re.search(f'{property_name}:\s*([^;]+)', style_attr)
            return match.group(1) if match else ''
        except:
            return ''
    
    def extract_background(self, element) -> Dict[str, str]:
        """요소의 배경 정보를 추출합니다."""
        background = {'color': '', 'image': '', 'gradient': ''}
        try:
            style_attr = element.get('style', '')
            
            bg_color = re.search(r'background-color:\s*([^;]+)', style_attr)
            if bg_color:
                background['color'] = bg_color.group(1)
            
            bg_image = re.search(r'background-image:\s*url\(([^)]+)\)', style_attr)
            if bg_image:
                background['image'] = bg_image.group(1)
            
            bg_gradient = re.search(r'background:\s*(linear-gradient[^;]+)', style_attr)
            if bg_gradient:
                background['gradient'] = bg_gradient.group(1)
                
        except:
            pass
        
        return background
    
    def extract_element_structure(self, element) -> List[Dict[str, Any]]:
        """요소의 하위 구조를 추출합니다."""
        structure = []
        try:
            for child in element.find_all(recursive=False):
                structure.append({
                    'tag': child.name,
                    'class': child.get('class', []),
                    'id': child.get('id', ''),
                    'text_content': child.get_text(strip=True)[:50] + '...' if len(child.get_text(strip=True)) > 50 else child.get_text(strip=True)
                })
        except:
            pass
        return structure
    
    def extract_spacing(self, element, property_name: str) -> str:
        """요소의 간격 속성을 추출합니다."""
        try:
            style_attr = element.get('style', '')
            match = re.search(f'{property_name}:\s*([^;]+)', style_attr)
            return match.group(1) if match else ''
        except:
            return ''
    
    def analyze_grid_columns(self, grid_elements) -> int:
        """그리드 컬럼 수를 분석합니다."""
        try:
            for elem in grid_elements:
                class_attr = str(elem.get('class', []))
                # col-12, col-md-6 등의 패턴 찾기
                col_matches = re.findall(r'col-[a-z-]*(\d+)', class_attr)
                if col_matches:
                    return max(map(int, col_matches))
        except:
            pass
        return 12  # 기본값
    
    def extract_gap(self, grid_elements) -> str:
        """그리드 간격을 추출합니다."""
        try:
            for elem in grid_elements:
                style_attr = elem.get('style', '')
                gap_match = re.search(r'gap:\s*([^;]+)', style_attr)
                if gap_match:
                    return gap_match.group(1)
        except:
            pass
        return ''
    
    def analyze_spacing_system(self, soup: BeautifulSoup) -> Dict[str, List[str]]:
        """간격 시스템을 분석합니다."""
        spacing = {'margins': [], 'paddings': [], 'gaps': []}
        
        try:
            style_elements = soup.find_all('style')
            for style in style_elements:
                css_content = style.get_text()
                
                margins = re.findall(r'margin:\s*([^;]+)', css_content)
                spacing['margins'].extend(margins)
                
                paddings = re.findall(r'padding:\s*([^;]+)', css_content)
                spacing['paddings'].extend(paddings)
                
                gaps = re.findall(r'gap:\s*([^;]+)', css_content)
                spacing['gaps'].extend(gaps)
            
            # 중복 제거
            for key in spacing:
                spacing[key] = list(set(spacing[key]))[:10]
                
        except Exception as e:
            logger.error(f"간격 시스템 분석 실패: {e}")
        
        return spacing
    
    def extract_component_patterns(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """컴포넌트 패턴을 추출합니다."""
        components = {
            'buttons': [],
            'cards': [],
            'forms': [],
            'modals': [],
            'navigation_items': [],
            'product_items': []
        }
        
        try:
            # 버튼 패턴
            buttons = soup.find_all('button') + soup.find_all(class_=re.compile(r'btn|button'))
            for btn in buttons[:5]:  # 최대 5개
                components['buttons'].append({
                    'type': btn.get('type', 'button'),
                    'class': btn.get('class', []),
                    'style': btn.get('style', ''),
                    'text': btn.get_text(strip=True)
                })
            
            # 카드 패턴
            cards = soup.find_all(class_=re.compile(r'card|product|item'))
            for card in cards[:5]:
                components['cards'].append({
                    'class': card.get('class', []),
                    'structure': self.extract_element_structure(card),
                    'style': card.get('style', '')
                })
            
            # 폼 패턴
            forms = soup.find_all('form')
            for form in forms[:3]:
                components['forms'].append({
                    'method': form.get('method', ''),
                    'action': form.get('action', ''),
                    'inputs': len(form.find_all('input')),
                    'structure': self.extract_element_structure(form)
                })
            
            # 네비게이션 아이템
            nav_items = soup.find_all('a', href=True)
            for item in nav_items[:10]:
                components['navigation_items'].append({
                    'text': item.get_text(strip=True),
                    'href': item.get('href', ''),
                    'class': item.get('class', [])
                })
            
            # 상품 아이템
            product_items = soup.find_all(class_=re.compile(r'product|item|goods'))
            for item in product_items[:5]:
                components['product_items'].append({
                    'class': item.get('class', []),
                    'image': bool(item.find('img')),
                    'price': bool(re.search(r'\d+원', item.get_text())),
                    'structure': self.extract_element_structure(item)
                })
                
        except Exception as e:
            logger.error(f"컴포넌트 패턴 추출 실패: {e}")
        
        return components
    
    def extract_animations(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """애니메이션 정보를 추출합니다."""
        animations = {
            'transitions': [],
            'keyframes': [],
            'hover_effects': [],
            'loading_animations': []
        }
        
        try:
            style_elements = soup.find_all('style')
            for style in style_elements:
                css_content = style.get_text()
                
                # 트랜지션
                transitions = re.findall(r'transition:\s*([^;]+)', css_content)
                animations['transitions'].extend(transitions)
                
                # 키프레임
                keyframes = re.findall(r'@keyframes\s+([^{]+)\s*{([^}]+)}', css_content)
                animations['keyframes'].extend([{'name': k[0], 'content': k[1]} for k in keyframes])
                
                # 호버 효과
                hover_effects = re.findall(r':hover\s*{([^}]+)}', css_content)
                animations['hover_effects'].extend(hover_effects)
                
                # 로딩 애니메이션
                loading_animations = re.findall(r'animation:\s*([^;]+)', css_content)
                animations['loading_animations'].extend(loading_animations)
            
            # 중복 제거
            for key in animations:
                if key == 'keyframes':
                    continue
                animations[key] = list(set(animations[key]))[:5]
                
        except Exception as e:
            logger.error(f"애니메이션 추출 실패: {e}")
        
        return animations
    
    def analyze_legodt_design(self) -> Dict[str, Any]:
        """legodt.kr 사이트의 디자인을 분석합니다."""
        logger.info("legodt.kr 디자인 분석 시작")
        
        result = {
            'site_info': {},
            'color_palette': {},
            'typography': {},
            'layout_structure': {},
            'component_patterns': {},
            'animations': {},
            'design_system': {},
            'analyzed_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        try:
            # 메인 페이지 분석
            main_soup = self.get_page_content(self.base_url)
            if not main_soup:
                logger.error("메인 페이지 로드 실패")
                return result
            
            # 사이트 정보
            result['site_info'] = {
                'title': main_soup.find('title').get_text(strip=True) if main_soup.find('title') else '',
                'description': main_soup.find('meta', attrs={'name': 'description'}).get('content', '') if main_soup.find('meta', attrs={'name': 'description'}) else '',
                'viewport': main_soup.find('meta', attrs={'name': 'viewport'}).get('content', '') if main_soup.find('meta', attrs={'name': 'viewport'}) else ''
            }
            
            logger.info(f"사이트 정보 추출 완료: {result['site_info']['title']}")
            
            # 색상 팔레트
            result['color_palette'] = self.extract_color_palette(main_soup)
            logger.info("색상 팔레트 추출 완료")
            
            # 타이포그래피
            result['typography'] = self.extract_typography(main_soup)
            logger.info("타이포그래피 추출 완료")
            
            # 레이아웃 구조
            result['layout_structure'] = self.extract_layout_structure(main_soup)
            logger.info("레이아웃 구조 추출 완료")
            
            # 컴포넌트 패턴
            result['component_patterns'] = self.extract_component_patterns(main_soup)
            logger.info("컴포넌트 패턴 추출 완료")
            
            # 애니메이션
            result['animations'] = self.extract_animations(main_soup)
            logger.info("애니메이션 추출 완료")
            
            # 디자인 시스템 요약
            result['design_system'] = {
                'primary_color': result['color_palette']['primary_colors'][0] if result['color_palette']['primary_colors'] else '#000000',
                'main_font': result['typography']['font_families'][0] if result['typography']['font_families'] else 'Arial, sans-serif',
                'layout_type': 'responsive' if 'responsive' in str(main_soup) else 'fixed',
                'grid_system': result['layout_structure']['grid_system']['type'] if result['layout_structure']['grid_system'] else 'flexbox',
                'animation_style': 'subtle' if len(result['animations']['transitions']) > 0 else 'static'
            }
            
            logger.info("디자인 분석 완료")
            
        except Exception as e:
            logger.error(f"디자인 분석 중 오류 발생: {e}")
        
        return result
    
    def save_to_json(self, data: Dict[str, Any], filename: str = 'legodt_design_data.json'):
        """데이터를 JSON 파일로 저장합니다."""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f"디자인 데이터가 {filename}에 저장되었습니다.")
        except Exception as e:
            logger.error(f"JSON 저장 실패: {e}")

def main():
    """메인 실행 함수"""
    analyzer = LegodtDesignAnalyzer()
    
    # 디자인 분석 실행
    design_data = analyzer.analyze_legodt_design()
    
    # JSON 파일로 저장
    analyzer.save_to_json(design_data)
    
    # 결과 요약 출력
    print(f"\n=== 디자인 분석 결과 ===")
    print(f"사이트: {design_data['site_info'].get('title', 'N/A')}")
    print(f"주요 색상: {design_data['color_palette']['primary_colors'][:3]}")
    print(f"주요 폰트: {design_data['typography']['font_families'][:3]}")
    print(f"레이아웃 타입: {design_data['design_system']['layout_type']}")
    print(f"그리드 시스템: {design_data['design_system']['grid_system']}")
    print(f"애니메이션 스타일: {design_data['design_system']['animation_style']}")
    print(f"분석 시간: {design_data['analyzed_at']}")
    
    print(f"\n=== 샘플 컴포넌트 ===")
    if design_data['component_patterns']['buttons']:
        print(f"버튼 스타일: {design_data['component_patterns']['buttons'][0]['class']}")
    if design_data['component_patterns']['cards']:
        print(f"카드 스타일: {design_data['component_patterns']['cards'][0]['class']}")

if __name__ == "__main__":
    main() 