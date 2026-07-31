package es.tfg.bancodeltiempo.test;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestRestController {

    @GetMapping
    public String comprobarBackend() {
        return "El back-end del Banco del Tiempo funciona correctamente";
    }
}