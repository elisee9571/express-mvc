# DOCUMENT DE SPÉCIFICATIONS FONCTIONNELLES

Nom du projet : express-mvc

Client / Organisation : M2I Formation

Auteur(s) : Elisée Desmarest - Formateur

Version : v0.1

Date : 01/03/2026

Statut :
- [x] Brouillon
- [ ] En validation
- [ ] Validé

## HISTORIQUE DES VERSIONS
| Version | Date | Auteur | Description |
| ---: | ----------- | ----------- | ----------- |
| v0.1 | 01/03/2026 | Elisée Desmarest | Création du contenu |

## 1. CONTEXT DU PROJET
### 1.1 Présentation générale
> Ce document décrit les spécifications fonctionnelles d'une API REST Stateless destinée à une gestion centralisée.

Actuellement, l’entreprise utilise une application avec une architecture monolithique. Cette architecture limite l’évolution vers d’autres supports.

Dans un contexte de croissance et de diversification des canaux (application mobile, plateforme partenaire, interface client dédiée, etc.), l’entreprise souhaite découpler son système existant afin d’exposer ses fonctionnalités via une API centralisée.

### 1.2 Objectifs du projet
#### Objectifs spécifiques du projet :
- Centraliser et faciliter l'acces de l'information dans un endroit unique.

## 2. PÉRIMÈTRE
### 2.1 Inclus dans le projet
#### Fonctionnalités incluses :
- Gestion utilisateurs

...
### 2.2 Exclus du projet
#### Non inclus :
- Export des ressources en format CSV.

...
#### Évolution future :
- Développement d’une application mobile native.

...
## 3. ACTEUR
| Acteur | Description | Droits |
| --- | ----------- | ----------- |
| Administrateur | Responsable de la gestion du système | Accès complet |
| Utilisateur | Utilisateur standard du système | Accès limité |
...
## 4. DESCRIPTION FONCTIONNELLE DÉTAILLÉE
### 4.1 Cas d'utilisation

#### UC-01 - Inscription utilisateur
```
Acteur : Visiteur

Donnée d'entrée :
Le cas commence lorsqu'il clique sur le bouton s'inscrire

Scénario principal :
    1. Le système demande à l'utilisateur de saisir email et mot de passe
    2. L'utilisateur saisit un email et mot de passe puis valide
    3. Le système informe que le compte est crée

Scénario d'erreur : Client déjà existant
    3a. Le système informe le client qu'il est déjà existant.
    Retour à l'étape 1.
```

#### UC-02 - Authentification utilisateur
```
Acteur : Utilisateur

Donnée d'entrée :
Le cas commence lorsqu'il clique sur le bouton se connecter

Scénario principal :
    1. Le système demande à l'utilisateur de saisir email et mot de passe
    2. L'utilisateur saisit un email et mot de passe puis valide
    3. Le système informe qu'il est connecter
    4. L'utilisateur est connecté

Scénario d'erreur : Client inconnu
    3a. Le système informe le client est inconnu.
    Retour à l'étape 1.

Scénario alternatif : Mot de passe oublié
    2a. Le systeme demande de saisir un email valide
    2b. L'utilisateur saisit un email valide puis valide
    3b. Le systeme envoie un mail de reinitialisation de mot de passe.
    Fin du scénario.

Scénario alternatif : Réinitialiser un mot de passe
    1a. Le système demande de saisir un mot de passe valide
    1b. L'utilisateur saisit un mot de passe valide puis valide.
    1c. Le système informe que le mot de passe a bien été réinitialiser.
    Retour à l'etape 1.
```
...
## 5. RÈGLES DE GESTION
- **RG-001** : Une adresse email ne peut être utilisée qu’une seule fois.

...
## 6. DESCRIPTION DES ÉCRANS
#### ECRAN-01 : Page d'inscription

L'écran affiche un formulaire nécessitant des informations utilent à la création d'un utilisateur.

| Élément | Type | Obligatoire | Règle |
| ----------- | ----------- | ----------- | ----------- |
| Pseudo | Texte| OUI | Minimum 4 caractères |
| Email | Email | OUI | Format valide |
| Mot de passe | Mot de passe | OUI | Minimum 8 caractères |
| Bouton Inscription | Action | - | Vérification de conformité |

#### Messages d’erreur :
- "Pseudo requis"
- "Saisir un pseudo d'un minimum de 4 caractères"
- "Email requis"
- "Email invalide"
- "Mot de passe requis"
- "Saisir un mot de passe d'un minimum de 8 caractères"
- "Email déjà existant"
- "Informations d'identification non valides"

...
## 7. EXIGENCES NON FONCTIONNELLES
#### Exigences spécifiques :
- Le temps de chargement d’une réponse ne doit pas dépasser 100ms.
- Authentification via access token (JSON Web Token - JWT).
- Conformité RGPD.

### 7.1 Performance
- Mise en cache des requêtes retournant des données à afficher.

### 7.2 Sécurité
- Authentification access token (JWT) pour chaque requête.
- Gestion des rôles et permissions.

#### Exigences à respecter
- API Design REST Stateless

### 7.3 Compatibilité
#### Environnement
- Développement
- Production

### 8. DONNÉES MÉTIER
| Entité | Description | Propriétés |
| ----------- | ----------- | ----------- |
| User | Compte utilisateur | _id, name, email, rôle, password, refreshTokenHash, refreshTokenExpiresAt, createdAt, updatedAt |

### 9. CONTRAINTES
#### Contraintes spécifiques :
-  Hébergement sur Amazon Web Services (AWS).

#### Contraintes réglementaires :
- Respect du RGPD.
- REST
- Stateless

#### Contraintes deadline :
- Mise en production avant le 30 mai 2026.

### 10. ANNEXES
Documentation postman : [Documentation API][1]

[1]: https://documenter.getpostman.com/view/25748673/2sBXcGFKvk