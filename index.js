import React, { useState } from "react";
import ReactDOM from "react-dom";
import MoveNotCompleteComponent from "./frontend/src/components/classify/steps/MoveNotCompleteComponent";

const App = () => {
    const [loading, setLoading] = useState(false);
    const [comprobantes, setComprobantes] = useState([
        { nombre: "comprobante1", completo: false, pdf: new Blob(["Contenido PDF 1"], { type: "application/pdf" }) },
        { nombre: "comprobante2", completo: false, xml: new Blob(["<xml>Contenido XML 2</xml>"], { type: "application/xml" }) },
        { nombre: "comprobante3", completo: true, pdf: new Blob(["Contenido PDF 3"], { type: "application/pdf" }) },
    ]);

    return (
        <MoveNotCompleteComponent
            loading={loading}
            setLoading={setLoading}
            comprobantes={comprobantes}
            setComprobantes={setComprobantes}
        />
    );
};

// Renderizar la aplicación
ReactDOM.render(<App />, document.getElementById("root"));
