import pandas as pd

def obtener_lista_rucs(ruta_excel):
    # Leer el archivo Excel
    df = pd.read_excel(ruta_excel, dtype={'ruc': str})
    
    # Obtener la columna 'ruc'
    lista_rucs = df['ruc'].tolist()
    
    return lista_rucs

 