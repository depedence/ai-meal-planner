import type { FormEvent } from "react";
import type { MealPlanRequest } from "../api/mealPlan";
import type { PlanEntry } from "../lib/history";
import {
    clampRequest,
    DAYS_MAX,
    DAYS_MIN,
    PEOPLE_MAX,
    PEOPLE_MIN,
} from "../lib/limits";
import { BudgetSlider } from "./BudgetSlider";
import { Button } from "./Button";
import { HistoryCard } from "./HistoryCard";
import { LoadingNote } from "./LoadingNote";
import { Logo } from "./Logo";
import { NumberStepper } from "./NumberStepper";
import { VarietyGroup } from "./VarietyGroup";

interface FormScreenProps {
    params: MealPlanRequest;
    history: PlanEntry[];
    onChange: (params: MealPlanRequest) => void;
    onSubmit: (params: MealPlanRequest) => void;
    onOpenEntry: (id: string) => void;
    loading: boolean;
    error: string | null;
}

export function FormScreen({
    params,
    history,
    onChange,
    onSubmit,
    onOpenEntry,
    loading,
    error,
}: FormScreenProps) {
    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (loading) return;
        // Значение из поля с клавиатуры может быть вне диапазона: приводим его
        // к границам и показываем в форме ровно то, что ушло на сервер.
        const normalized = clampRequest(params);
        onChange(normalized);
        onSubmit(normalized);
    }

    return (
        <main className="animate-screen-in mx-auto grid w-full max-w-[1344px] flex-1 grid-cols-1 gap-8 px-5 pt-6 pb-5 lg:grid-cols-[1fr_620px] lg:items-center lg:gap-16 lg:px-12 lg:py-14">
            <section className="flex flex-col gap-4 lg:gap-6">
                <Logo />
                <p className="text-[11px] font-semibold tracking-[0.18em] text-ink-faint uppercase">
                    Планировщик питания
                </p>
                <h1 className="font-display text-[36px] leading-[1.08] text-ink lg:text-[66px] lg:leading-[1.03] lg:tracking-[-0.01em]">
                    Меню на неделю,
                    <br />
                    которое влезает в бюджет
                </h1>
                <p className="max-w-[62ch] text-[17px] leading-relaxed text-ink-muted text-pretty lg:text-[19px]">
                    Укажите бюджет, срок и кол-во человек — AI соберёт план
                    питания по дням с блюдами, ингредиентами и примерными
                    ценами.
                </p>

                {history.length > 0 && (
                    <section className="flex flex-col gap-2 pt-2">
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-ink-faint uppercase">
                            Составленные планы
                        </p>
                        <ul className="flex flex-col gap-1.5">
                            {history
                                .map((entry, index) => ({
                                    entry,
                                    number: index + 1,
                                }))
                                .reverse()
                                .map(({ entry, number }, index) => (
                                    <li
                                        key={entry.id}
                                        className="animate-screen-in"
                                        style={{
                                            animationDelay: `${Math.min(index, 6) * 40}ms`,
                                        }}
                                    >
                                        <HistoryCard
                                            entry={entry}
                                            number={number}
                                            onOpen={() => onOpenEntry(entry.id)}
                                        />
                                    </li>
                                ))}
                        </ul>
                    </section>
                )}
            </section>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6.5 rounded-3xl border border-line bg-surface p-6 shadow-card lg:p-9"
            >
                <BudgetSlider
                    value={params.budget}
                    disabled={loading}
                    onChange={(budget) => onChange({ ...params, budget })}
                />

                <div className="flex gap-4">
                    <NumberStepper
                        id="days"
                        label="Дней"
                        value={params.days}
                        min={DAYS_MIN}
                        max={DAYS_MAX}
                        disabled={loading}
                        onChange={(days) => onChange({ ...params, days })}
                    />
                    <NumberStepper
                        id="people"
                        label="Человек"
                        value={params.peopleCount}
                        min={PEOPLE_MIN}
                        max={PEOPLE_MAX}
                        disabled={loading}
                        onChange={(peopleCount) =>
                            onChange({ ...params, peopleCount })
                        }
                    />
                </div>

                <VarietyGroup
                    value={params.varietyLevel}
                    disabled={loading}
                    onChange={(varietyLevel) =>
                        onChange({ ...params, varietyLevel })
                    }
                />

                {error && (
                    <p
                        role="alert"
                        className="animate-screen-in rounded-xl border border-danger-line bg-[#f7e0db] px-4 py-3 text-sm text-danger"
                    >
                        {error}
                    </p>
                )}

                {loading && <LoadingNote />}

                <div className="mt-auto flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                    <Button
                        type="submit"
                        loading={loading}
                        loadingLabel="Собираю план…"
                        className="min-w-[228px] max-sm:h-14 max-sm:w-full"
                    >
                        Составить план
                    </Button>
                    {!loading && (
                        <p className="text-xs text-ink-soft">
                            Цены ориентировочные. Проверьте самостоятельно.
                        </p>
                    )}
                </div>
            </form>
        </main>
    );
}
