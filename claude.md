# Contexte du Projet : Lyon Relais

## 📝 Description
Lyon Relais est une application web (Progressive Web App / SPA) orientée Mobile-First. Elle permet aux utilisateurs de consulter la disponibilité des Parcs Relais (P+R) TCL et de suivre les prochains passages (Bus, Métro, Tramway) en temps réel à Lyon.

## 🛠️ Stack Technique
* **Framework :** React 18 (Généré avec Vite)
* **Styling :** Tailwind CSS
* **Icônes :** `lucide-react`
* **Cartographie :** `react-leaflet` et `leaflet`
* **Déploiement :** Netlify

## 📜 Règles de Développement (Directives pour l'IA)
1.  **React & Hooks :** * Utilise uniquement des composants fonctionnels.
    * Sépare la logique métier de l'interface en utilisant des Custom Hooks dans le dossier `/src/hooks/` (ex: `useParkings.js`, `useSchedules.js`).
    * Pense à optimiser les rendus avec `useMemo` et `useCallback` si nécessaire.
2.  **Design & CSS (Tailwind) :**
    * Génère des interfaces modernes, épurées et "Mobile-First".
    * L'application doit ressembler à une application native (iOS/Android).
    * Prends en compte la "Safe Area" (l'encoche des smartphones) en utilisant des classes comme `pt-[max(1rem,env(safe-area-inset-top))]`.
3.  **Gestion des API (Grand Lyon) :**
    * Les appels API se font via `fetch` de manière asynchrone avec gestion des erreurs et des états de chargement (`loading`, `error`).
    * Pour les API nécessitant une authentification (comme *datapusher* pour les passages temps réel), utilise l'authentification "Basic" en encodant les identifiants avec `btoa()`.
4.  **Variables d'Environnement :**
    * **TRÈS IMPORTANT :** Le projet utilise Vite. Les variables d'environnement doivent IMPÉRATIVEMENT être appelées avec `import.meta.env.VITE_NOM_VARIABLE` et non `process.env`.
5.  **Robustesse :**
    * Prévois toujours des "Skeleton Loaders" pendant les appels API.
    * Gère systématiquement les "Empty States" (listes vides, recherches infructueuses) avec des messages clairs et des icônes.

## 📁 Architecture du projet
* `/src/components/` : Composants UI réutilisables (Header, Navigation, Cards, Maps).
* `/src/hooks/` : Logique de récupération de données et gestion d'états complexes.
* `/public/` : Assets statiques (icônes, manifest).