---

layout: default

title: Media

permalink: /media/

---



\# Media Appearances and Links



\## Blog Posts

<div style="padding: 0 15px;">

&nbsp; <ul style="list-style: none; padding: 0;">

&nbsp;   {% for post in site.data.external\_posts %}

&nbsp;   <li style="margin-bottom: 1rem;">

&nbsp;     <a href="{{ post.link }}" target="\_blank" style="font-weight: bold;">{{ post.title }}</a>

&nbsp;     <div style="font-size: 0.9rem; color: #666;">{{ post.source }} • {{ post.date }}</div>

&nbsp;   </li>

&nbsp;   {% endfor %}

&nbsp; </ul>

</div>



\## YouTube Interviews

<div style="padding: 0 15px;">

  <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">

    {% for video in site.data.videos %}

    <div style="max-width: 400px; margin-bottom: 1rem;">

      <iframe width="400" height="225" src="{{ video.embed }}" frameborder="0" allowfullscreen style="border-radius: 4px;"></iframe>

      <p style="margin: 0.5rem 0 0 0;">{{ video.caption }}</p>

    </div>

    {% endfor %}

  </div>

</div>



\## Professional Links

<div style="padding: 0 15px;">

  <ul style="list-style: none; padding: 0;">

    <li style="margin-bottom: 0.5rem;"><a href="https://www.linkedin.com/in/henry-manelski-a1a8b7125/" target="\\\_blank">LinkedIn Profile</a></li>

    <!-- Add more links here -->

  </ul>

</div>

