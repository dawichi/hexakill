<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<!-- ------------------------------------------------------------------------------------------------------------------------ -->

<h1 align="center">Hexakill</h1>

<div align="center">
  <img src="https://img.shields.io/badge/framework-sveltekit-orange" />
  <img src="https://img.shields.io/badge/language-typescript-blue" />
  <img src="https://img.shields.io/badge/styles-tailwindcss-ff69b4" />
</div>

<p align="center">
   RPG Game made with Sveltekit and Typescript!
</p>

<p align="center">
  🎉 Check it on <a href="https://hexakill.vercel.app" target="_blank">hexakill.vercel.app</a> 🎉
</p>

Hexakill is an unfinished single-player browser RPG. The current `main` branch is an older SvelteKit implementation being documented and evaluated for a future rewrite.

### Development

The repository currently has no committed lockfile and its legacy dependency/tooling setup is not reproducible without the documented workaround. Start with [the project documentation](docs/README.md), especially [agent instructions](docs/AGENTS.md) and [operations](docs/operations.md), before changing code.

The intended commands are `npm run dev`, `npm run check`, `npm run lint`, and `npm run build`; their current observed failures and diagnostic alternatives are recorded in [docs/operations.md](docs/operations.md).

### Repository structure

-   `src/routes/` — SvelteKit document shell and single route.
-   `src/lib/views/` — game screens.
-   `src/lib/components/` — reusable UI and feature components.
-   `src/lib/models/`, `src/lib/services/`, `src/lib/config/`, `src/lib/data/`, `src/lib/types/` — current game implementation boundaries.
-   `static/` — images, music, sound effects, favicon, and robots file.
-   `docs/` — current architecture, rewrite analysis, standards contract, operations, and prioritized TODOs.
-   `rewrite/angular-prototype/` — isolated Angular 21 rewrite prototype; see its [README](rewrite/angular-prototype/README.md) for commands and scope.

### How to play

1. 🧍 Pick your character between 3 available.
2. 👾 Fight with +12 different enemies with their own stats and play style.
3. ⚔ Defeat enemies to earn gold and level up your character.
4. 🗡 Buy items, potions and unlock powerups to increase your stats and survive.
5. 🏆 Reach the highest level possible without dying!

---

![showcase](https://raw.githubusercontent.com/Dawichi/hexakill/main/showcase.png)
![showcase](https://raw.githubusercontent.com/Dawichi/hexakill/main/showcase2.png)

<!-- ------------------------------------------------------------------------------------------------------------------------ -->
<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[hexakill-url]: https://hexakill.vercel.app

<!-- HEADER STUFF -->

[contributors-shield]: https://img.shields.io/github/contributors/dawichi/hexakill.svg?style=for-the-badge
[contributors-url]: https://github.com/dawichi/hexakill/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/dawichi/hexakill.svg?style=for-the-badge
[forks-url]: https://github.com/dawichi/hexakill/network/members
[stars-shield]: https://img.shields.io/github/stars/dawichi/hexakill.svg?style=for-the-badge
[stars-url]: https://github.com/dawichi/hexakill/stargazers
[issues-shield]: https://img.shields.io/github/issues/dawichi/hexakill.svg?style=for-the-badge
[issues-url]: https://github.com/dawichi/hexakill/issues

<!-- IMAGES -->

[showcase-1]: showcase.png

<!-- TECH STACK -->

[Svelte]: https://img.shields.io/github/languages/top/dawichi/hexakill?style=for-the-badge
[Svelte-url]: https://kit.svelte.dev/
