# Usar una imagen base de Node.js
FROM node:20

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos necesarios
COPY package*.json ./

# Eliminar node_modules y package-lock.json si existen
RUN rm -rf node_modules package-lock.json

# Instalar las dependencias
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación se ejecutará
EXPOSE 5173

# Comando para ejecutar la aplicación en modo de desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]