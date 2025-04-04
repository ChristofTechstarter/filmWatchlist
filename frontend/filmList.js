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
    table += `<tr class="clickable-row">
                  <td><input type="checkbox" value=${film.id} onclick="event.stopPropagation()"></input></td>
                  <td>${film.title}</td>
                  <td>${film.year}</td>
                  <td>${film.genre}</td>
               </tr>
                  <tr class="detail-row">
                  <td colspan="4">
                  <div class="detail-content">
                  hier soll der trailer angezeigt werden!
                </div>
            </td>
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
      addRowClickListeners();
    })
    .catch((error) => {
      console.error("Fehler beim Laden der Daten:", error);
      filmListContainer.innerHTML = "<p>Fehler beim Laden der Filmdaten!</p>";
    });
}

window.onload = LoadFilms;

function addRowClickListeners() {
  const rows = document.querySelectorAll(".clickable-row");
  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const next = row.nextElementSibling;
      if (next && next.classList.contains("detail-row")) {
        next.style.display =
          next.style.display === "table-row" ? "none" : "table-row";
      }
    });
  });
}
