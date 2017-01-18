<ul>
  {% for article in articles.results %}
    <li>{{ article.title }}</li>
  {% endfor %}
</ul>

Total:{{ articles.total }}
