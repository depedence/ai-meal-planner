package ru.depedence.aimealplanner.exception;

public class InvalidPlanResponseException extends RuntimeException {

    public InvalidPlanResponseException(String message, Throwable cause) {
        super(message, cause);
    }
}
