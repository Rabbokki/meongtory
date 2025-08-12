package com.my.backend.contract.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
public class ContractFileService {
    
    public byte[] generatePDF(String content) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            
            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            
            // 기본 폰트 사용
            PDFont font = PDType1Font.HELVETICA;
            PDFont boldFont = PDType1Font.HELVETICA_BOLD;
            
            // 제목 추가
            contentStream.setFont(boldFont, 16);
            contentStream.beginText();
            contentStream.newLineAtOffset(50, 750);
            contentStream.showText("Contract Document");
            contentStream.endText();
            
            // 내용 추가
            contentStream.setFont(font, 12);
            contentStream.beginText();
            contentStream.newLineAtOffset(50, 700);
            
            // 안전한 텍스트로 변환
            String safeContent = convertToSafeText(content);
            String[] lines = safeContent.split("\n");
            int yPosition = 700;
            
            for (String line : lines) {
                if (yPosition < 50) {
                    // 새 페이지 추가
                    contentStream.endText();
                    contentStream.close();
                    
                    PDPage newPage = new PDPage();
                    document.addPage(newPage);
                    contentStream = new PDPageContentStream(document, newPage);
                    contentStream.setFont(font, 12);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(50, 750);
                    yPosition = 750;
                }
                
                contentStream.showText(line);
                contentStream.newLineAtOffset(0, -15);
                yPosition -= 15;
            }
            
            contentStream.endText();
            contentStream.close();
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }
    
    private String convertToSafeText(String content) {
        if (content == null) {
            return "";
        }
        
        // 한글을 영문으로 변환
        String result = content;
        
        // 주요 한글 단어들을 영문으로 변환
        result = result.replace("계약서", "Contract");
        result = result.replace("입양", "Adoption");
        result = result.replace("반려동물", "Pet");
        result = result.replace("이름", "Name");
        result = result.replace("품종", "Breed");
        result = result.replace("나이", "Age");
        result = result.replace("성별", "Gender");
        result = result.replace("건강상태", "Health Status");
        result = result.replace("연락처", "Contact");
        result = result.replace("이메일", "Email");
        result = result.replace("주소", "Address");
        result = result.replace("생성일", "Created Date");
        result = result.replace("생성자", "Creator");
        result = result.replace("신청자", "Applicant");
        result = result.replace("전화번호", "Phone");
        result = result.replace("추가정보", "Additional Info");
        result = result.replace("정보", "Info");
        result = result.replace("내용", "Content");
        result = result.replace("상태", "Status");
        result = result.replace("완료", "Completed");
        result = result.replace("대기중", "Pending");
        result = result.replace("승인", "Approved");
        result = result.replace("거절", "Rejected");
        result = result.replace("중성화", "Neutered");
        result = result.replace("예방접종", "Vaccinated");
        result = result.replace("특별관리사항", "Special Care");
        result = result.replace("등록일", "Registration Date");
        result = result.replace("입양비", "Adoption Fee");
        result = result.replace("크기", "Size");
        result = result.replace("성격", "Personality");
        result = result.replace("설명", "Description");
        result = result.replace("위치", "Location");
        result = result.replace("직업", "Occupation");
        result = result.replace("반려동물 경험", "Pet Experience");
        result = result.replace("입양 이유", "Adoption Reason");
        result = result.replace("거주 환경", "Living Environment");
        result = result.replace("가족 구성원", "Family Members");
        
        // 남은 한글 문자들을 제거
        result = result.replaceAll("[가-힣]", "");
        
        // 연속된 공백을 하나로 정리
        result = result.replaceAll("\\s+", " ").trim();
        
        return result;
    }
    

    

    
    public byte[] generateWord(String content) throws IOException {
        try (XWPFDocument document = new XWPFDocument()) {
            // 제목 추가
            XWPFParagraph titleParagraph = document.createParagraph();
            XWPFRun titleRun = titleParagraph.createRun();
            titleRun.setText("계약서");
            titleRun.setBold(true);
            titleRun.setFontSize(16);
            
            // 내용 추가
            String[] lines = content.split("\n");
            for (String line : lines) {
                XWPFParagraph paragraph = document.createParagraph();
                XWPFRun run = paragraph.createRun();
                run.setText(line);
                run.setFontSize(12);
            }
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.write(baos);
            return baos.toByteArray();
        }
    }
}