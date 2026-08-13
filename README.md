## Uso de IA en este Proyecto

Durante el desarrollo de la suite de pruebas QA se utilizaron herramientas de Inteligencia Artificial como apoyo para el diseño, implementación, revisión y documentación de las pruebas. Las sugerencias generadas por IA fueron revisadas, adaptadas y validadas manualmente antes de incorporarlas al proyecto.

| Herramienta IA | Tarea | Prompt utilizado | Resultado | Correcciones aplicadas |
|---|---|---|---|---|
| ChatGPT | Diseño de estrategia de pruebas | "Actúa como QA Engineer especializado en Node.js, TypeScript, Jest y Playwright. Ayúdame a diseñar una suite de pruebas unitarias y E2E para una API REST." | Propuso estructura de pruebas, casos unitarios, E2E, BDD y organización del proyecto. | Se adaptaron los casos a los endpoints, servicios y arquitectura real del proyecto. |
| ChatGPT | Implementación de pruebas API y CI/CD | "Ayúdame a implementar pruebas E2E de una API REST con Playwright y configurar un pipeline de GitHub Actions con Jest, Playwright, MySQL y Allure." | Generó propuestas para `AuthApi`, `UsersApi`, Playwright, BDD y GitHub Actions. | Se corrigieron rutas, variables de entorno, configuración de base de datos, seed de Prisma y ejecución en CI. |
| Gemini | Revisión y mejora de pruebas | "Revisa esta suite de pruebas TypeScript y determina qué casos deberían cubrirse para cumplir los requisitos de QA." | Identificó casos positivos, negativos, validaciones y escenarios adicionales. | Se seleccionaron únicamente los casos relevantes y se ajustaron a los endpoints reales de la API. |
| Gemini | Apoyo en documentación técnica | "Genera una descripción breve y profesional de la arquitectura de pruebas y del pipeline CI/CD." | Propuso descripciones para documentar la solución. | Se simplificó y adaptó la documentación a las herramientas realmente utilizadas. |

### Validación del contenido generado por IA

La Inteligencia Artificial fue utilizada como herramienta de apoyo y no como sustituto de la validación del equipo. Todo código, escenario de prueba y configuración sugerida fue revisado, ejecutado y corregido manualmente para garantizar su compatibilidad con el proyecto.

### Comandos utilizados para pruebas y reportes

Ejecuta todos los tests unitarios con Jest.

```bash
npm test -- --coverage --runInBand
```

Ejecuta los tests unitarios y genera el reporte de cobertura.

```bash
npm test -- --coverage --runInBand
```

###### Tests E2E con Playwright

Instala Chromium y sus dependencias para Playwright.

```bash
npx playwright install --with-deps chromium
```

Ejecuta los tests E2E de la API.

```bash
npx playwright test
```

###### Tests BDD

Ejecuta los escenarios BDD escritos con Cucumber/Gherkin.

```bash
npm run bdd
```

###### Reporte Allure

Genera el reporte HTML de Allure a partir de los resultados de las pruebas.

```bash
npx allure generate reports/allure-results --clean -o reports/allure-report
```

###### Reporte de Playwright

Abre el reporte HTML generado por Playwright.

```bash
npx playwright show-report reports/playwright
```

###### Build de la aplicación

Compila la aplicación TypeScript antes de ejecutar las pruebas E2E en CI/CD.

```bash
npm run build
```