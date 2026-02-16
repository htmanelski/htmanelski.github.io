---

layout: page

title: Photos

permalink: /photos/

---



\# Travel and Photography



I like to travel and take photos! Here are some of my favorites:



<div class="photo-gallery">

&nbsp; {% for photo in site.data.photos %}

&nbsp; <figure>

&nbsp;   <img src="/assets/images/travel/{{ photo.image }}" style="max-width: 400px; margin: 10px;" />

&nbsp;   <figcaption>{{ photo.caption }}</figcaption>

&nbsp; </figure>

&nbsp; {% endfor %}

</div>



