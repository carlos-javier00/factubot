import React, { useState } from "react";
import {
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
} from "@mui/material";
import * as XLSX from "xlsx";


export default function SelectOriginFolderComponent({
    loading,
    setLoading,
    comprobantes,
    setComprobantes,
}) {

    const [error, setError] = useState(null);

    const handleFolderChange = (event) => {
        const selectedFiles = Array.from(event.target.files);

        if (!selectedFiles.length) {
            setError("No se seleccionaron archivos.");
            return;
        }

        // Filtra solo los archivos XML y PDF
        const validFiles = selectedFiles.filter((file) =>
            file.name.endsWith(".xml") || file.name.endsWith(".pdf")
        );

        const _comprobantes = [];

        for (const file of validFiles) {
            const nombre = file.name.split(".")[0];
            const extension = file.name.split(".")[1];
            const comprobante = _comprobantes.find((comprobante) => comprobante.nombre === nombre);
            if (comprobante) {
                comprobante[extension] = file;
            } else {
                _comprobantes.push({
                    nombre,
                    [extension]: file,
                });
            }
        }

        setComprobantes(_comprobantes.map((comprobante) => {
            comprobante.completo = comprobante.pdf && comprobante.xml ? true : false;
            return comprobante;
        }));
        
    };

    return <>
        <input
            accept=".xml,.pdf"
            style={{ display: "none" }}
            id="folder-input"
            type="file"
            webkitdirectory="true"
            onChange={handleFolderChange}
        />
        <label htmlFor="folder-input">
            <Button variant="contained" component="span">
                Seleccionar Carpeta
            </Button>
        </label>
    </>;

};