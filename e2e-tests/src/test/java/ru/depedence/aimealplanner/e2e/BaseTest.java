package ru.depedence.aimealplanner.e2e;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.logevents.SelenideLogger;
import io.qameta.allure.selenide.AllureSelenide;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;

public class BaseTest {

    // Run app with "stub" profile
    // mvn spring-boot:run -Dspring-boot.run.profiles=stub

    static {
        SelenideLogger.addListener(
            "AllureSelenide",
            new AllureSelenide().screenshots(true).savePageSource(true)
        );
    }

    @BeforeEach
    void setUp() {
        Configuration.browser = "chrome";
        Configuration.browserSize = "1920x1080";
        Configuration.baseUrl = "http://localhost:5173";
        Configuration.timeout = 15_000;
    }

    @AfterEach
    void tearDown() {
        Selenide.closeWebDriver();
    }
}
