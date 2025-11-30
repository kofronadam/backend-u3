# Node + Express nákupní seznam

Backend pro školní projekt — Node.js + Express.  
Poskytuje REST API pro správu nákupních seznamů a položek. Projekt je navržený pro snadné lokální spuštění a integraci s frontendem.

Funkce:

- Přidávání / úprava / mazání položek v seznamu
- Označení položky jako vyřešené (checked)
- Filtrování seznamů podle vlastníka (owner)
- Data persistována do `db.json` (lowdb)
- CORS povoleno pro volání z frontendu

Spuštění:

```
npm install
npm run dev
```

Poté otevři adresu, kde server poběží (výchozí): http://localhost:4000
