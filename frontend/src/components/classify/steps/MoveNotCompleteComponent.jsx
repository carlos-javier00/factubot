import React, { useState } from "react";
import {
    Container,
    Typography,
    Button,
    Alert,
} from "@mui/material";

export default function MoveNotCompleteComponent({   
    loading,
    setLoading,
    comprobantes,
    setComprobantes,
}) {
    const [error, setError] = useState(null);

    const handleMoveNotComplete = async () => {
        try {
            // Solicitar al usuario que seleccione una carpeta
            const directoryHandle = await window.showDirectoryPicker();

            setLoading(true);

            // Filtra solo los comprobantes no completos
            const notCompleteComprobantes = comprobantes.filter(comprobante => !comprobante.completo);

            // Mover comprobantes no completos a la carpeta seleccionada
            for (const comprobante of notCompleteComprobantes) {
                if (comprobante.pdf) {
                    // Crear y escribir el archivo PDF
                    const pdfHandle = await directoryHandle.getFileHandle(`${comprobante.nombre}.pdf`, { create: true });
                    const pdfWritable = await pdfHandle.createWritable();
                    await pdfWritable.write(comprobante.pdf);
                    await pdfWritable.close();
                } else if (comprobante.xml) {
                    // Crear y escribir el archivo XML
                    const xmlHandle = await directoryHandle.getFileHandle(`${comprobante.nombre}.xml`, { create: true });
                    const xmlWritable = await xmlHandle.createWritable();
                    await xmlWritable.write(comprobante.xml);
                    await xmlWritable.close();
                }
            }

            setLoading(false);
        } catch (err) {
            setError("Error al mover los comprobantes: " + err.message);
            setLoading(false);
        }

        // Eliminar los comprobantes no completos
        try {
            const _comprobantesIncompletos = comprobantes.filter(comprobante => comprobante.completo);
            setComprobantes(_comprobantesIncompletos);
        } catch (err) {
            setError("Error al eliminar los comprobantes no completos: " + err.message);
        }
    };

    return (
        <Container>
            <Typography variant="h6"> Hay {comprobantes.filter(comprobante => !comprobante.completo).length} comprobantes incompletos, muevelos a otra ubicacion. </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <Button onClick={handleMoveNotComplete} disabled={loading}>
                {loading ? "Moviendo..." : "Seleccionar carpeta de destino."}
            </Button> 


        </Container>
    );
}