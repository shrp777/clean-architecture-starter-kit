# Clean Architecture Starter Kit

Projet modèle d'implémentation de la **Clean Architecture** avec TypeScript.

---

## Sommaire

- [Architecture](#architecture)
- [Modèle du domaine](#modèle-du-domaine)
- [Cas d'utilisation](#cas-dutilisation)
- [API REST](#api-rest)
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
    └── console/                 # Interface CLI interactive
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

### Objet valeur : `Isbn`

Valide et normalise un ISBN-10 ou ISBN-13 (les tirets et espaces sont retirés, la somme de contrôle est vérifiée).

---

## Cas d'utilisation

| Use case                    | Entrée                              | Sortie              | Erreurs possibles                              |
|-----------------------------|-------------------------------------|---------------------|------------------------------------------------|
| `AddBookUseCase`            | `{ title, author, isbn? }`          | `BookResponseDTO`   | `InvalidTitleError`, `InvalidAuthorError`, `InvalidIsbnError` |                                              |

---

## API REST

Le serveur écoute sur le port **3000**.

### `GET /api`

Retourne la liste de tous les endpoints disponibles.

### `POST /api/books` — Ajouter un livre

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
| `DRIVER_TYPE`      | `http` (HTTP) ou `console` (CLI interactive)         |
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
| `http`        | `inmemory`         | Serveur HTTP, données en mémoire      |
| `http`        | `mariadb`          | Serveur HTTP, données dans MariaDB    |
| `http`        | `mongodb`          | Serveur HTTP, données dans MongoDB    |
| `console`        | `inmemory`         | CLI interactive, données en mémoire   |
| `console`        | `mariadb`          | CLI interactive, données dans MariaDB |
| `console`        | `mongodb`          | CLI interactive, données dans MongoDB |

---

## Démarrage

### Avec Docker Compose (recommandé)

```bash
docker compose up
```

Tous les services démarrent ensemble : app, MariaDB, Adminer, MongoDB et Mongo Express.

| Interface     | URL                    |
|---------------|------------------------|
| API           | <http://localhost:3000>  |
| Adminer       | <http://localhost:8181>  |
| Mongo Express | <http://localhost:8282>  |

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

### Erreurs applicatives (`ApplicationError`)

Levées lors de l'exécution des cas d'utilisation.

| Erreur                   | Message                        | HTTP  |
|--------------------------|--------------------------------|-------|
| `BookNotFoundError`      | Book "..." not found           | `404` |

---

## Raccourcis pour les imports

Configurés dans `app/tsconfig.json` — à utiliser à la place des chemins relatifs :

| Alias          | Chemin réel       |
|----------------|-------------------|
| `@domain/*`    | `src/domain/*`    |
| `@application/*` | `src/application/*` |
| `@adapters/*`  | `src/adapters/*`  |
| `@drivers/*`   | `src/drivers/*`   |
| `@test/*`      | `tests/*`         |

![alt text](assets/bibliotheque.png)

---

!["Logotype Shrp"](https://sherpa.one/images/sherpa-logotype.png)

**Alexandre Leroux**
_Enseignant / Formateur_
_Développeur logiciel web & mobile_
Nancy (Grand Est, France) — <https://shrp.dev>
