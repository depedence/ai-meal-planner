package ru.depedence.aimealplanner.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import ru.depedence.aimealplanner.service.GroqClient;

@Configuration
@Profile("stub")
public class StubGroqConfig {

    @Bean
    @Primary
    public GroqClient stubGroqClient() {
        return prompt ->
            """
            {"totalEstimatedPrice":50,"meals":[
              {"dayNumber":1,"type":"breakfast","dishName":"Тестовый завтрак","ingredients":[
                {"name":"продукт","amount":"1 шт","estimatedPrice":30},
                {"name":"продукт2","amount":"1 шт","estimatedPrice":20}
              ],"estimatedPrice":50}
            ]}
            """;
    }
}
