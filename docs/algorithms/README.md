# Algorithm Descriptions - Shopping Lists API

Tato složka obsahuje podrobné popisy algoritmů pro klíčové koncové body REST API pro správu nákupních seznamů.

## Přehled dokumentovaných endpointů

Následující koncové body jsou plně dokumentovány pomocí komponenty Algorithm:

1. **[01-list-endpoint.md](./01-list-endpoint.md)** - `GET /lists`

   - Poskytnutí seznamu všech nákupních seznamů
   - Podporuje filtrování podle vlastníka

2. **[02-get-endpoint.md](./02-get-endpoint.md)** - `GET /lists/:id`

   - Vrácení jednoho konkrétního záznamu
   - Detail nákupního seznamu včetně položek

3. **[03-create-endpoint.md](./03-create-endpoint.md)** - `POST /lists`

   - Vytvoření nového záznamu
   - Inicializace nového nákupního seznamu

4. **[04-delete-endpoint.md](./04-delete-endpoint.md)** - `DELETE /lists/:id`

   - Smazání záznamu
   - Trvalé odstranění seznamu z databáze

5. **[05-update-endpoint.md](./05-update-endpoint.md)** - `PATCH /lists/:id`
   - Aktualizace záznamu
   - Částečná aktualizace metadat seznamu

## Dodatečné endpointy

API obsahuje také následující pomocné endpointy pro správu položek v seznamech:

- `POST /lists/:id/items` - Přidání položky do seznamu
- `PATCH /lists/:id/items/:itemId` - Aktualizace položky
- `DELETE /lists/:id/items/:itemId` - Smazání položky

## Konvence

- Všechny endpointy vracejí JSON
- Chybové odpovědi mají formát: `{ "error": { "code": "...", "message": "..." } }`
- Úspěšné vytvoření vrací HTTP 201
- Úspěšné smazání vrací HTTP 204
- Nenalezené zdroje vracejí HTTP 404
- Validační chyby vracejí HTTP 400
- Serverové chyby vracejí HTTP 500

## Další informace

Pro testování API použijte Insomnia kolekci v `test/insomnia/insomnia_export.json`.
