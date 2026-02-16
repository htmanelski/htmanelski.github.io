---

layout: default

title: Photos

permalink: /photos/

---



\# Travel and Photography



I like to travel and take photos! Here are some of my favorites:



<div class="photo-gallery">
  {% for photo in site.data.photos %}
  <figure style="display: inline-block; text-align: center; margin: 10px;">
    <img src="/assets/images/travel/{{ photo.image }}" style="max-width: 400px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);" />
    <figcaption style="margin-top: 5px;">{{ photo.caption }}</figcaption>
  </figure>
  {% endfor %}
</div>



