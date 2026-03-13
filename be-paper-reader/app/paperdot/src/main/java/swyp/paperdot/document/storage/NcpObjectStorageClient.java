package swyp.paperdot.document.storage;

import java.io.IOException;
import java.io.InputStream;

import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import swyp.paperdot.document.enums.StorageProvider;

@RequiredArgsConstructor
public class NcpObjectStorageClient implements ObjectStorageClient {

    private final S3Client s3Client;
    private final NcpStorageProperties properties;

    @Override
    public void upload(String key, MultipartFile file, String contentType) throws IOException {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(properties.getBucket())
                .key(key)
                .contentType(contentType)
                .acl(ObjectCannedACL.PRIVATE)
                .build();

        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
    }

    @Override
    public InputStream download(String objectKey) {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(properties.getBucket())
                .key(objectKey)
                .build();

        // s3Client.getObject는 ResponseInputStream<GetObjectResponse>를 반환합니다.
        // 이 스트림은 네트워크 연결을 유지하며, 데이터를 모두 읽으면 자동으로 닫히지만,
        // 오류 발생 또는 데이터 일부만 읽는 경우를 대비해 호출자가 명시적으로 close() 해주는 것이 안전합니다.
        // 인터페이스 주석에 명시된 대로, 이 스트림의 close 책임은 호출자에게 있습니다.
        ResponseInputStream<GetObjectResponse> response = s3Client.getObject(request);
        return response;
    }

    @Override
    public String getBucket() {
        return properties.getBucket();
    }

    @Override
    public StorageProvider getProvider() {
        return StorageProvider.NCLOUD;
    }
}
