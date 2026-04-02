package swyp.paperdot.document.dto;

import org.springframework.web.multipart.MultipartFile;

public class DocumentUploadRequest {

    private Long ownerId;
    private String title;
    private String languageSrc;
    private String languageTgt;
    private MultipartFile file;

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLanguageSrc() {
        return languageSrc;
    }

    public void setLanguageSrc(String languageSrc) {
        this.languageSrc = languageSrc;
    }

    public String getLanguageTgt() {
        return languageTgt;
    }

    public void setLanguageTgt(String languageTgt) {
        this.languageTgt = languageTgt;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }
}
