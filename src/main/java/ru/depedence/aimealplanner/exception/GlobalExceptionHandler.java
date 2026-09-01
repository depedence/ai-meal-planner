package ru.depedence.aimealplanner.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidation(
        MethodArgumentNotValidException ex
    ) {
        return ResponseEntity.badRequest().body(
            "Check the parameters: budget 500–15,000 ₽, up to 7 days and up to 5 people."
        );
    }

    @ExceptionHandler(GroqApiException.class)
    public ResponseEntity<String> handleGroqApiException(GroqApiException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(
            "Unable to get a response from the AI-service. Please try again."
        );
    }

    @ExceptionHandler(InvalidPlanResponseException.class)
    public ResponseEntity<String> handleInvalidPlanResponse(
        InvalidPlanResponseException ex
    ) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(
            "The AI returned an invalid response. Please try changing the parameters or repeating your request."
        );
    }
}
