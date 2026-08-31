---
layout: null
title: Photos
permalink: /photos/
---
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Travel photography by planetary scientist Henry Manelski."><title>Photos — Henry Manelski</title><link rel="stylesheet" href="{{ '/assets/css/portfolio-pages.css' | relative_url }}"></head>
<body>
<nav class="topbar shell" aria-label="Page navigation"><a class="brand" href="/">Henry Manelski</a><div class="topbar-links"><a href="/">Research</a><a href="/media/">Media</a><a href="/photos/" aria-current="page">Photos</a><a href="#contact">Contact</a><span class="language-switch" aria-label="Language"><strong>EN</strong><a class="language-link" href="/de/" lang="de">DE</a></span></div></nav>
<header class="hero shell"><p class="eyebrow">Photography</p><h1>Places worth remembering.</h1><p class="hero-copy">I like to travel and take photographs with my ancient DSLR camera. Here are a few of my favorites.</p></header>
<main class="section"><div class="shell"><div class="gallery">{% for photo in site.data.photos %}<figure><img src="{{ '/assets/images/travel/' | append: photo.image | relative_url }}" alt="{{ photo.caption | escape }}" loading="lazy"><figcaption>{{ photo.caption }}</figcaption></figure>{% endfor %}</div></div></main>
<section class="contact" id="contact"><div class="shell"><h2>Interested in the chemistry of other worlds?</h2><p class="contact-copy">I am always happy to discuss planetary spectroscopy, mission science, laboratory collaborations, and new research opportunities.</p><div class="contact-links"><a href="mailto:h.manelski@tum.de">h.manelski@tum.de</a><a href="/assets/Henry_Manelski_Resume_EN.pdf">Résumé (PDF)</a><a href="https://scholar.google.com/citations?user=M-0PdwYAAAAJ&amp;hl=de&amp;oi=ao">Google Scholar</a></div></div></section><footer class="shell">© 2026 Henry Manelski</footer>
</body></html>
