package swyp.paperdot.document.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import swyp.paperdot.document.enums.StorageProvider;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;

/**
 * 로컬 폴더에 파일을 저장하고 InputStream으로 다운로드하는 ObjectStorageClient 구현체입니다.
 * (AWS 자격 증명이 없을 때 개발 편의를 위해 사용)
 */
@RequiredArgsConstructor
public class LocalObjectStorageClient implements ObjectStorageClient {

    private final Path rootDir;
    private final String bucket;

    @Override
    public void upload(String key, MultipartFile file, String contentType) throws IOException {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("object key is required");
        }
        if (file == null) {
            throw new IllegalArgumentException("file is required");
        }

        Path targetPath = rootDir.resolve(key).normalize();
        Path parent = targetPath.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }

        // MultipartFile 스트림을 로컬 파일로 복사
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    @Override
    public InputStream download(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            throw new IllegalArgumentException("object key is required");
        }

        Path targetPath = rootDir.resolve(objectKey).normalize();
        try {
            return Files.newInputStream(targetPath, StandardOpenOption.READ);
        } catch (IOException e) {
            throw new RuntimeException("Local file download failed. objectKey=" + objectKey, e);
        }
    }

    @Override
    public String getBucket() {
        return bucket;
    }

    @Override
    public StorageProvider getProvider() {
        return StorageProvider.LOCAL;
    }
}

