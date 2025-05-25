# Projekt: Analiza Danych Ekonomicznych – Docker & Docker Compose

## Spis treści

- [Opis projektu](#opis-projektu)
- [Wymagania](#wymagania)
- [Czym jest Docker?](#czym-jest-docker)
- [Czym jest Docker Compose?](#czym-jest-docker-compose)
- [Struktura projektu](#struktura-projektu)
- [Opis plików Dockerfile](#opis-plików-dockerfile)
- [Opis pliku docker-compose.yml](#opis-pliku-docker-composeyml)
- [Uruchamianie projektu](#uruchamianie-projektu)
- [Najczęstsze problemy](#najczęstsze-problemy)
- [Dodatkowe materiały](#dodatkowe-materiały)

---

## Opis projektu

Aplikacja umożliwia filtrowanie i analizę danych ekonomicznych oraz prezentację wyników w przystępnej formie. Składa się z trzech głównych komponentów:
- **Frontend** (React) – interfejs użytkownika,
- **Backend** (Node.js/Express) – API obsługujące logikę biznesową,
- **Baza danych** (PostgreSQL) – przechowywanie danych.

Całość uruchamiana jest w kontenerach Docker, zarządzanych przez Docker Compose.

---

## Wymagania

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)
- System operacyjny: Windows, Linux lub macOS

---

## Czym jest Docker?

Docker to narzędzie umożliwiające uruchamianie aplikacji w tzw. kontenerach – lekkich, izolowanych środowiskach, które zawierają wszystko, co potrzebne do działania aplikacji (kod, zależności, system plików). Dzięki temu aplikacja działa identycznie na każdym komputerze.

**Podstawowe pojęcia:**
- **Obraz (image):** Szablon, z którego uruchamiane są kontenery.
- **Kontener (container):** Działająca instancja obrazu.
- **Dockerfile:** Plik opisujący, jak zbudować obraz Dockera.

---

## Czym jest Docker Compose?

Docker Compose pozwala na definiowanie i uruchamianie wielu kontenerów jako jednej aplikacji, za pomocą pliku `docker-compose.yml`. Umożliwia to łatwe zarządzanie zależnościami (np. backend, frontend, baza danych).

---

## Struktura projektu

```
.
├── docker-compose.yml
├── client/
│   ├── Dockerfile
│   └── src/
│       └── components/
│           └── MainContent.jsx
├── server/
│   └── Dockerfile
└── ...
```

---

## Opis plików Dockerfile

### `client/Dockerfile`

Buduje obraz frontendu React. Składa się z dwóch etapów:
1. **Budowanie aplikacji** na bazie obrazu `node:20`.
2. **Serwowanie** zbudowanej aplikacji przez serwer Nginx (`nginx:alpine`).

### `server/Dockerfile`

Buduje obraz backendu Node.js:
- Bazuje na obrazie `node:20`.
- Kopiuje pliki źródłowe i instaluje zależności.
- Uruchamia serwer na porcie 3000.

---

## Opis pliku docker-compose.yml

Plik `docker-compose.yml` definiuje trzy serwisy:

- **db** – baza danych PostgreSQL (z trwałym wolumenem na dane)
- **backend** – serwer Node.js (Express)
- **frontend** – aplikacja React serwowana przez Nginx

Przykładowa konfiguracja:

```yaml
version: '3.8'

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  backend:
    build: ./server
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=postgres
    ports:
      - "3000:3000"
    depends_on:
      - db
    restart: unless-stopped

  frontend:
    build: ./client
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  db_data:
```

---

## Uruchamianie projektu

1. **Zbuduj i uruchom wszystkie serwisy:**
   ```bash
   docker-compose up --build
   ```

2. **Aplikacja frontendowa będzie dostępna pod adresem:**  
   [http://localhost:5173](http://localhost:5173)

3. **Backend (API) dostępny pod adresem:**  
   [http://localhost:3000](http://localhost:3000)

4. **Baza danych PostgreSQL:**  
   Port: `5432`, użytkownik/hasło: `postgres`

5. **Zatrzymanie wszystkich serwisów:**
   ```bash
   docker-compose down
   ```

---

## Najczęstsze problemy

- **Port zajęty:** Upewnij się, że porty 3000, 5173 i 5432 nie są zajęte przez inne procesy.
- **Zmiany w kodzie:** Po zmianach w kodzie backendu lub frontendu uruchom ponownie `docker-compose up --build`.
- **Brak połączenia z bazą:** Sprawdź, czy serwis `db` działa poprawnie i czy zmienne środowiskowe są poprawnie ustawione.

---

## Dodatkowe materiały

- [Oficjalna dokumentacja Docker](https://docs.docker.com/)
- [Oficjalna dokumentacja Docker Compose](https://docs.docker.com/compose/)
- [Oficjalna dokumentacja React](https://react.dev/)
- [Oficjalna dokumentacja Node.js](https://nodejs.org/en/docs/)

---

W razie pytań lub problemów, proszę o kontakt przez Issues na GitHubie.