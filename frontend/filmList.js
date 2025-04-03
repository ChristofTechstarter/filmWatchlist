const filmListContainer = document.getElementById("filmList");

function convertFilmListToHtml(filmList) {
  let table = `<table border="1">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Titel</th>
                      <th>Jahr</th>
                      <th>Genre</th>
                    </tr>
                  </thead>
                  <tbody>`;

  filmList.forEach((film) => {
    table += `<tr>
                  <td><input type="checkbox" value=${film.id}</input></td>
                  <td>${film.title}</td>
                  <td>${film.year}</td>
                  <td>${film.genre}</td>
               </tr>`;
  });

  table += `</tbody></table>`;
  return table;
}

function LoadFilms() {
  fetch("http://localhost:5005/films")
    .then((res) => res.json())
    .then((data) => {
      filmListContainer.innerHTML = convertFilmListToHtml(data);
    })
    .catch((error) => {
      console.error("Fehler beim Laden der Daten:", error);
      filmListContainer.innerHTML = "<p>Fehler beim Laden der Filmdaten!</p>";
    });
}

window.onload = LoadFilms;
