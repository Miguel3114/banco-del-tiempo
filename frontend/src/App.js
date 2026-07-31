import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [mensaje, setMensaje] = useState("Comprobando conexión...");

  useEffect(() => {
    fetch("/api/test")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        return response.text();
      })
      .then((data) => setMensaje(data))
      .catch((error) => {
        console.error("Error al conectar con el back-end:", error);
        setMensaje("No se ha podido conectar con el back-end");
      });
  }, []);

  return (
    <main className="container py-5">
      <h1>Banco del Tiempo</h1>
      <div className="alert alert-primary mt-4">
        {mensaje}
      </div>
    </main>
  );
}

export default App;