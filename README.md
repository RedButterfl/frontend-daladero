# DALADERO Frontend React

Interface utilisateur moderne construite avec React + Vite pour la plateforme DALADERO de gestion intelligente des connaissances.

## 🚀 Fonctionnalités

### ✅ Authentification
- **Inscription/Connexion** sécurisée via Supabase
- **Gestion des sessions** avec JWT et refresh token automatique
- **Validation de formulaires** côté client
- **Messages d'erreur** contextuels

### 🤖 Chat avec Agents IA
- **3 types d'agents** :
  - 🎓 Assistant Connaissances (GPT-4o-mini)
  - 🔬 Spécialiste Recherche (GPT-4o)
  - 🎭 Système Multi-Agents (délégation intelligente)
- **Chat en temps réel** avec streaming
- **Historique des conversations**
- **Suggestions rapides**
- **Sources des réponses**

### 📚 Gestion de Documents
- **Upload par glisser-déposer** ou sélection
- **Support multi-formats** : PDF, TXT, MD, DOC, DOCX, CSV, JSON
- **Validation** de taille et type de fichier
- **Prévisualisation** du contenu
- **Gestion complète** : liste, suppression, visualisation

### 🔗 Intégration GitHub
- **OAuth GitHub** sécurisé
- **Liste des repositories** avec métadonnées
- **Indexation automatique** des projets
- **Suivi du statut** d'indexation
- **Enrichissement automatique** du profil

### 🧠 Gestionnaire de Mémoires
- **CRUD complet** des mémoires utilisateur
- **Catégorisation** (aspirations, préférences, compétences, etc.)
- **Système de tags** pour l'organisation
- **Recherche sémantique** dans les mémoires
- **Filtrage par catégorie**

### 📊 Dashboard Intelligent
- **Statistiques** en temps réel
- **Actions rapides** contextuelles
- **Statut des intégrations**
- **Vue d'ensemble** des fonctionnalités

## 🛠 Technologies

- **React 18** - Interface utilisateur moderne
- **Vite** - Build tool rapide et moderne
- **React Router** - Navigation SPA
- **Tailwind CSS** - Framework CSS utilitaire
- **Axios** - Client HTTP avec intercepteurs
- **React Hot Toast** - Notifications élégantes
- **Lucide React** - Icônes modernes
- **React Hook Form** - Gestion de formulaires

## 🏗 Structure du Projet

```
frontend-react/
├── src/
│   ├── components/         # Composants réutilisables
│   │   ├── Layout.jsx     # Layout principal avec sidebar
│   │   ├── Sidebar.jsx    # Navigation latérale
│   │   ├── Header.jsx     # En-tête avec recherche
│   │   ├── ProtectedRoute.jsx # Protection des routes
│   │   └── LoadingSpinner.jsx # Indicateur de chargement
│   │
│   ├── pages/             # Pages principales
│   │   ├── AuthPage.jsx   # Authentification (login/signup)
│   │   ├── Dashboard.jsx  # Tableau de bord
│   │   ├── AgentsChat.jsx # Chat avec agents IA
│   │   ├── FileManager.jsx # Gestion des documents
│   │   ├── GitHubIntegration.jsx # Intégration GitHub
│   │   └── MemoryManager.jsx # Gestionnaire de mémoires
│   │
│   ├── services/          # Services API
│   │   └── api.js         # Client Axios + tous les services
│   │
│   ├── contexts/          # Contextes React
│   │   └── AuthContext.jsx # Contexte d'authentification
│   │
│   ├── hooks/             # Hooks personnalisés
│   │   └── useAuth.js     # Hook d'authentification
│   │
│   ├── utils/             # Utilitaires
│   ├── App.jsx            # Composant principal
│   ├── main.jsx           # Point d'entrée
│   └── index.css          # Styles globaux Tailwind
│
├── public/                # Assets statiques
├── index.html             # Template HTML
├── vite.config.js         # Configuration Vite
├── tailwind.config.js     # Configuration Tailwind
├── postcss.config.js      # Configuration PostCSS
└── package.json           # Dépendances et scripts
```

## 📦 Installation

1. **Installer les dépendances**
   ```bash
   cd frontend-react
   npm install
   ```

2. **Configuration backend**
   
   Vérifiez que la configuration Vite pointe vers votre backend :
   ```javascript
   // vite.config.js
   server: {
     port: 3000,
     proxy: {
       '/api': 'http://localhost:8000',
       '/auth': 'http://localhost:8000',
       // ...
     }
   }
   ```

3. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   
   L'application sera accessible sur `http://localhost:3000`

## 🔧 Scripts Disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Prévisualiser le build
npm run lint     # Linter ESLint
```

## 🔄 Migration depuis le Frontend Vanilla

Cette version React remplace complètement l'ancien frontend HTML/CSS/JS vanilla en conservant toutes les fonctionnalités :

### ✅ Fonctionnalités Migrées

| Ancienne Page | Nouvelle Page React | Status |
|---------------|-------------------|---------|
| `index.html` | `AuthPage.jsx` + `Dashboard.jsx` | ✅ Migré |
| `agents-chat.html` | `AgentsChat.jsx` | ✅ Migré |
| `github-integration.html` | `GitHubIntegration.jsx` | ✅ Migré |
| `memory-manager.html` | `MemoryManager.jsx` | ✅ Migré |
| Upload de fichiers | `FileManager.jsx` | ✅ Migré + Amélioré |

### 🆕 Améliorations Apportées

- **Navigation fluide** : SPA avec React Router
- **State management** : Context API pour l'auth
- **UX améliorée** : Loading states, feedback utilisateur
- **Responsive design** : Optimisé mobile/desktop
- **Performance** : Code splitting et optimisations
- **Maintenabilité** : Architecture modulaire React

## 🎨 Thème et Design

- **Design System** : Cohérent avec Tailwind CSS
- **Couleurs** : Palette primary (bleu) + couleurs sémantiques
- **Typography** : Inter font pour une meilleure lisibilité
- **Icons** : Lucide React pour des icônes modernes
- **Animations** : Transitions fluides et micro-interactions

## 🔐 Authentification

- **JWT Tokens** : Gestion automatique avec intercepteurs Axios
- **Refresh automatique** : Renouvellement transparent des tokens
- **Protection des routes** : Composant ProtectedRoute
- **Persistance de session** : LocalStorage pour la persistance

## 🌐 API Integration

Tous les services backend sont intégrés via `src/services/api.js` :

- **authService** : Authentification
- **vectorStoreService** : Gestion des documents
- **agentService** : Chat avec les agents IA
- **githubService** : Intégration GitHub
- **memoryService** : Gestion des mémoires
- **microserviceService** : Communication inter-microservices

## 📱 Responsive Design

- **Mobile First** : Design optimisé pour tous les écrans
- **Sidebar responsive** : Overlay mobile, fixe desktop
- **Layout adaptatif** : Grilles et composants flexibles
- **Touch friendly** : Interactions tactiles optimisées

## 🚀 Déploiement

1. **Build de production**
   ```bash
   npm run build
   ```

2. **Servir les fichiers statiques**
   ```bash
   npm run preview
   ```

3. **Déploiement**
   - **Vercel** : `vercel --prod`
   - **Netlify** : Drag & drop du dossier `dist/`
   - **Serveur web** : Servir le contenu de `dist/`

## 🔄 Utilisation avec l'ancien Backend

Ce frontend React est **100% compatible** avec le backend FastAPI existant. Aucune modification backend n'est nécessaire.

### Configuration des CORS

Assurez-vous que le backend autorise les requêtes depuis `http://localhost:3000` :

```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🐛 Dépannage

### Problème de CORS
```bash
# Vérifiez que le backend autorise localhost:3000
# Ou lancez avec --host pour exposer sur le réseau
npm run dev -- --host
```

### Erreurs de build
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Token expiré
Le système gère automatiquement le refresh des tokens. Si vous avez des problèmes :
```bash
# Vider le localStorage dans DevTools
localStorage.clear()
```

## 🚀 Prochaines Étapes

- [ ] Tests unitaires avec Vitest
- [ ] Tests E2E avec Playwright
- [ ] PWA avec service workers
- [ ] Internationalisation (i18n)
- [ ] Mode sombre
- [ ] Optimisations de performance avancées

---

## 👥 Migration Guide

Pour passer de l'ancien frontend au nouveau :

1. **Arrêter l'ancien serveur** (port 3000)
2. **Lancer le nouveau** : `cd frontend-react && npm run dev`
3. **Tester toutes les fonctionnalités**
4. **Backup de l'ancien** : `mv frontend frontend-legacy`
5. **Renommer le nouveau** : `mv frontend-react frontend`

Le nouveau frontend React offre une expérience utilisateur moderne tout en conservant la compatibilité avec le backend existant ! 🎉