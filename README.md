# Packets & Prayer Flags: Tenzin Choden's Portfolio

My personal portfolio website. I'm a Computer System and Network student at Jigme Namgyel Engineering College (JNEC), Bhutan.
It's built with plain **HTML, CSS and JavaScript**, with no frameworks or templates.

**Live site:** https://tenzin20039.github.io/portfolio/

## Design idea
The site combines my field (computer networks) with home (Bhutan):

- **Prayer flags (lungta)** hang across the sky. Their five colours are the colour palette for the whole site.
- The background looks like handmade **deh-sho paper**, and my photo is framed as a **Bhutanese postage stamp**.
- **Skills** are a network map, where little packets travel from me to each skill.
- **Education** is a mountain trail, and **contact** is an airmail postcard.

## Animations & interactive features
- My **name swings in letter by letter** like flags on a string. Hover a letter and it sways again.
- A waving **"Hello, I'm"** greeting.
- **Wind**: drifting wind streaks and gliding birds. Moving the mouse quickly makes a gust, and the flags near the cursor flap harder.
- **Toss lungta**: click the button or anywhere in the sky to throw paper prayer flags that drift away on the wind.
- **Parallax Himalayan ridges** that rise as you scroll.
- **Day/night switch**: the sun turns into a moon and stars appear. The choice is saved in `localStorage`.
- **Skill network map** (SVG) with moving packets. Hover or tap a skill to light up its route and see where I used it. On phones, skills show as tappable coloured tags.
- **Project filter** (Frontend / Backend), with cards that lift on hover.
- **Learning trail**: the path draws itself as you scroll, with a little hiker walking along it.
- **Postcard contact form**: validation with a shake on errors. When sent, the postcard flies away and the visitor's email app opens with the message ready.
- **Responsive** on desktop, tablet and mobile, with a hamburger menu.
- **Accessible**: semantic HTML, keyboard-focusable skill nodes, a skip link, and `prefers-reduced-motion` support.

## Structure
```
index.html     page content
style.css      design, themes, animations and responsive layout
script.js      flags & wind, lungta toss, name animation, skill map, theme, filter, form
image/         profile photo
```
