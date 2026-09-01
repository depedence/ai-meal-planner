package ru.depedence.aimealplanner.config;

import java.net.InetSocketAddress;
import java.net.Proxy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient groqRestClient(
        GroqProperties groqProperties,
        ProxyProperties proxyProperties
    ) {
        RestClient.Builder builder = RestClient.builder()
            .baseUrl(groqProperties.baseUrl())
            .defaultHeader("Authorization", "Bearer " + groqProperties.apiKey())
            .defaultHeader("Content-Type", "application/json");

        if (proxyProperties.enabled()) {
            SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

            Proxy proxy = new Proxy(
                Proxy.Type.HTTP,
                new InetSocketAddress(
                    proxyProperties.host(),
                    proxyProperties.port()
                )
            );
            requestFactory.setProxy(proxy);
            builder.requestFactory(requestFactory);
        }

        return builder.build();
    }
}
