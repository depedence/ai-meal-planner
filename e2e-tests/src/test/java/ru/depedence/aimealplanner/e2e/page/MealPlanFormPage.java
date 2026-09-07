package ru.depedence.aimealplanner.e2e.page;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import io.qameta.allure.Step;
import org.openqa.selenium.Keys;

public class MealPlanFormPage {

    @Step("Open meal plan form")
    public void open() {
        Selenide.open("/");
    }

    @Step("Set budget: {budget}")
    public void setBudget(String budget) {
        $("[data-testid='budget-value']").click();
        $("[data-testid='budget-input']")
            .shouldBe(Condition.visible)
            .sendKeys(Keys.chord(Keys.CONTROL, "a"), budget, Keys.ENTER);
    }

    @Step("Set days: {days}")
    public void setDays(String days) {
        $("[data-testid='stepper-days-input']")
            .shouldBe(Condition.editable)
            .sendKeys(Keys.chord(Keys.CONTROL, "a"), days);
    }

    @Step("Set people count: {peopleCount}")
    public void setPeopleCount(String peopleCount) {
        $("[data-testid='stepper-people-input']")
            .shouldBe(Condition.editable)
            .sendKeys(Keys.chord(Keys.CONTROL, "a"), peopleCount);
    }

    @Step("Select variety level: {varietyLevel}")
    public void selectVarietyLevel(String varietyLevel) {
        $(
            "[data-testid='variety-option-" + varietyLevel.toLowerCase() + "']"
        ).click();
    }

    @Step("Submit form")
    public void submit() {
        $("[data-testid='submit-plan']").click();
    }
}
