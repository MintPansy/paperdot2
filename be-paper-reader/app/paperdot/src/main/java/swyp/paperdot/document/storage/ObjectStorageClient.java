package swyp.paperdot.document.storage;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;
import swyp.paperdot.document.enums.StorageProvider;


public interface ObjectStorageClient {
    void upload(String key, MultipartFile file, String contentType) throws IOException;

    /**
     * 스토리지에서 객체를 다운로드하여 InputStream으로 반환합니다.
     *
     * @param objectKey 다운로드할 객체의 키 (e.g., "documents/1/1/original/...")
     * @return 객의 데이터를 담고 있는 InputStream.
     * @apiNote 이 메서드를 통해 얻은 InputStream은 사용 후 반드시 호출자가 직접 close() 해야 합니다.
     *          try-with-resources 구문을 사용하는 것을 강력히 권장합니다.
     */
    InputStream download(String objectKey);

    String getBucket();

    StorageProvider getProvider();
}

