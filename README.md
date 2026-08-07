## Comando para crear el proyecto

Crea el archivo package.json.
```bash
npm init -y
```
Instalar dependencias del proyecto.
```bash
npm i express cors dotenv bcryptjs zod jsonwebtoken multer @prisma/client @prisma/adapter-mariadb
```
Instalar dependencias de desarrollo del proyecto.
```bash
npm i --save-dev typescript tsx ts-node-dev prisma @types/jsonwebtoken @types/express @types/node @types/cors @types/bcryptjs @types/multer
```
Crea archivo de configuración de typescript 'tsconfig.json'.
```bash
npx tsc --init
```
Crea carpeta 'prisma/schema.prisma' y 'prisma.config.ts', los parámetros son opcionales.
Se utiliza también 'npx prisma init --datasource-provider basededatos --output ../generated/prisma'.
```bash
npx prisma init --datasource-provider mysql
```
Este comando crea las tablas de base de datos según su esquema, antes se debe crear los modelos.
Se utiliza 'npx prisma migrate dev --name init' para generar todas las tablas si están completas.
```bash
npx prisma migrate dev --name create_nombredelatabla_table
```
El siguiente comando genera el cliente Prisma, se usa cada vez que se actualice los modelos.
```bash
npx prisma generate
```