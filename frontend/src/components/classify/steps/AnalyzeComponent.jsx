import React, { useEffect } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import * as XLSX from "xlsx";
import Button from "@mui/material/Button";

// variale de entorno para la URL del worker
const ANALYZER_WORKER_URL = import.meta.env.VITE_ANALYZER_WORKER_URL;
// quiero pasarlo a Int
const MAX_ITEMS_PER_REQUEST = parseInt(
  import.meta.env.VITE_ANALYZER_BATCH_SIZE,
  10
);

const AnalyzeComponent = ({
  loading,
  setLoading,
  comprobantes,
  setComprobantes,
}) => {
  const analyzeWithWorker = async (comprobantes) => {
    setLoading({
      loading: true,
      title: "Analizando comprobantes",
      infinite: true,
    });

    try {
      let allAnalyzedData = [];
      let localProgress = 0;

      // Dividir los comprobantes en grupos de máximo 50 elementos
      for (let i = 0; i < comprobantes.length; i += MAX_ITEMS_PER_REQUEST) {
        const batch = comprobantes.slice(i, i + MAX_ITEMS_PER_REQUEST);

        let data = new FormData();
        batch.forEach((comprobante) => {
          if (comprobante.xml) {
            data.append(
              "files",
              new Blob([comprobante.xml], { type: "application/xml" }),
              `${comprobante.nombre}.xml`
            );
          }
        });

        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${ANALYZER_WORKER_URL}/analizarComprobantes/`,
          headers: {
            accept: "application/json",
          },
          data: data,
        };

        const response = await axios.request(config);
        allAnalyzedData = allAnalyzedData.concat(response.data);
        localProgress += batch.length;
      }

      const _comprobantes = comprobantes.map((comprobante) => {
        const analysisResult = allAnalyzedData.find(
          (result) => result.filename === `${comprobante.nombre}.xml`
        );
        return {
          ...comprobante,
          analisis: analysisResult ? analysisResult.analisis : null,
          analizable: analysisResult ? true : false,
        };
      });

      setComprobantes(_comprobantes);
    } catch (error) {
      console.error("Error al analizar los comprobantes:", error);
    }

    setLoading({
      loading: false,
      title: "",
      progress: 0,
      total: 0,
    });
  };

  const handleAnalyze = async () => {
    await analyzeWithWorker(comprobantes);
  };

  useEffect(() => {
    handleAnalyze();
  }, []);

  const handleExportExcel = () => {
    if (!comprobantes.length) {
      console.error("No hay comprobantes para exportar.");
      return;
    }

    const data = comprobantes
      .filter((comprobante) => comprobante.analisis)
      .map((comprobante) => {
        return {
          ...comprobante.analisis,
          infoAdicional: JSON.stringify(comprobante.analisis.infoAdicional),
        };
      });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Análisis");
    XLSX.writeFile(wb, "analisis_comprobantes.xlsx");
  };

  const renderFlatTable = (comprobantes) => {
    if (!comprobantes || !comprobantes.length) return null;

    return (
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>comprobante.nombre</TableCell>
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
              <TableCell>importeTotal</TableCell>
              <TableCell>infoAdicional</TableCell>
              <TableCell>tipo</TableCell>
              <TableCell>codigoPorcentaje</TableCell>
              <TableCell>codigoAdmitido</TableCell>
              <TableCell>tipoDocumento</TableCell>
              <TableCell>numeroAutorizacion</TableCell>
              <TableCell>ruta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comprobantes.map((comprobante, index) => (
              <TableRow key={index} style={comprobante.analisis?.error ? { backgroundColor: "red" } : {}}>
                <TableCell>{comprobante.nombre}</TableCell>
                <TableCell>
                  {comprobante.analisis?.fechaEmisionDocSustento}
                </TableCell>
                <TableCell>{comprobante.analisis?.numDocModificado}</TableCell>
                <TableCell>
                  {comprobante.analisis?.tipoIdentificacionComprador}
                </TableCell>
                <TableCell>{comprobante.analisis?.razonSocial}</TableCell>
                <TableCell>{comprobante.analisis?.codDoc}</TableCell>
                <TableCell>{comprobante.analisis?.estab}</TableCell>
                <TableCell>{comprobante.analisis?.ptoEmi}</TableCell>
                <TableCell>{comprobante.analisis?.secuencial}</TableCell>
                <TableCell>{comprobante.analisis?.idComprobante}</TableCell>
                <TableCell>{comprobante.analisis?.ruc}</TableCell>
                <TableCell>
                  {comprobante.analisis?.isDocente ? "Sí" : "No"}
                </TableCell>
                <TableCell>{comprobante.analisis?.fecha}</TableCell>
                <TableCell>{comprobante.analisis?.formaPago}</TableCell>
                <TableCell>
                  {JSON.stringify(comprobante.analisis?.formaPagoAdmitida)}
                </TableCell>
                <TableCell>{comprobante.analisis?.nombre}</TableCell>
                <TableCell>
                  {comprobante.analisis?.contribuyenteRimpe}
                </TableCell>
                <TableCell>{comprobante.analisis?.fechaEmision}</TableCell>
                <TableCell>{comprobante.analisis?.fechaAutorizacion}</TableCell>
                <TableCell>{comprobante.analisis?.importeTotal}</TableCell>
                <TableCell>
                  {JSON.stringify(comprobante.analisis?.infoAdicional)}
                </TableCell>
                <TableCell>{comprobante.analisis?.tipo}</TableCell>
                <TableCell>{comprobante.analisis?.codigoPorcentaje}</TableCell>
                <TableCell>{comprobante.analisis?.codigoAdmitido}</TableCell>
                <TableCell>{comprobante.analisis?.tipoDocumento}</TableCell>
                <TableCell>
                  {comprobante.analisis?.numeroAutorizacion}
                </TableCell>
                <TableCell>{comprobante.analisis?.ruta}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  return (
    <Box>
      <Typography variant="h6">{MAX_ITEMS_PER_REQUEST}</Typography>
      <Typography variant="h6">Análisis de comprobantes</Typography>
      <Button variant="contained" color="primary" onClick={handleExportExcel}>
        Exportar a Excel
      </Button>
      {renderFlatTable(comprobantes)}
    </Box>
  );
};

export default AnalyzeComponent;
