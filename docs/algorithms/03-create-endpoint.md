# Algorithm: POST /lists - Vytvoření nového nákupního seznamu

## Popis

Tento koncový bod (uuCmd) vytvoří nový nákupní seznam v databázi s jedinečným ID a zadanými parametry.

## Vstupní parametry

- **name** (body, povinný): Název nákupního seznamu (neprázdný string)
- **owner** (body, volitelný): Jméno vlastníka seznamu (string nebo null)

## Výstup

- **HTTP 201**: JSON objekt s nově vytvořeným seznamem
- **HTTP 400**: Validační chyba (prázdný nebo chybějící název)
- **HTTP 500**: Chyba serveru při ukládání do databáze

## Algoritmus

```
ZAČÁTEK
  1. PŘIJMI HTTP POST požadavek na /lists

  2. EXTRAHUJ name a owner z těla požadavku (req.body)

  3. VALIDACE name:
     POKUD name NENÍ neprázdný string POTOM
       a. VRAŤ HTTP 400 s JSON:
          {
            "error": {
              "code": "validation_failed",
              "message": "name is required and must be a non-empty string"
            }
          }
       b. UKONČI
     KONEC POKUD

  4. VYTVOŘ nový objekt seznamu:
     newList = {
       id: <vygeneruj pomocí nanoid()>,
       name: <trim(name)>,
       owner: <pokud owner je neprázdný string, tak trim(owner), jinak null>,
       items: [] (prázdné pole)
     }

  5. POKUS
       a. VYTVOŘ novou instanci ShoppingList(newList)
       b. ZAVOLEJ save() pro uložení do MongoDB
       c. PŘEVEĎ výsledek na plain objekt pomocí toObject()
       d. ODSTRAŇ pole _id a __v z výsledku
       e. ULOŽ do proměnné response

  6. POKUD CHYBA nastala během ukládání POTOM
       a. ZALOGUJ chybu
       b. VRAŤ HTTP 500 s JSON:
          {
            "error": {
              "code": "internal_error",
              "message": <popis chyby>
            }
          }
       c. UKONČI
     KONEC POKUD

  7. VRAŤ HTTP 201 s JSON objektem response

KONEC
```

## Příklad volání

### Požadavek

```http
POST /lists HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{
  "name": "Groceries",
  "owner": "John Doe"
}
```

### Odpověď (úspěch)

```json
{
  "id": "V1StGXR8_Z5jdHi6B-myT",
  "name": "Groceries",
  "owner": "John Doe",
  "items": [],
  "createdAt": "2025-12-13T10:00:00.000Z",
  "updatedAt": "2025-12-13T10:00:00.000Z"
}
```

### Požadavek bez vlastníka

```http
POST /lists HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{
  "name": "Shopping List"
}
```

### Odpověď (úspěch bez vlastníka)

```json
{
  "id": "3z6G8_K2mN9pQr1sT4vW",
  "name": "Shopping List",
  "owner": null,
  "items": [],
  "createdAt": "2025-12-13T10:05:00.000Z",
  "updatedAt": "2025-12-13T10:05:00.000Z"
}
```

### Odpověď (validační chyba)

```json
{
  "error": {
    "code": "validation_failed",
    "message": "name is required and must be a non-empty string"
  }
}
```

## Použití

Tento endpoint se používá pro:

- Vytvoření nového prázdného nákupního seznamu
- Inicializaci seznamu s vlastníkem
- První krok v workflow správy nákupních seznamů

## Důležité poznámky

- ID je generováno automaticky pomocí knihovny nanoid pro zajištění jedinečnosti
- Pole items je inicializováno jako prázdné pole
- Timestamp createdAt a updatedAt jsou přidány automaticky MongoDB
- Whitespace na začátku a konci name a owner je odstraněn pomocí trim()
