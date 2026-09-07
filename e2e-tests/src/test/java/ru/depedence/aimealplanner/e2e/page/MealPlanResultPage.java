package ru.depedence.aimealplanner.e2e.page;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;

public class MealPlanResultPage {

    private final SelenideElement shoppingListBlock = $(
        "[data-testid='shopping-list']"
    );

    @Step("Check result screen is displayed")
    public void checkResultDisplayed() {
        $("[data-testid='regenerate-plan']").should(Condition.visible);
    }

    @Step("Check day count: {expectedDays}")
    public void checkDayCount(int expectedDays) {
        $$("[data-testid='day-card']").shouldHave(
            CollectionCondition.size(expectedDays)
        );
    }

    @Step("Switch to shopping list")
    public void switchToShoppingList() {
        $("[data-testid='plan-view-tab-shopping']").click();
        shoppingListBlock.shouldBe(Condition.visible);
        shoppingListBlock.shouldHave(Condition.text("Список покупок"));
    }

    @Step("Return to main menu")
    public void returnToMainMenu() {
        $("[data-testid='back-to-form']").click();
        $("[data-testid='submit-plan']").shouldBe(Condition.visible);
    }
}
