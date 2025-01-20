import React, { useState } from "react";
import { Container, Typography, Button, Alert } from "@mui/material";

export default function MoveNotCompleteComponent({
    loading,
    setLoading,
    comprobantes,
    setComprobantes,
}) {
    const [error, setError] = useState(null);
    const [savedPaths, setSavedPaths] = useState([]);

    const handleMoveNotComplete = async () => {
        try {
            // Verifica si el navegador soporta la API
            if (!window.showDirectoryPicker) {
                setError("El navegador no soporta la selección de carpetas.");
                return;
            }

            // Solicitar la carpeta destino
            const directoryHandle = await window.showDirectoryPicker();
            const folderName = directoryHandle.name; // Nombre de la carpeta seleccionada
            const paths = [];

            setLoading({
                loading: true,
                title: "Moviendo comprobantes no procesables",
                progress: 0,
                total: comprobantes.filter(comprobante => !comprobante.completo).length,
            });

            // Filtrar comprobantes no completos
            const notCompleteComprobantes = comprobantes.filter(comprobante => !comprobante.completo);

            for (const comprobante of notCompleteComprobantes) {
                try {
                    let fileHandle;

                    if (comprobante.pdf) {
                        fileHandle = await directoryHandle.getFileHandle(`${comprobante.nombre}.pdf`, { create: true });
                        const writable = await fileHandle.createWritable();
                        await writable.write(comprobante.pdf); // Asegúrate de que comprobante.pdf sea un Blob
                        await writable.close();
                    } else if (comprobante.xml) {
                        fileHandle = await directoryHandle.getFileHandle(`${comprobante.nombre}.xml`, { create: true });
                        const writable = await fileHandle.createWritable();
                        await writable.write(comprobante.xml); // Asegúrate de que comprobante.xml sea un Blob
                        await writable.close();
                    }
                    setLoading({
                        loading: true,
                        title: "Moviendo comprobantes no procesables",
                        progress: paths.length + 1,
                        total: comprobantes.filter(comprobante => !comprobante.completo).length,
                    });

                    // Registrar la "ruta lógica"
                    paths.push(`${folderName}/${fileHandle.name}`);
                } catch (fileError) {
                    console.error(`Error al guardar ${comprobante.nombre}: ${fileError.message}`);
                }
            }

            // Actualizar lista de comprobantes y rutas guardadas
            setComprobantes(comprobantes.filter(comprobante => comprobante.completo));
            setSavedPaths(paths);
            console.log("Archivos guardados en:");
            console.table(paths);
            setError(null);
        } catch (err) {
            setError(`Error al mover los comprobantes: ${err.message}`);
        } finally {
            setLoading({
                loading: false,
                title: "",
                progress: 0,
                total: 0,
            });
        }
    };

    return (
        <Container>
            <Typography variant="h6">
                Hay {comprobantes.filter(comprobante => !comprobante.completo).length} comprobantes incompletos. Mueva a otra ubicación.
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <Button onClick={handleMoveNotComplete} disabled={loading}>
                {loading ? "Moviendo..." : "Seleccionar carpeta de destino"}
            </Button>

            <Typography variant="body1" style={{ marginTop: "20px" }}>
                <strong>Archivos guardados:</strong>
                <ul>
                    {savedPaths.map((path, index) => (
                        <li key={index}>{path}</li>
                    ))}
                </ul>
            </Typography>
        </Container>
    );
}
