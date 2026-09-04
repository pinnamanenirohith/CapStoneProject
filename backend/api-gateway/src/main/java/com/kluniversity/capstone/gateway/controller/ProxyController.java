package com.kluniversity.capstone.gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Reverse proxy — forwards authenticated requests to downstream microservices.
 * In production this would be Spring Cloud Gateway, but this servlet-based
 * proxy works for the capstone demo.
 */
@RestController
public class ProxyController {

    private final WebClient inferenceClient;
    private final WebClient registryClient;

    public ProxyController(
            @Value("${app.services.inference-url}") String inferenceUrl,
            @Value("${app.services.registry-url}")  String registryUrl) {
        this.inferenceClient = WebClient.builder().baseUrl(inferenceUrl).build();
        this.registryClient  = WebClient.builder().baseUrl(registryUrl).build();
    }

    // ── Model Registry proxy ─────────────────────────────────────────────────

    @GetMapping("/api/v1/models")
    public Mono<ResponseEntity<String>> listModels(@RequestHeader HttpHeaders headers) {
        return forward(registryClient, HttpMethod.GET, "/api/v1/models", null, headers);
    }

    @GetMapping("/api/v1/models/{id}")
    public Mono<ResponseEntity<String>> getModel(@PathVariable int id, @RequestHeader HttpHeaders headers) {
        return forward(registryClient, HttpMethod.GET, "/api/v1/models/" + id, null, headers);
    }

    @PostMapping("/api/v1/models")
    public Mono<ResponseEntity<String>> createModel(@RequestBody String body, @RequestHeader HttpHeaders headers) {
        return forward(registryClient, HttpMethod.POST, "/api/v1/models", body, headers);
    }

    @PatchMapping("/api/v1/models/{id}")
    public Mono<ResponseEntity<String>> updateModel(@PathVariable int id, @RequestBody String body, @RequestHeader HttpHeaders headers) {
        return forward(registryClient, HttpMethod.PATCH, "/api/v1/models/" + id, body, headers);
    }

    @DeleteMapping("/api/v1/models/{id}")
    public Mono<ResponseEntity<String>> deleteModel(@PathVariable int id, @RequestHeader HttpHeaders headers) {
        return forward(registryClient, HttpMethod.DELETE, "/api/v1/models/" + id, null, headers);
    }

    // ── Inference proxy ───────────────────────────────────────────────────────

    @GetMapping("/api/v1/inference/models")
    public Mono<ResponseEntity<String>> inferenceModels(@RequestHeader HttpHeaders headers) {
        return forward(inferenceClient, HttpMethod.GET, "/api/v1/inference/models", null, headers);
    }

    @PostMapping("/api/v1/inference/{modelName}")
    public Mono<ResponseEntity<String>> predict(@PathVariable String modelName, @RequestBody String body,
                                                 @RequestHeader HttpHeaders headers) {
        return forward(inferenceClient, HttpMethod.POST, "/api/v1/inference/" + modelName, body, headers);
    }

    // ── Health ────────────────────────────────────────────────────────────────

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "ok", "service", "api-gateway", "version", "1.0.0");
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Mono<ResponseEntity<String>> forward(WebClient client, HttpMethod method,
                                                  String path, String body, HttpHeaders inHeaders) {
        var spec = client.method(method).uri(path)
                .header("Content-Type", "application/json")
                .header("Authorization", inHeaders.getFirst("Authorization") != null
                        ? inHeaders.getFirst("Authorization") : "");
        if (body != null) spec = spec.bodyValue(body);

        return spec.retrieve()
                .toEntity(String.class)
                .onErrorResume(e -> Mono.just(ResponseEntity
                        .status(HttpStatus.BAD_GATEWAY)
                        .body("{\"error\": \"Upstream service unavailable: " + e.getMessage() + "\"}")));
    }
}
