package swyp.paperdot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class PaperdotApplication {

	public static void main(String[] args) {
		SpringApplication.run(PaperdotApplication.class, args);
	}

}
