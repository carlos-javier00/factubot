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
import { DataGrid } from '@mui/x-data-grid';


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
    const columns = [
      { field: 'nombre', headerName: 'Nombre', width: 130 },
      { field: 'fechaEmisionDocSustento', headerName: 'Fecha Emisión Doc Sustento', width: 180 },
      { field: 'numDocModificado', headerName: 'Num Doc Modificado', width: 150 },
      { field: 'tipoIdentificacionComprador', headerName: 'Tipo Identificación Comprador', width: 200 },
      { field: 'razonSocial', headerName: 'Razón Social', width: 150 },
      { field: 'codDoc', headerName: 'Cod Doc', width: 100 },
      { field: 'estab', headerName: 'Estab', width: 100 },
      { field: 'ptoEmi', headerName: 'Pto Emi', width: 100 },
      { field: 'secuencial', headerName: 'Secuencial', width: 120 },
      { field: 'idComprobante', headerName: 'ID Comprobante', width: 150 },
      { field: 'ruc', headerName: 'RUC', width: 130 },
      { field: 'isDocente', headerName: 'Es Docente', width: 100, valueGetter: (params) => JSON.stringify(params?.row?.isDocente) },
      { field: 'fecha', headerName: 'Fecha', width: 130 },
      { field: 'formaPago', headerName: 'Forma Pago', width: 130 },
      { field: 'formaPagoAdmitida', headerName: 'Forma Pago Admitida', width: 180 },
      { field: 'nombre', headerName: 'Nombre', width: 130 },
      { field: 'contribuyenteRimpe', headerName: 'Contribuyente Rimpe', width: 180 },
      { field: 'fechaEmision', headerName: 'Fecha Emisión', width: 150 },
      { field: 'fechaAutorizacion', headerName: 'Fecha Autorización', width: 180 },
      { field: 'importeTotal', headerName: 'Importe Total', width: 150 },
      { field: 'infoAdicional', headerName: 'Info Adicional', width: 180},
      { field: 'tipo', headerName: 'Tipo', width: 100 },
      { field: 'codigoPorcentaje', headerName: 'Código Porcentaje', width: 150 },
      { field: 'codigoAdmitido', headerName: 'Código Admitido', width: 150},
      { field: 'tipoDocumento', headerName: 'Tipo Documento', width: 150 },
      { field: 'numeroAutorizacion', headerName: 'Número Autorización', width: 180 },
      { field: 'ruta', headerName: 'Ruta', width: 130 },
    ];
    const rows = comprobantes.map((comprobante, index) => ({
      id: comprobante.analisis?.numeroAutorizacion || index,
      nombre: comprobante.nombre,
      fechaEmisionDocSustento: comprobante.analisis?.fechaEmisionDocSustento,
      numDocModificado: comprobante.analisis?.numDocModificado,
      tipoIdentificacionComprador: comprobante.analisis?.tipoIdentificacionComprador,
      razonSocial: comprobante.analisis?.razonSocial,
      codDoc: comprobante.analisis?.codDoc,
      estab: comprobante.analisis?.estab,
      ptoEmi: comprobante.analisis?.ptoEmi,
      secuencial: comprobante.analisis?.secuencial,
      idComprobante: comprobante.analisis?.idComprobante,
      ruc: comprobante.analisis?.ruc,
      isDocente: comprobante.analisis?.isDocente,
      fecha: comprobante.analisis?.fecha,
      formaPago: comprobante.analisis?.formaPago,
      formaPagoAdmitida: comprobante.analisis?.formaPagoAdmitida,
      contribuyenteRimpe: comprobante.analisis?.contribuyenteRimpe,
      fechaEmision: comprobante.analisis?.fechaEmision,
      fechaAutorizacion: comprobante.analisis?.fechaAutorizacion,
      importeTotal: comprobante.analisis?.importeTotal,
      infoAdicional: comprobante.analisis?.infoAdicional,
      tipo: comprobante.analisis?.tipo,
      codigoPorcentaje: comprobante.analisis?.codigoPorcentaje,
      codigoAdmitido: comprobante.analisis?.codigoAdmitido,
      tipoDocumento: comprobante.analisis?.tipoDocumento,
      numeroAutorizacion: comprobante.analisis?.numeroAutorizacion,
      ruta: comprobante.analisis?.ruta,
    }));

    const paginationModel = { page: 0, pageSize: 5 };

    return (
      <Paper sx={{ height: 400, width: '100%', marginTop: "20px" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          sx={{ border: 0 }}
        />
      </Paper>
    );
  };
  return (
    <Box>
      <Typography variant="h6">Análisis de comprobantes</Typography>
      <Paper style={{ padding: "20px", marginTop: "20px" }}>
        <Typography variant="body1">
          Proveedores: {comprobantes.filter((comprobante) => comprobante.analisis?.ruta.includes("proveedor")).length}
        </Typography>
        <Typography variant="body1">
          Docentes: {comprobantes.filter((comprobante) => comprobante.analisis?.ruta.includes("docente")).length}
        </Typography>
        <Typography variant="body1">
          Notas de credito: {comprobantes.filter((comprobante) => comprobante.analisis?.ruta.includes("nota")).length}
        </Typography>
      </Paper>
      <Button variant="contained" color="primary" onClick={handleExportExcel} style={{ marginTop: "20px" }}>
        Exportar a Excel
      </Button>
      {renderFlatTable(comprobantes)}
    </Box>
  );
};

export default AnalyzeComponent;
