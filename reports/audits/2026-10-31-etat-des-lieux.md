# ggbrick : état des lieux avant les vagues 3 à 6

Date : 2026-10-31. Révision auditée : `ee386e3` (main après la PR #9), branche de session `claude/funny-cerf-5sbdf6`. Audit en lecture seule, aucun fichier du projet modifié.

## Méthode

Trois passes indépendantes sur le même périmètre : une passe principale (ce rapport), une passe Opus 5.5 (qui a aussi exécuté la suite de vérification) et une passe Sonnet 5.5 (lecture seule). Chaque constat retenu ci-dessous a été revérifié dans le code par la passe principale ; les constats des sous-agents que je n'ai pas pu confirmer, ou qui étaient faux, sont listés dans la section « Tri des rapports des sous-agents ».

Résultats des vérifications observés par la passe Opus :

| Commande | Résultat |
| --- | --- |
| `npm run lint` | passe |
| `npm run validate` | passe : 18 contextes, 426 rôles, 4 invariants, 2 196 vérifications de contraste, 0 échec |
| `npm test` | 40/40 |
| `npm run check` | 0 erreur, 0 avertissement |
| `npm run test:ssr` | 69/69, mais 44 s et des avertissements « Port 24678 is already in use » (chaque fichier de test démarre un serveur Vite avec HMR) |
| `npm run test:browser` | 118 réussis, 1 échec reproductible en local (voir B6), 10,8 min avec un seul worker |

## 1. Résumé exécutif

Le projet est un design system 0.x d'une rigueur inhabituelle. La chaîne de tokens est réelle et testée, les contrats sont vérifiés mécaniquement dans tous les contextes, et les 15 composants Svelte sont soignés sur l'accessibilité, les cibles de 44 px, les couleurs forcées et le mouvement réduit. Les tests navigateur comparent les styles calculés aux tokens résolus, lisent l'arbre d'accessibilité et passent axe en clair et en sombre.

Les faiblesses sont ailleurs. L'architecture n'a pas encore rencontré un overlay : rien n'est décidé sur les portails et le thème, l'échelle des layers contredit les overlays imbriqués, le typage des rôles de contrat ne sait pas lier un `layer.*`, et il manque une famille de couleurs « élément sélectionné ». Le mécanisme d'approbation par digest n'est pas vérifié et a déjà dérivé. Le paquet n'est pas publiable en l'état. Le processus coûte cher par composant, surtout côté Figma, et le dépôt est difficile d'accès pour un développeur humain.

Maturité : environ 7/10 pour les composants feuilles et formulaires livrés ; 4/10 pour la préparation des vagues 3 à 6. Le socle est bon ; il faut une courte phase de décisions et d'outillage avant d'écrire le premier contrat de la vague 3.

## 2. Points forts

1. **Chaîne de tokens propre et testée.** Précédence des sources explicite (`tooling/lib/tokens.ts`), traces de provenance, résolution atomique des alias avec détection des types. `tests/tokens.test.ts` modélise la cascade navigateur et la compare aux cartes résolues dans les 18 contextes. Palette OKLCH déterministe (`tooling/generate-palette.ts`). Un overlay de marque tient en une dizaine d'alias.
2. **Inventaire sémantique contrôlé.** `tooling/check-foundations.ts` vérifie 426 rôles par axe, les invariants dérivés et les paires de contraste ; les couleurs sémantiques sont des alias uniquement.
3. **Contrats précis et validés.** Schéma Ajv strict, chemins de tokens paramétrés, couverture vérifiée dans chaque contexte, règles concrètes (précédence des états, nom accessible, couleurs forcées). Les bindings générés (`tooling/build-svelte.ts`) donnent des unions typées et des variables CSS par composant.
4. **Implémentations Svelte cohérentes.** Mêmes conventions partout : `ggb-<id>`, `data-*`, callbacks en minuscules, `$props.id()`, `$bindable`, échec identique serveur et navigateur sur un label vide. Détails soignés : garde `auxclick` sur un lien en chargement, cible 44 px par pseudo-élément, outline transparent pour les couleurs forcées, cercles SVG pour Switch et Radio, `:dir(rtl)` sur Switch, propriétés logiques partout (les quatre `left/top: 50%` sont commentés et volontaires).
5. **Tests profonds.** Styles calculés contre les tokens résolus, arbre d'accessibilité via CDP, axe clair et sombre, ordre de tabulation, couleurs forcées, mouvement réduit, SSR par composant, hydratation de chaque exemple du site. Les preuves ne s'écrivent qu'avec `GGB_EVIDENCE=1` et la CI exige un arbre propre.
6. **Documentation uniforme.** 15 pages dans le même ordre de sections, imposé par `build-svelte.ts` ; un guide fondations qui nomme un token inexistant fait échouer la génération ; les exemples live sont compilés par le site. Les tableaux d'accessibilité distinguent composant et intégration sans revendiquer une conformité.
7. **Filets de sécurité du processus.** `verify:generated` détecte toute dérive des fichiers générés, la CI construit le site et vérifie un paquet consommé, la règle « jamais affaiblir un test en silence » est écrite dans AGENTS.md, les décisions sont datées.
8. **Les tokens des vagues 3 à 6 existent déjà** : `layer.*` (8 niveaux), `shadow.{raised,overlay,modal}`, `color.surface.{overlay,scrim,inverse}`, `radius.overlay`, `opacity.scrim`, `motion.duration.*`, `motion.easing.*`, `size.avatar.*`. Ils sont émis en CSS mais aucun composant ne les consomme encore.

## 3. Points faibles et risques, par impact

### A. À décider ou corriger avant le premier contrat de la vague 3

**A1. Portails et thème : aucune décision.** Le thème repose sur `data-ggb-brand`, `data-ggb-appearance` et `data-ggb-density` posés sur un ancêtre, avec surcharge par sous-arbre documentée et testée. Bits UI porte le contenu des overlays dans `body`, donc un Popover, un Menu, un Dialog ou un Tooltip ouvert depuis un panneau sombre, une autre marque ou une densité compacte s'affichera avec le thème racine. Aucune mention de « portal » dans `authoring/`, `decisions.md` ou les tests. Options : recopier les trois attributs sur le conteneur porté, cible de portail ggbrick dans la racine thématisée, ou restreindre les surcharges à `<html>`. La contrainte « un changement de marque restate appearance et density » s'applique aussi au contenu porté.

**A2. Échelle des layers inversée pour les overlays imbriqués.** `foundations/tokens/base/primitives/layers.tokens.json` : dropdown 1000 < sticky 1100 < overlay 1200 < modal 1300 < toast 1400 < tooltip 1500. Un Select ou un Menu ouvert dans un Dialog passerait derrière lui. À décider avec le contrat Dialog : contexte d'empilement par modal, top layer natif (`<dialog>`, attribut `popover`) ou nouvelle échelle. L'échelle n'est consommée par aucun composant, donc jamais testée.

**A3. Le typage des rôles ne sait pas lier un `layer`.** `tooling/lib/contract.ts:94-102` : seuls les rôles finissant par `Opacity` sont typés `number` ; tout rôle non reconnu est un `dimension`. Un rôle `layer` ou `zIndex` lié à `layer.modal` (type `number`) échoue à la validation. La convention repose sur le nom : `surface`, `content`, `border` ou suffixe `Color`. Un rôle `itemSurface` serait typé dimension en silence. Correction : ajouter `layer|zIndex`, ou mieux un `type` explicite optionnel par rôle.

**A4. Famille de couleurs manquante pour les éléments sélectionnés ou surlignés.** Les familles d'apparence sont surface, content, border, focus, selection (sélection de texte), action, field, choice, status. Rien pour un item de menu surligné, une option de listbox, un onglet actif, une page courante, un bouton pressé. `color.action.*` n'a pas d'état `selected`. Menu, Select, Combobox, Tabs, Pagination et Toolbar rouvriraient la porte tokens un par un : à concevoir une fois, avant les contrats de la vague 3.

**A5. Élévation inopérante en sombre.** Dans `appearance.dark.tokens.json`, `color.surface.raised` et `color.surface.default` valent tous deux `neutral.900` ; les ombres sont définies uniquement dans `common.tokens.json`, donc identiques en clair et en sombre. Une carte ou un en-tête collant sont indiscernables du fond en sombre. Seule `surface.overlay` (neutral.800) se détache. À régler avant Popover, Dialog et Toast : ombres par apparence ou surface raised plus claire en sombre.

**A6. Les contrats n'expriment ni composants composés ni données structurées.** Le seul outil de composition est `accepts`, et un enfant ne reçoit les valeurs du parent que comme « états » (`radio/contract.json` où `size` est un état). Menu (item, item à cocher, séparateur, groupe, sous-menu), Tabs, Dialog, Select vont multiplier contrats, statuts et portes. Pas de type de prop pour une liste d'objets. La vérification de contraste ne connaît que `surface`, `content`, `border`, `focusColor` : un overlay à plusieurs surfaces n'aurait aucune preuve de contraste. Décider une convention de composant composé et des paires de contraste explicites.

**A7. Règle « autonome et copiable » : fixer une politique d'exception.** Aucun import entre dossiers aujourd'hui, et la règle coûte déjà : `FieldContext` déclaré six fois, gardes click/auxclick identiques dans Button et IconButton, bloc « label non vide ou throw » dans une douzaine de composants, CSS visuellement caché dans six fichiers, cible 44 px dans quatre, chemins SVG Phosphor recopiés. Les vagues 3 et 4 partagent bien plus : panneau flottant (surface, ombre, radius, layer, entrée/sortie, thème dans le portail), style des items, spinner, propagation du thème, roving focus. `architecture.md` autorise déjà un module `src/lib/` copiable ; alternative : faire écrire par `build-svelte.ts` les morceaux partagés dans chaque dossier en `*.generated.ts`. Décider avant Popover.

**A8. Mouvement d'entrée et de sortie : aucun mécanisme choisi.** Les composants n'utilisent que des transitions CSS. Bits UI s'appuie sur des animations CSS liées à `data-state`. Rien n'est décidé entre keyframes, transitions Svelte avec `forceMount` et `@starting-style`, ni sur la politique de mouvement réduit pour les déplacements. La durée du spinner est codée en dur (800 ms dans `button.css:169` et `icon-button.css:111`).

### B. À corriger avant la première release

**B1. Les digests d'approbation ne sont pas vérifiés et ont dérivé.** `tooling/digest.ts` ne fait qu'imprimer ; rien ne compare les hachages des statuts aux fichiers. Recalcul sur les 226 digests des 16 fichiers de statut : les approbations du statut tokens sont à jour (les hachages anciens y sont dans le journal `pendingChanges`, ce qui est légitime). En revanche : les 15 approbations de parité Figma pointent des `figma-spec.md` et `ledger.json` modifiés ensuite par les commits de réorganisation de la bibliothèque ; l'approbation d'implémentation de Checkbox couvre `Checkbox.svelte`, `types.ts` et `contract.generated.ts` modifiés le 28 octobre pour CheckboxGroup (commit 08b561c) sans re-enregistrement ; celle de Field couvre `types.ts` modifié le 30 octobre (284bff0). La règle « une approbation est invalidée quand un chemin listé change » est donc contredite par les propres commits du dépôt. Ajouter `check:approvals` dans `verify` (échec sur contrat, sources et tokens ; avertissement sur spec et ledger), ou cesser de hacher ce qui change légitimement.

**B2. Dérive contrat / implémentation / docs non vérifiée.** Seuls les types d'énumération et `defaults` sont générés. Les props de `types.ts`, leur JSDoc et les tableaux API des pages sont écrits à la main, trois fois. Aucun test ne compare props, événements et défauts du contrat aux props Svelte ni au tableau documenté.

**B3. Paquet non publiable.** `packages/svelte/package.json` : `private: true`, exports de `./src/index.ts` brut avec des spécificateurs `.js` qui pointent sur des `.ts` (ne fonctionne qu'avec un bundler type Vite ; le TypeScript du consommateur typera les sources sous ses propres options), `bits-ui` épinglé exactement en dépendance (duplication forcée si l'application a une autre version). Le « packed consumer check » de la CI ne fait qu'un `svelte/compiler.compile()` d'une ligne d'import, qui ne résout rien. Utiliser `@sveltejs/package`, une plage ou une peer dependency pour Bits UI, et un vrai build consommateur. Pas de LICENSE, CHANGELOG ni CONTRIBUTING.

**B4. CSS des composants non surchargeable par instance.** Les sélecteurs générés comme `.ggb-button[data-intent="accent"][data-appearance="solid"]` ont une spécificité (0,3,0) ; une classe consommateur perd. Aucun `@layer` dans le paquet. Envelopper dans `@layer ggb` ou `:where()`.

**B5. Références mortes pour les agents consommateurs.** `documentation/index.json` donne `contract: foundations/components/…` alors que le paquet livre `contracts/<id>.json`. Les 15 pages disent « The review page `examples/<id>/App.svelte` covers every case » et `examples/` n'est pas livré.

**B6. Test navigateur flaky.** `tests/browser/icon-button.spec.ts:143` mesure `getBoundingClientRect()` du SVG du spinner pendant sa rotation (helper `measure`, lignes 50 à 66) : attendu 20 px, obtenu 22,44 px, 5 échecs sur 5 en local, vert en CI selon le timing. Le test est faux, pas le composant. Mettre l'animation en pause ou mesurer le conteneur.

**B7. Couverture navigateur.** Chromium seul, pas de WebKit ni Firefox, alors que des propriétés sensibles sont utilisées (`text-box: trim-both`, transitions sur `cx`/`cy`/`r`, `rgb(from currentColor …)`, `1lh`). Aucune comparaison de captures (`toHaveScreenshot` absent) : pas de protection contre les régressions visuelles avant la passe 4b. Suite à un worker, 11 min. Tests SSR qui matchent du HTML brut par regex sensible à l'ordre des attributs.

**B8. Volume des preuves.** `reports/` pèse 65 Mo pour 281 fichiers (environ 4,3 Mo par composant) ; `parity.json` et `computed.json` font 1 à 5,5 Mo chacun ; 122 PNG ; `.git` déjà à 64 Mo après 164 commits. Personne ne relit un diff de 5 Mo. Garder en git un hachage et un résumé, déposer les enregistrements complets en artefacts CI ou LFS.

**B9. Débats d'accessibilité acceptés par décision.** Le slot `trailing` de Button est `aria-hidden` (`Button.svelte:143`), donc un Counter dans un Button n'est pas annoncé, et c'est le motif montré dans la doc. Un Shortcut `plain` dans un Button reste sous 4,5:1 (exception dans `docs-site.spec.ts`). Les suffixes de Link sont en anglais codé en dur (`destination.ts`, surchargeable par `destinationLabel`). Button en chargement n'a que `aria-busy`, aucun texte. À réexaminer lors de la passe visuelle 4b, avec une politique i18n.

**B10. Surcharges du comportement de Bits UI.** RadioGroup réimplémente la sélection à la flèche et l'entrée de focus (`focused.click()`, drapeau pointeur avec `setTimeout`) ; Switch émule readonly en annulant les événements. Documenté et épinglé, donc maîtrisé aujourd'hui, mais chaque montée de version de Bits UI risque une dérive silencieuse, et Tabs, Toolbar, Menu, Select en demanderont davantage. Écrire une politique (adapter le contrat à Bits ou surcharger) et un playbook de montée de version.

**B11. Troncature JavaScript du label de Button.** `Button.svelte:63-112` : canvas, `measureText`, ResizeObserver sur l'élément et son parent, deux `flushSync` par ajustement. Layout synchrone forcé par bouton ; une Table de la vague 5 avec des actions par ligne multipliera le coût. Le gain sur `text-overflow` natif est l'ellipse au pixel. Le mesurer, documenter le coût, ou le rendre opt-in.

**B12. Lancer une exception au rendu.** Chaque composant nommé lance une erreur sur un label vide. Côté serveur, c'est toute la page qui tombe ; côté client, seul `<svelte:boundary>` l'attrape. Un label momentanément vide (i18n asynchrone, CMS) fait tomber la page. Choix cohérent et documenté ; à confirmer en connaissance de cause, ou passer à une erreur en développement et un avertissement avec repli en production.

### C. Améliorations

- `build-svelte.ts:31` écrit le littéral `<family>` dans l'en-tête de chaque `contract.generated.ts`.
- `authoring/contract-format.md:3` dit encore « limité à enum, boolean et string » alors que `number` et `list` existent ; `apps/docs/README.md:3` renvoie à une « open decision 3 » qui n'existe plus ; la ligne vague 2 du roadmap dit « pull request to main pending » alors que la PR #8 est fusionnée.
- `build-tokens.ts` (522 lignes) mélange validation, contraste, manifeste Figma et attentes ; la fonction de scopes (ligne 257) est un ternaire imbriqué sur quinze niveaux. Le contraste des bordures et du focus ignore l'alpha.
- `color.palette.info` et `color.palette.accent` aliasent tous deux `blue` en base.
- `opacity.scrim` et `color.surface.scrim` se recouvrent : choisir un usage canonique avant Dialog.
- `npm run validate` n'exécute jamais `--dependencies` : une faute dans un `accepts` de Field n'est pas détectée. Le `accepts` de Field devra être édité et ré-approuvé pour chaque nouveau contrôle.
- `field.register()` n'a pas de désinscription.
- Les règles des contrats sont des tableaux de prose sans identifiant : les tests ne peuvent pas les citer.
- Trois surfaces de démonstration par composant à maintenir : `examples/` (6 000 lignes), `apps/docs/src/playgrounds/`, blocs live des pages.
- Pas de stylelint, qui serait le garde naturel de la règle « tokens uniquement dans le CSS » et des propriétés logiques.
- CI : un seul job séquentiel, `generate` lancé deux fois, site construit deux fois, pas de cache Playwright, pas de bloc `permissions`, pas de Dependabot. Dépendances récentes (Svelte 5.57.1, Bits UI 2.19.3, Astro 7.3.8) mais quelques majeures en retard (Vite 8, TypeScript 7, ESLint 10).
- `wrangler.jsonc` racine est une copie manuelle de `apps/docs/wrangler.jsonc`.

## 4. Scalabilité pour les vagues 3 à 6

| Domaine | État | Manque |
| --- | --- | --- |
| Portails | non conçu | thème perdu dans le portail (A1), comportement SSR du portail, test d'un sous-arbre thématisé |
| Empilement | 8 tokens, inutilisés | dropdown < modal (A2), rôle `number` impossible (A3), top layer natif non évalué |
| Élévation | 3 ombres, non dépendantes de l'apparence | raised = default en sombre (A5) |
| Scrim et modal | tokens présents | usage canonique, verrou de défilement, `inert`, retour du focus : aucune politique |
| Mouvement | transitions uniquement | entrée/sortie (A8), distances, spinner codé en dur |
| Gestion du focus | roving focus dans RadioGroup seulement, en surcharge de Bits | politique Bits vs surcharge pour Tabs, Toolbar, Menu, Accordion, Pagination |
| Menus, Select, Combobox | pas de modèle d'items | famille « selected » (A4), composants composés et données structurées (A6), typeahead, virtualisation |
| Expressivité des contrats | suffisante pour les feuilles | champs structurés pour `open`, `modal`, `placement`, `dismiss`, `initialFocus`, raccourcis, rôles ARIA ; sinon les règles en prose dépasseront les 14 lignes actuelles de Switch |
| Composition entre dossiers | snippets et contextes seulement | décision module partagé (A7) |
| Tooling | générique, bon | la partie Figma ne suit pas (section 6) |
| Tests | profonds, Chromium, lents | clic extérieur, Échap, retour du focus, empilement, thème dans le portail ; environ 10 specs de plus avec des balayages de 300 s : sharder |
| Vague 6 | décision locale notée au roadmap | bibliothèque de dates ou Intl, modèle de calendrier, tests RTL avant les contrats |

## 5. Processus

**Ce qui aide.** Les trois portes forcent une vraie revue du rendu. Les statuts permettent à une session neuve de reprendre sans la conversation. Les skills sont courtes (188 lignes au total) et renvoient à `authoring/`. Les générateurs déterministes font le mécanique. La règle « jamais affaiblir un test en silence » est saine. Les preuves à la demande ont supprimé le bruit des arbres sales. La profondeur des tests est un résultat direct du processus.

**Ce qui pèse.** Environ quinze artefacts par composant (contrat, statut de 14 à 39 Ko, dossier Svelte, page d'exemple, playground, page doc, test SSR, spec navigateur, `computed.json`, `ssr.json`, captures, scripts Figma master, spec et parité, ledger, parité JSON). Les statuts mélangent champs machine et récit de conversation avec citations. Les digests non vérifiés donnent un faux sentiment de contrôle. Figma représente 52 commits sur 164, dont une bonne part de polissage de mise en page (couvertures, en-têtes, liens) alors que les spécifications ne sont, par décision du 30 octobre, jamais une source pour les agents ; ces `figma-spec.md` vivent pourtant sous `foundations/`, décrit comme « sources de vérité ». 147 commits sur 164 sont signés Claude : la capacité de relecture est concentrée sur un seul humain aux portes.

**Pour un développeur humain.** Le README liste les commandes, mais changer l'API de Button suppose de lire AGENTS.md, decisions, workflow, skills et statut, puis de re-enregistrer des digests. Pas de CONTRIBUTING, pas de chemin léger pour corriger un bug hors de la machinerie des portes.

**Rééquilibrage proposé.** Garder : les trois portes, les approbations par digest une fois vérifiées, les générateurs, la règle d'arbre propre. Alléger : le format des statuts (séparer machine et récit), le nombre de surfaces de démo, le polissage des spécifications Figma. Automatiser : contrat ↔ props ↔ docs, détection des approbations périmées, résumés de preuves au lieu de fichiers de plusieurs Mo. Ajouter : un CONTRIBUTING d'une page.

## 6. Figma (jugé sur les artefacts, sans accès au fichier)

- La parité des tokens est automatisée et solide : `tooling/check-figma.ts` hache la résolution native de chaque variable sémantique par contexte et la compare aux attentes générées. Les variables miroitent les alias sources.
- La parité des composants est manuelle : `authoring/adapters/figma/` contient environ 15 000 lignes et 770 Ko de scripts Plugin API écrits à la main par composant (`forms-spec.plugin.js` seul fait 90 Ko), hors lint et hors tests, plus un `*-parity-report.mjs` par famille. Rien ne tourne en CI ; la seule détection de dérive est « un agent avec le MCP Figma relance le script ».
- Les masters ne sont pas générés depuis le contrat : chaque changement de contrat signifie éditer un script sur mesure. C'est la partie la moins scalable du système pour des overlays à nombreux états et instances imbriquées. Piste : générer depuis le contrat les 80 % mécaniques (jeux de variantes, bindings) et garder le code sur mesure pour le reste ; factoriser le rapporteur de parité en un outil piloté par le contrat.
- Le ledger par composant et la règle « ne jamais deviner un ID » sont de bonnes mitigations. Publication, accès et versionnage de la bibliothèque restent la décision ouverte n° 2.

## 7. Gains rapides

1. Typer `layer|zIndex` en `number` dans `expectedRoleType` (`tooling/lib/contract.ts:100`), avec un test.
2. `check:approvals` dans `verify` : re-hacher les digests, échouer sur contrat, sources et tokens, avertir sur spec et ledger ; re-enregistrer Checkbox et Field.
3. Rendre le test du spinner déterministe (`icon-button.spec.ts:50-66` et `:143`).
4. `hmr: false` dans `tests/ssr/helpers.ts` pour supprimer les conflits de port.
5. Corriger les textes périmés : `build-svelte.ts:31`, `contract-format.md:3`, `apps/docs/README.md:3`, ligne vague 2 du roadmap, les 15 références à `examples/` et le champ `contract` de `index.json`.
6. `bits-ui` en plage ou peer dependency ; vrai build consommateur en CI ; LICENSE même provisoire ; CONTRIBUTING d'une page.
7. `@layer ggb` ou `:where()` autour du CSS des composants.
8. `--dependencies` dans `npm run validate`.
9. Un projet Playwright WebKit ou Firefox sur les specs fumée et clavier ; balayages de 300 s en Chromium seul ; sharding.
10. Cesser de committer les corps de `parity.json` et `computed.json` ; hachage plus résumé, enregistrements complets en artefact CI.
11. Stylelint contre les couleurs et longueurs littérales dans le CSS des composants.
12. Une page de décisions avant le premier contrat de la vague 3 : portails et thème, top layer vs z-index, élévation en sombre, famille « selected », composants composés, module partagé, mécanisme d'entrée/sortie.

## 8. Tri des rapports des sous-agents

Retenu et vérifié : l'essentiel des deux rapports converge (portails, layers, typage des rôles, famille « selected », duplication, digests, paquet, Figma, volume des preuves). Opus a en plus identifié l'élévation en sombre, le test flaky, la spécificité CSS, le `<family>` littéral et le roadmap périmé ; Sonnet a en plus relevé `info` = `accent`, le mécanisme d'entrée/sortie et le double scrim. Tout cela est confirmé dans le code.

Écarté ou nuancé :
- Sonnet : « le statut tokens a 15 digests périmés sur 47, dont `inventory.json` ». Faux : les trois approbations du statut tokens sont à jour ; les anciens hachages sont ceux du journal `pendingChanges`, qui a vocation à les conserver.
- Sonnet : « le digest du contrat de Counter est périmé ». Non reproduit par mon recalcul.
- Sonnet : « aucun test RTL » contre Opus : « un peu de RTL ». Non tranché ; je n'en fais pas un constat.
- Sonnet : « Button enveloppe Bits `Button.Root` pour peu de gain ». Opinion défendable, non retenue comme défaut.
- Opus : la troncature de Button et l'exception au rendu sont des décisions délibérées et documentées ; je les présente comme des coûts à confirmer (B11, B12), pas comme des défauts.

## 9. Non vérifié

- Le rendu réel du fichier Figma et l'état de la bibliothèque (aucun accès dans cette session).
- Le comportement sous lecteur d'écran : aucun test de technologie d'assistance n'existe, ce que la documentation dit honnêtement.
- La reproductibilité du test flaky en CI : observé en local par la passe Opus, vert au dernier run CI.
