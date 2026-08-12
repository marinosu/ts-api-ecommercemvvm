import app from "./app";

/**
 * Para CI/CD Pipeline
 */
const PORT = process.env.PORT || 3050;
const HOST = process.env.HOST || "localhost";

app.listen(Number(PORT), HOST, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});