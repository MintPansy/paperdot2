package swyp.paperdot.document.storage;

import java.net.URI;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.auth.signer.AwsS3V4Signer;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.core.client.config.SdkAdvancedClientOption;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

@Configuration
@EnableConfigurationProperties(NcpStorageProperties.class)
public class NcpStorageConfig {

    @Bean
    public S3Client ncpS3Client(NcpStorageProperties properties) {

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

        return S3Client.builder()
                .endpointOverride(URI.create(properties.getEndpoint()))
                .region(Region.of(properties.getRegion()))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(
                                        properties.getAccessKey(),
                                        properties.getSecretKey()
                                )
                        )
                )
                .serviceConfiguration(s3Configuration)
                .overrideConfiguration(overrideConfiguration)
                .build();
    }

    @Bean
    public ObjectStorageClient objectStorageClient(
            S3Client ncpS3Client,
            NcpStorageProperties properties
    ) {
        return new NcpObjectStorageClient(ncpS3Client, properties);
    }
}
