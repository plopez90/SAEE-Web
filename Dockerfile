# Usa una imagen oficial de Node.js basada en Alpine
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia solo los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install && npm cache clean --force

# Copia el resto de los archivos del proyecto al contenedor
COPY . .

# Expone el puerto de la aplicación
EXPOSE 3000

# Define el comando por defecto para iniciar la aplicación
CMD ["npm", "start"]