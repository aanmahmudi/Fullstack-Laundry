package com.laundry.BE_Laundry.Controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String root() {
        return "<!doctype html>" +
                "<html lang='id'><head><meta charset='utf-8'/>" +
                "<title>Laundry API</title>" +
                "<style>body{font-family:system-ui;background:#0f172a;color:#e5e7eb;padding:24px}a{color:#22c55e;text-decoration:none}</style>" +
                "</head><body>" +
                "<h1>Laundry API</h1>" +
                "<p>Service berjalan. Coba endpoint berikut:</p>" +
                "<ul>" +
                "<li><a href='/api/products'>/api/products</a></li>" +
                "<li><a href='/api/transactions'>/api/transactions</a></li>" +
                "<li><a href='/api/customers'>/api/customers</a></li>" +
                "</ul>" +
                "<p>Health check: <a href='/health'>/health</a></p>" +
                "</body></html>";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}