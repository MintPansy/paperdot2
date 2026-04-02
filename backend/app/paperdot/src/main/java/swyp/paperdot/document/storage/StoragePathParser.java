package swyp.paperdot.document.storage;

import org.springframework.stereotype.Component;
import swyp.paperdot.document.exception.InvalidStoragePathException;

/**
 * DB에 저장된 storagePath 문자열에서 objectKey만 추출합니다.
 *
 * 지원 포맷:
 * - ncloud://{bucket}/{objectKey}
 * - s3://{bucket}/{objectKey}
 * - local://{bucket}/{objectKey}
 *
 * 또한 protocol이 없는 경우(그냥 objectKey만 저장된 형태)에도 그대로 objectKey로 취급합니다.
 */
@Component
public class StoragePathParser {

    public String getObjectKey(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) {
            throw new InvalidStoragePathException("Invalid storage path format: path is empty");
        }

        // 프로토콜 없이 objectKey만 넘어오는 케이스 대응
        if (!storagePath.contains("://")) {
            return storagePath;
        }

        int protocolSeparatorIndex = storagePath.indexOf("://");
        int bucketStartIndex = protocolSeparatorIndex + 3;
        int slashIndex = storagePath.indexOf('/', bucketStartIndex);

        if (slashIndex == -1 || slashIndex + 1 >= storagePath.length()) {
            throw new InvalidStoragePathException(
                    "Invalid storage path format: Cannot find object key part. path=" + storagePath
            );
        }

        return storagePath.substring(slashIndex + 1);
    }
}

