package swyp.paperdot.document.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import swyp.paperdot.document.enums.StorageProvider;

import java.io.IOException;
import java.io.InputStream;

/**
 * AWS S3에 파일을 업로드/다운로드하는 ObjectStorageClient 구현체입니다.
 */
@RequiredArgsConstructor
public class S3ObjectStorageClient implements ObjectStorageClient {

    private final S3Client s3Client;
    private final String bucket;

    @Override
    public void upload(String key, MultipartFile file, String contentType) throws IOException {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .acl(ObjectCannedACL.PRIVATE)
                .build();

        // Response stream 같은 네트워크 리소스는 아니고, putObject는 호출 즉시 반환됩니다.
        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
    }

    @Override
    public InputStream download(String objectKey) {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .build();

        ResponseInputStream<GetObjectResponse> response = s3Client.getObject(request);
        return response;
    }

    @Override
    public void delete(String objectKey) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .build();
        s3Client.deleteObject(request);
    }

    @Override
    public String getBucket() {
        return bucket;
    }

    @Override
    public StorageProvider getProvider() {
        return StorageProvider.S3;
    }
}

