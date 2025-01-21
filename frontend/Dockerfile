#Usa una imagen base de Node.js
FROM node:20

#Establece el directorio de trabajo
WORKDIR /app

#Copia los archivos necesarios
COPY . .

#Instala las dependencias
RUN npm install

#Expone el puerto en el que la aplicación se ejecutará
EXPOSE 5173

#Comando para ejecutar la aplicación en modo de desarrollo
CMD ["npm", "run", "dev", "--","--host","0.0.0.0"]