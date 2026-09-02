package ru.depedence.aimealplanner.api.test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import ru.depedence.aimealplanner.api.StubGroqClientConfig;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(StubGroqClientConfig.class)
public class MealPlanApiTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
    }

    @Test
    void shouldReturnGeneratedPlanForValidRequest() {
        given()
            .contentType(ContentType.JSON)
            .body(
                """
                {"budget":1000,"days":1,"peopleCount":1,"varietyLevel":"MIXED"}
                """
            )
            .when()
            .post("/api/v1/meal-plan")
            .then()
            .statusCode(200)
            .body("totalEstimatedPrice", equalTo(50))
            .body("meals[0].dishName", equalTo("Тестовый завтрак"));
    }

    @Test
    void shouldReturnBadRequestWhenBudgetMissing() {
        given()
            .contentType(ContentType.JSON)
            .body(
                """
                {"days":1,"peopleCount":1,"varietyLevel":"MIXED"}
                """
            )
            .when()
            .post("/api/v1/meal-plan")
            .then()
            .statusCode(400);
    }
}
