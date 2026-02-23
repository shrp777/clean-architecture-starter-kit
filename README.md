# Library — Clean Architecture

Implémentation de la **Clean Architecture** (Ports & Adapters / Architecture Hexagonale) pour une application de gestion de bibliothèque, développée avec **Bun** et **TypeScript**.

---

## Sommaire

- [Architecture](#architecture)
- [Modèle du domaine](#modèle-du-domaine)
- [Cas d'utilisation](#cas-dutilisation)
- [API HTTP](#api-http)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Gestion des erreurs](#gestion-des-erreurs)

---

## Architecture

Le projet respecte la règle de dépendance de la Clean Architecture : les couches extérieures dépendent des couches intérieures, jamais l'inverse.

```
Drivers → Adapters → Application → Domain
```

```
src/
├── domain/                   # Logique métier pure — aucune dépendance extérieure
│   ├── entities/             # Entités : Book, Loan, Member
│   ├── value-objects/        # Objets valeur : Isbn
│   └── errors/               # Erreurs métier
│
├── application/              # Orchestration des cas d'utilisation
│   ├── ports/
│   │   ├── inputs/           # Interfaces exposées (contrats des use cases)
│   │   └── outputs/          # Interfaces requises (contrats des repositories)
│   ├── use-cases/            # Implémentations des ports d'entrée
│   ├── dtos/                 # Objets de transfert de données (requête / réponse)
│   └── errors/               # Erreurs applicatives
│
├── adapters/                 # Implémentations des ports
│   ├── handlers/             # Gestionnaires HTTP (appellent les use cases)
│   ├── presenters/           # Formatage des réponses
│   └── repositories/
│       ├── in-memory/        # InMemoryBookRepository, InMemoryLoanRepository, InMemoryMemberRepository
│       ├── mariadb/          # MariadbBookRepository, MariadbLoanRepository, MariadbMemberRepository, createMariadbPool
│       └── mongodb/          # MongoBookRepository, MongoLoanRepository, MongoMemberRepository, createMongoDb
│
└── drivers/                  # Points d'entrée
    ├── http/                 # Serveur HTTP (Bun.serve)
    └── repl/                 # Interface CLI interactive
```

**Règle clé** : `domain/` et `application/` n'importent jamais depuis `adapters/` ou `drivers/`.

---

## Modèle du domaine

### Entités

#### `Book`

Représente un livre dans la bibliothèque.

| Propriété | Type     | Contraintes                      |
|-----------|----------|----------------------------------|
| `id`      | `string` | UUID généré automatiquement      |
| `title`   | `string` | Non vide (espaces ignorés)       |
| `author`  | `string` | Non vide (espaces ignorés)       |
| `isbn`    | `Isbn?`  | Optionnel — ISBN-10 ou ISBN-13   |

#### `Member`

Représente un adhérent de la bibliothèque.

| Propriété | Type     | Contraintes                        |
|-----------|----------|------------------------------------|
| `id`      | `string` | UUID généré automatiquement        |
| `name`    | `string` | Non vide                           |
| `email`   | `string` | Doit contenir `@`, normalisé en minuscules |

#### `Loan`

Représente un emprunt d'un livre par un adhérent.

| Propriété    | Type     | Contraintes                                      |
|--------------|----------|--------------------------------------------------|
| `id`         | `string` | UUID généré automatiquement                      |
| `bookId`     | `string` | Référence à un `Book`                            |
| `memberId`   | `string` | Référence à un `Member`                          |
| `borrowedAt` | `Date`   | Date de l'emprunt                                |
| `returnedAt` | `Date?`  | `undefined` si l'emprunt est toujours actif      |

**Méthodes :**

- `isActive` — `true` si le livre n'a pas encore été rendu
- `giveBack()` — retourne un nouvel objet `Loan` avec `returnedAt` défini ; lève `LoanAlreadyReturnedError` si déjà rendu

### Objet valeur : `Isbn`

Valide et normalise un ISBN-10 ou ISBN-13 (les tirets et espaces sont retirés, la somme de contrôle est vérifiée).

---

## Cas d'utilisation

| Use case                    | Entrée                              | Sortie              | Erreurs possibles                              |
|-----------------------------|-------------------------------------|---------------------|------------------------------------------------|
| `AddBookUseCase`            | `{ title, author, isbn? }`          | `BookResponseDTO`   | `InvalidTitleError`, `InvalidAuthorError`, `InvalidIsbnError` |
| `CheckBookAvailabilityUseCase` | `bookId`                         | `{ available }`     | `BookNotFoundError`                            |
| `CreateMemberUseCase`       | `{ name, email }`                   | `MemberResponseDTO` | `InvalidNameError`, `InvalidEmailError`        |
| `GetMemberUseCase`          | `memberId`                          | `MemberResponseDTO` | `MemberNotFoundError`                          |
| `BorrowBookUseCase`         | `{ bookId, memberId }`              | `LoanResponseDTO`   | `BookNotFoundError`, `BookAlreadyBorrowedError` |
| `ReturnBookUseCase`         | `loanId`                            | `LoanResponseDTO`   | `LoanNotFoundError`, `LoanAlreadyReturnedError` |
| `GetMemberLoansUseCase`     | `memberId`                          | `LoanResponseDTO[]` | —                                              |

---

## API HTTP

Le serveur écoute sur le port **3000**.

### `GET /api`

Retourne la liste de tous les endpoints disponibles.

---

### Membres

#### `POST /api/members` — Créer un adhérent

**Corps de la requête :**
```json
{
  "name": "Alice Dupont",
  "email": "alice@example.com"
}
```

**Réponse `201` :**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Alice Dupont",
  "email": "alice@example.com"
}
```

---

#### `GET /api/members/:id` — Récupérer un adhérent

**Réponse `200` :**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Alice Dupont",
  "email": "alice@example.com"
}
```

**Réponse `404` :** adhérent introuvable.

---

### Livres

#### `POST /api/books` — Ajouter un livre

**Corps de la requête :**
```json
{
  "title": "Clean Architecture",
  "author": "Robert C. Martin",
  "isbn": "978-0-13-468599-1"
}
```

> `isbn` est optionnel.

**Réponse `201` :**
```json
{
  "id": "a1b2c3d4-...",
  "title": "Clean Architecture",
  "author": "Robert C. Martin",
  "isbn": "9780134685991"
}
```

**Réponse `422` :** titre ou auteur invalide, ISBN invalide.

---

#### `GET /api/books/:id/availability` — Vérifier la disponibilité

**Réponse `200` :**
```json
{ "available": true }
```

**Réponse `404` :** livre introuvable.

---

### Emprunts

#### `POST /api/loans` — Emprunter un livre

**Corps de la requête :**
```json
{
  "bookId": "a1b2c3d4-...",
  "memberId": "550e8400-..."
}
```

**Réponse `201` :**
```json
{
  "id": "f47ac10b-...",
  "bookId": "a1b2c3d4-...",
  "memberId": "550e8400-...",
  "borrowedAt": "2026-02-23T10:00:00.000Z",
  "returnedAt": null
}
```

**Réponse `404` :** livre introuvable.
**Réponse `409` :** livre déjà emprunté.

---

#### `GET /api/loans?memberId=:id` — Emprunts d'un adhérent

**Réponse `200` :**
```json
[
  {
    "id": "f47ac10b-...",
    "bookId": "a1b2c3d4-...",
    "memberId": "550e8400-...",
    "borrowedAt": "2026-02-23T10:00:00.000Z",
    "returnedAt": null
  }
]
```

---

#### `PATCH /api/loans/:id/return` — Rendre un livre

**Réponse `200` :**
```json
{
  "id": "f47ac10b-...",
  "bookId": "a1b2c3d4-...",
  "memberId": "550e8400-...",
  "borrowedAt": "2026-02-23T10:00:00.000Z",
  "returnedAt": "2026-02-24T15:30:00.000Z"
}
```

**Réponse `404` :** emprunt introuvable.
**Réponse `422` :** livre déjà rendu.

---

#### `GET /api/health` — Santé du serveur

```json
{ "status": "ok", "timestamp": "2026-02-23T10:00:00.000Z" }
```

---

## Configuration

### Variables d'environnement

#### `app/.env`

| Variable           | Description                                       |
|--------------------|---------------------------------------------------|
| `DRIVER_TYPE`      | `rest` (HTTP) ou `repl` (CLI interactive)         |
| `PERSISTENCE_TYPE` | `inmemory`, `mariadb` ou `mongodb`                |
| `DB_HOST`          | Hôte de la base de données                        |
| `DB_PORT`          | Port de la base de données                        |
| `DB_NAME`          | Nom de la base de données                         |
| `DB_USER`          | Utilisateur de la base de données                 |
| `DB_PASSWORD`      | Mot de passe de la base de données                |

> `DB_*` est ignoré si `PERSISTENCE_TYPE=inmemory`.

#### `mariadb/.env`

| Variable                    | Description                            |
|-----------------------------|----------------------------------------|
| `MARIADB_ROOT_PASSWORD`     | Mot de passe du compte root            |
| `MARIADB_DATABASE`          | Nom de la base créée au démarrage      |
| `MARIADB_USER`              | Utilisateur applicatif                 |
| `MARIADB_PASSWORD`          | Mot de passe de l'utilisateur          |

#### `mongodb/.env`

| Variable                      | Description                                      |
|-------------------------------|--------------------------------------------------|
| `MONGO_INITDB_ROOT_USERNAME`  | Compte root MongoDB                              |
| `MONGO_INITDB_ROOT_PASSWORD`  | Mot de passe root                                |
| `MONGO_INITDB_DATABASE`       | Base créée par le script d'init                  |
| `MONGO_INITDB_USERNAME`       | Utilisateur applicatif créé par le script d'init |
| `MONGO_INITDB_PASSWORD`       | Mot de passe de l'utilisateur applicatif         |

#### `mongo-express/.env`

| Variable                          | Description                                      |
|-----------------------------------|--------------------------------------------------|
| `ME_CONFIG_MONGODB_SERVER`        | Hôte MongoDB (doit correspondre au nom du service Docker) |
| `ME_CONFIG_MONGODB_ADMINUSERNAME` | Compte root MongoDB (identique à `MONGO_INITDB_ROOT_USERNAME`) |
| `ME_CONFIG_MONGODB_ADMINPASSWORD` | Mot de passe root (identique à `MONGO_INITDB_ROOT_PASSWORD`) |
| `ME_CONFIG_BASICAUTH_USERNAME`    | Identifiant de l'interface web Mongo Express     |
| `ME_CONFIG_BASICAUTH_PASSWORD`    | Mot de passe de l'interface web Mongo Express    |

---

### Combinaisons possibles

| `DRIVER_TYPE` | `PERSISTENCE_TYPE` | Description                           |
|---------------|--------------------|---------------------------------------|
| `rest`        | `inmemory`         | Serveur HTTP, données en mémoire      |
| `rest`        | `mariadb`          | Serveur HTTP, données dans MariaDB    |
| `rest`        | `mongodb`          | Serveur HTTP, données dans MongoDB    |
| `repl`        | `inmemory`         | CLI interactive, données en mémoire   |
| `repl`        | `mariadb`          | CLI interactive, données dans MariaDB |
| `repl`        | `mongodb`          | CLI interactive, données dans MongoDB |

---

## Démarrage

### Avec Docker Compose (recommandé)

```bash
docker compose up
```

Tous les services démarrent ensemble : app, MariaDB, Adminer, MongoDB et Mongo Express.

| Interface     | URL                    |
|---------------|------------------------|
| API           | http://localhost:3000  |
| Adminer       | http://localhost:8181  |
| Mongo Express | http://localhost:8282  |

> Lors du premier démarrage avec MongoDB, supprimer les volumes existants pour forcer l'exécution du script d'init : `docker compose down -v`.

### En local

```bash
# Installer les dépendances
cd app && bun install

# Lancer l'application
cd app && bun run src/index.ts

# Avec rechargement automatique
cd app && bun --hot src/index.ts
```

### Tests

```bash
# Tous les tests
cd app && bun test

# Un fichier spécifique
cd app && bun test src/path/to/file.test.ts
```

---

## Gestion des erreurs

### Erreurs du domaine (`DomainError`)

Levées lors de la création d'entités avec des données invalides.

| Erreur                  | Message                              | HTTP  |
|-------------------------|--------------------------------------|-------|
| `InvalidTitleError`     | Title cannot be empty                | `422` |
| `InvalidAuthorError`    | Author cannot be empty               | `422` |
| `InvalidIsbnError`      | Invalid ISBN: "..."                  | `422` |
| `InvalidNameError`      | Name cannot be empty                 | `422` |
| `InvalidEmailError`     | Invalid email address: "..."         | `422` |
| `LoanAlreadyReturnedError` | Loan has already been returned    | `422` |

### Erreurs applicatives (`ApplicationError`)

Levées lors de l'exécution des cas d'utilisation.

| Erreur                   | Message                        | HTTP  |
|--------------------------|--------------------------------|-------|
| `BookNotFoundError`      | Book "..." not found           | `404` |
| `MemberNotFoundError`    | Member "..." not found         | `404` |
| `LoanNotFoundError`      | Loan "..." not found           | `404` |
| `BookAlreadyBorrowedError` | Book "..." is already borrowed | `409` |

---

## Aliasages TypeScript

Configurés dans `app/tsconfig.json` — à utiliser à la place des chemins relatifs :

| Alias          | Chemin réel       |
|----------------|-------------------|
| `@domain/*`    | `src/domain/*`    |
| `@application/*` | `src/application/*` |
| `@adapters/*`  | `src/adapters/*`  |
| `@drivers/*`   | `src/drivers/*`   |
| `@test/*`      | `tests/*`         |

---

!["Logotype Shrp"](https://sherpa.one/images/sherpa-logotype.png)

**Alexandre Leroux**
_Enseignant / Formateur_
_Développeur logiciel web & mobile_
Nancy (Grand Est, France) — <https://shrp.dev>
