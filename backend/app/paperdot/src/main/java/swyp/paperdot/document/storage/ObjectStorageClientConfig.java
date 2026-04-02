package swyp.paperdot.document.storage;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.client.config.SdkAdvancedClientOption;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.auth.signer.AwsS3V4Signer;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;
import java.nio.file.Path;

@Configuration
public class ObjectStorageClientConfig {

    // Railway 컨테이너에서 앱 디렉토리(./uploads)는 read-only → /tmp/uploads 사용
    private static final String DEFAULT_LOCAL_STORAGE_ROOT = "/tmp/uploads";

    @Bean
    public ObjectStorageClient objectStorageClient() {
        // AWS_* 우선, 없으면 NCP_* fallback (NCP Object Storage는 S3 호환)
        String accessKeyId = getenvOrDefault("AWS_ACCESS_KEY_ID", getenv("NCP_ACCESS_KEY"));
        String secretAccessKey = getenvOrDefault("AWS_SECRET_ACCESS_KEY", getenv("NCP_SECRET_KEY"));
        String region = getenvOrDefault("AWS_REGION", getenv("NCP_REGION"));
        String bucket = getenvOrDefault("AWS_S3_BUCKET", getenv("NCP_BUCKET"));
        String endpoint = getenvOrDefault("AWS_S3_ENDPOINT", getenv("NCP_ENDPOINT"));

        // 자격증명 정보가 하나라도 비어있으면 로컬 폴더로 fallback
        boolean hasAwsCredentials =
                notBlank(accessKeyId) &&
                notBlank(secretAccessKey) &&
                notBlank(region) &&
                notBlank(bucket);

        if (!hasAwsCredentials) {
            // UPLOAD_DIR(Railway volume) → LOCAL_STORAGE_ROOT → ./uploads 순으로 fallback
            String localRoot = getenvOrDefault("UPLOAD_DIR",
                    getenvOrDefault("LOCAL_STORAGE_ROOT", DEFAULT_LOCAL_STORAGE_ROOT));
            return new LocalObjectStorageClient(Path.of(localRoot).toAbsolutePath().normalize(), "local");
        }

        S3Client s3Client = buildS3Client(accessKeyId, secretAccessKey, region, endpoint);
        return new S3ObjectStorageClient(s3Client, bucket);
    }

    private S3Client buildS3Client(
            String accessKeyId,
            String secretAccessKey,
            String region,
            String endpoint
    ) {
        S3Configuration s3Configuration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .chunkedEncodingEnabled(false)
                .checksumValidationEnabled(false)
                .build();

        ClientOverrideConfiguration overrideConfiguration =
                ClientOverrideConfiguration.builder()
                        .putAdvancedOption(
                                SdkAdvancedClientOption.SIGNER,
                                AwsS3V4Signer.create()
                        )
                        .build();

        // AWS SDK v2의 builder 타입을 명시하면 버전별로 컴파일이 깨질 수 있어,
        // 타입 추론(`var`)으로 안정적으로 처리합니다.
        var builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                        )
                )
                .serviceConfiguration(s3Configuration)
                .overrideConfiguration(overrideConfiguration);

        if (notBlank(endpoint)) {
            builder.endpointOverride(URI.create(endpoint));
        }

        return builder.build();
    }

    private static boolean notBlank(String v) {
        return v != null && !v.isBlank();
    }

    private static String getenv(String key) {
        return System.getenv(key);
    }

    private static String getenvOrDefault(String key, String defaultValue) {
        String v = System.getenv(key);
        return notBlank(v) ? v : defaultValue;
    }
}

