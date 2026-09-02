package ru.depedence.aimealplanner.api;

import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import ru.depedence.aimealplanner.service.GroqClient;

@TestConfiguration
public class StubGroqClientConfig {

    @Bean
    @Primary
    public GroqClient stubGroqClient() {
        GroqClient stub = Mockito.mock(GroqClient.class);
        Mockito.when(stub.askForMealPlan(Mockito.anyString())).thenReturn(
            """
            {"totalEstimatedPrice":50,"meals":[
              {"dayNumber":1,"type":"breakfast","dishName":"Тестовый завтрак","ingredients":[
                {"name":"продукт","amount":"1 шт","estimatedPrice":30},
                {"name":"продукт2","amount":"1 шт","estimatedPrice":20}
              ],"estimatedPrice":50}
            ]}
            """
        );
        return stub;
    }
}
