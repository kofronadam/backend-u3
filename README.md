# Node + Express nákupní seznam

Backend pro školní projekt — Node.js + Express.  
Poskytuje REST API pro správu nákupních seznamů a položek. Projekt je navržený pro snadné lokální spuštění a integraci s frontendem.

## Technologický stack

- **Node.js** + **Express.js** - Backend framework
- **MongoDB** + **Mongoose** - Databáze a ODM
- **nanoid** - Generování jedinečných ID

## Spuštění

### Předpoklady

- Node.js nainstalován
- MongoDB server běžící lokálně na `mongodb://localhost:27017` nebo nastavená proměnná `MONGODB_URI`

### Instalace a spuštění

```bash
npm install
npm start
# nebo pro development:
npm run dev
```

Poté otevři adresu, kde server poběží (výchozí): http://localhost:4000

## Dokumentace

- **Algorithm popisy**: Viz `docs/algorithms/` pro detailní popis algoritmů 5 klíčových endpointů
- **Insomnia kolekce**: Import z `test/insomnia/insomnia_export.json` pro testování API

## Konfigurace

Projekt podporuje následující environment proměnné:

- `PORT` - Port serveru (výchozí: 4000)
- `MONGODB_URI` - MongoDB connection string (výchozí: mongodb://localhost:27017/shopping-lists)
