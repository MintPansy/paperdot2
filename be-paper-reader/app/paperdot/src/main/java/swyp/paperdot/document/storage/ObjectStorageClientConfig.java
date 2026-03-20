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

    private static final String DEFAULT_LOCAL_STORAGE_ROOT = "storage/local";

    @Bean
    public ObjectStorageClient objectStorageClient() {
        String accessKeyId = getenv("AWS_ACCESS_KEY_ID");
        String secretAccessKey = getenv("AWS_SECRET_ACCESS_KEY");
        String region = getenv("AWS_REGION");
        String bucket = getenv("AWS_S3_BUCKET");
        String endpoint = getenv("AWS_S3_ENDPOINT"); // 선택 (MinIO/S3-compatible)

        // AWS 정보가 하나라도 비어있으면 로컬 폴더로 fallback
        boolean hasAwsCredentials =
                notBlank(accessKeyId) &&
                notBlank(secretAccessKey) &&
                notBlank(region) &&
                notBlank(bucket);

        if (!hasAwsCredentials) {
            String localRoot = getenvOrDefault("LOCAL_STORAGE_ROOT", DEFAULT_LOCAL_STORAGE_ROOT);
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

