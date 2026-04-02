package swyp.paperdot.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig implements AsyncConfigurer {

    @Value("${translation.executor.core-pool-size:4}")
    private int corePoolSize;

    @Value("${translation.executor.max-pool-size:8}")
    private int maxPoolSize;

    @Value("${translation.executor.queue-capacity:200}")
    private int queueCapacity;

    @Bean(name = "documentPipelineExecutor")
    public Executor documentPipelineExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("doc-pipeline-");
        executor.initialize();
        return executor;
    }

    @Override
    public Executor getAsyncExecutor() {
        return documentPipelineExecutor();
    }
}
