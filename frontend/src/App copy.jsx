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

function App() {
  const [files, setFiles] = useState([]);
  const [validPairs, setValidPairs] = useState([]);
  const [data, setData] = useState([]);
  const [missingFiles, setMissingFiles] = useState([]);
  const [error, setError] = useState(null);
  const [processableCount, setProcessableCount] = useState(0);
  const [nonProcessableCount, setNonProcessableCount] = useState(0);

  const validateFiles = (files) => {
    const fileMap = new Map();

    files.forEach(file => {
      const [name, extension] = file.name.split('.');
      if (!fileMap.has(name)) {
        fileMap.set(name, { xml: false, pdf: false });
      }
      if (extension === 'xml') {
        fileMap.get(name).xml = true;
      } else if (extension === 'pdf') {
        fileMap.get(name).pdf = true;
      }
    });

    const validPairs = [];
    const invalidFiles = [];

    fileMap.forEach((value, key) => {
      if (value.xml && value.pdf) {
        validPairs.push(key);
      } else {
        invalidFiles.push(key);
      }
    });

    return { validPairs, invalidFiles };
  };

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

    const { validPairs, invalidFiles } = validateFiles(validFiles);
    const comprobantes = [];

    for (const file of validFiles) {
      const nombre = file.name.split(".")[0];
      const extension = file.name.split(".")[1];
      const comprobante = comprobantes.find((comprobante) => comprobante.nombre === nombre);  
      if (comprobante) {
        comprobante[extension] = file;
      } else {
        comprobantes.push({
          nombre,
          [extension]: file,
        });
      }
    }

    console.log(comprobantes);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!files.length) {
      setError("Por favor, selecciona una carpeta con archivos.");
      return;
    }

    const processedData = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/analizarComprobante/",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Error al procesar el archivo: ${file.name}`);
        }

        const jsonData = await response.json();
        processedData.push(flattenJSON(jsonData));
      } catch (err) {
        setError(`Error con el archivo ${file.name}: ${err.message}`);
      }
    }
    setData((prevData) => [...prevData, ...processedData]); // Acumular datos de todos los archivos
    setError(null);
  };

  const flattenJSON = (obj, parentKey = "", result = {}) => {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        flattenJSON(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
    return result;
  };

  const handleExportExcel = () => {
    if (!data.length) {
      setError("No hay datos para exportar.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "data.xlsx");
  };

  /*const handleDownloadNonProcessable = () => {
    if (!missingFiles.length) {
      setError("No hay archivos no procesables para descargar.");
      return;
    }

    const zip = new JSZip();
    missingFiles.forEach(file => {
      zip.file(file.name, file);
    });

    zip.generateAsync({ type: "blob" }).then(content => {
      saveAs(content, "non-processable-files.zip");
    });
  };*/ 

  /*const renderFileValidation = () => {
    const totalFiles = files.length;
    const totalValid = validPairs.length;
    const totalInvalid = missingFiles.length; // Archivos no procesables (sin par)

    return (
      <div style={{ marginBottom: "20px" }}>
        <Typography variant="h6" gutterBottom>
          Resumen:
        </Typography>
        <Typography variant="body1">
          Archivos procesables: <strong>{totalValid}</strong>
        </Typography>
        <Typography variant="body1">
          Archivos no procesables: <strong>{totalInvalid}</strong>
        </Typography>
      </div>
    );
  };*/

  const renderFileValidation = () => {
    return (
      <div style={{ marginBottom: "20px" }}>
        <Typography variant="h6" gutterBottom>
          Resumen:
        </Typography>
        <Typography variant="body1">
          Archivos procesables: <strong>{processableCount}</strong>
        </Typography>
        <Typography variant="body1">
          Archivos no procesables: <strong>{nonProcessableCount}</strong>
        </Typography>
        {nonProcessableCount === 0 && (
          <Typography variant="body1">
            No hay archivos no procesables.
          </Typography>
        )}
      </div>
    );
  };

  const renderFlatTable = (data) => {
    if (!data || !data.length) return null;

    return (
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>fechaEmisionDocSustento</TableCell>
              <TableCell>numDocModificado</TableCell>
              <TableCell>tipoIdentificacionComprador</TableCell>
              <TableCell>razonSocial</TableCell>
              <TableCell>codDoc</TableCell>
              <TableCell>estab</TableCell>
              <TableCell>ptoEmi</TableCell>
              <TableCell>secuencial</TableCell>
              <TableCell>idComprobante</TableCell>
              <TableCell>ruc</TableCell>
              <TableCell>isDocente</TableCell>
              <TableCell>fecha</TableCell>
              <TableCell>formaPago</TableCell>
              <TableCell>formaPagoAdmitida</TableCell>
              <TableCell>nombre</TableCell>
              <TableCell>contribuyenteRimpe</TableCell>
              <TableCell>fechaEmision</TableCell>
              <TableCell>fechaAutorizacion</TableCell>
              <TableCell>valor</TableCell>
              <TableCell>infoAdicional</TableCell>
              <TableCell>tipo</TableCell>
              <TableCell>codigoPorcentaje</TableCell>
              <TableCell>codigoAdmitido</TableCell>
              <TableCell>tipoDocumento</TableCell>
              <TableCell>numeroAutorizacion</TableCell>
              <TableCell>xml_path</TableCell>
              <TableCell>pdf_path</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.fechaEmisionDocSustento}</TableCell>
                <TableCell>{row.numDocModificado}</TableCell>
                <TableCell>{row.tipoIdentificacionComprador}</TableCell>
                <TableCell>{row.razonSocial}</TableCell>
                <TableCell>{row.codDoc}</TableCell>
                <TableCell>{row.estab}</TableCell>
                <TableCell>{row.ptoEmi}</TableCell>
                <TableCell>{row.secuencial}</TableCell>
                <TableCell>{row.idComprobante}</TableCell>
                <TableCell>{row.ruc}</TableCell>
                <TableCell>{row.isDocente ? "Sí" : "No"}</TableCell>
                <TableCell>{row.fecha}</TableCell>
                <TableCell>{row.formaPago}</TableCell>
                <TableCell>{row.formaPagoAdmitida}</TableCell>
                <TableCell>{row.nombre}</TableCell>
                <TableCell>{row.contribuyenteRimpe}</TableCell>
                <TableCell>{row.fechaEmision}</TableCell>
                <TableCell>{row.fechaAutorizacion}</TableCell>
                <TableCell>{row.valor}</TableCell>
                <TableCell>{JSON.stringify(row.infoAdicional)}</TableCell>
                <TableCell>{row.tipo}</TableCell>
                <TableCell>{row.codigoPorcentaje}</TableCell>
                <TableCell>{row.codigoAdmitido}</TableCell>
                <TableCell>{row.tipoDocumento}</TableCell>
                <TableCell>{row.numeroAutorizacion}</TableCell>
                <TableCell>{row.xml_path}</TableCell>
                <TableCell>{row.pdf_path}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Convertir XML a JSON
      </Typography>
      <form onSubmit={handleSubmit}>
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginLeft: "10px" }}
        >
          Subir y Procesar
        </Button>
      </form>
      {error && <Alert severity="error" style={{ marginTop: "20px" }}>{error}</Alert>}
      {renderFileValidation()}
      {renderFileList(files)}
    </Container>
  );
}

export default App;