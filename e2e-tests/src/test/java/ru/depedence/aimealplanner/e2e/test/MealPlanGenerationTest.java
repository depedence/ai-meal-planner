package ru.depedence.aimealplanner.e2e.test;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import ru.depedence.aimealplanner.e2e.BaseTest;
import ru.depedence.aimealplanner.e2e.page.MealPlanFormPage;
import ru.depedence.aimealplanner.e2e.page.MealPlanResultPage;

@Epic("Meal plan generation")
@Feature("Generate meal plan from form")
public class MealPlanGenerationTest extends BaseTest {

    private final MealPlanFormPage formPage = new MealPlanFormPage();
    private final MealPlanResultPage resultPage = new MealPlanResultPage();

    @Test
    @DisplayName("Generate meal plan with valid parameters")
    @Story("Happy path")
    @Tag("ui")
    @Severity(SeverityLevel.CRITICAL)
    void generateMealPlanTest() {
        formPage.open();
        formPage.setBudget("1500");
        formPage.setDays("1");
        formPage.setPeopleCount("1");
        formPage.selectVarietyLevel("SAME");
        formPage.submit();

        resultPage.checkResultDisplayed();
        resultPage.checkDayCount(1);
    }

    @Test
    @DisplayName("Switch to shopping list view")
    @Story("Shopping list")
    @Tag("ui")
    @Severity(SeverityLevel.NORMAL)
    void switchToShoppingListMenuTest() {
        formPage.open();
        formPage.setBudget("1000");
        formPage.setDays("1");
        formPage.setPeopleCount("1");
        formPage.selectVarietyLevel("MIXED");
        formPage.submit();

        resultPage.checkResultDisplayed();
        resultPage.switchToShoppingList();
        resultPage.returnToMainMenu();
    }

    @Test
    @DisplayName("Return from result screen to form")
    @Story("Navigation")
    @Tag("ui")
    @Severity(SeverityLevel.NORMAL)
    void returnToMainMenuTest() {
        formPage.open();
        formPage.setBudget("1000");
        formPage.setDays("1");
        formPage.setPeopleCount("1");
        formPage.selectVarietyLevel("MIXED");
        formPage.submit();

        resultPage.checkResultDisplayed();
        resultPage.returnToMainMenu();
    }
}
