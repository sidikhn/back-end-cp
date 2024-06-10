# Gunakan image Node.js versi 14 sebagai base image
FROM node:18

# Tentukan direktori kerja di dalam kontainer
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json untuk menginstal dependensi
COPY package*.json ./

# Instal dependensi menggunakan npm
RUN npm install

# Salin seluruh kode sumber proyek
COPY . .

# Port yang akan diexpose oleh aplikasi
EXPOSE 3000

# Perintah yang akan dijalankan saat kontainer dijalankan
CMD ["npm", "run", "start"]

# CMD ["node", "server.js"] 
