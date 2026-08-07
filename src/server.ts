import app from "./app";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

app.listen(Number(PORT), HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});