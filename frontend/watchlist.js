const watchListFormular = document.getElementById("watchListFormular");
const contentContainer = document.getElementById("content");

const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const formularAnswerContainer = document.getElementById("formularAnswerContainer");




watchListFormular.addEventListener("submit", (event) => { // Event-Listener für das Formular
    event.preventDefault(); //bedeutet, dass die Seite nicht neu geladen wird

    if (!usernameInput.value && !passwordInput.value) {
        return (formularAnswerContainer.innerHTML =
            "<p style=`color:red`>Du hast nicht alle Felder ausgefüllt!</p>");
    }

    fetch("http://localhost:5005/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: usernameInput.value,
            password: passwordInput.value,
        }),
    })
        .then((res) => res.json()) // ← na Promise od fetch
        .then((data) => {
            let watchList = data.userWatchlist


            contentContainer.innerHTML = convertFilmListToHtml(watchList); // ← na Promise od fetch
            //  formularAnswerContainer.innerHTML = "<p style='color: green'>Hallo, es gibt eine Verbindung mit Backend!!</p>";
            // const deleteButton = document.querySelectorAll(".deleteButton"); // das ist die Klasse, die wir in der Funktion convertFilmListToHtml definiert haben

            attachDeleteListeners()
        });


})


function attachDeleteListeners() {
    const deleteButton = document.querySelectorAll(".deleteButton");

    deleteButton.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            const filmID = btn.getAttribute("data-id");

            fetch("http://localhost:5005/usersWatchlist", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: usernameInput.value,
                    password: passwordInput.value,
                    movieId: filmID,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data)
                    let updatedWatchList = data.userWatchlist;
                    contentContainer.innerHTML = convertFilmListToHtml(updatedWatchList);
                    attachDeleteListeners();
                });
        });
    });
}




function convertFilmListToHtml(filmList) {
    let table = `<table border="1">
                    <thead>
                      <tr>
                        <th>Titel</th>
                        <th>Jahr</th>
                        <th>Genre</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>`;

    filmList.forEach((film) => {
        table += `<tr>
                    <td>${film.title}</td>
                    <td>${film.year}</td>
                    <td>${film.genre}</td>
                    <td>
                    <button class="deleteButton" data-id="${film.id}">Delete</button>
                    </td>
                 </tr>`;
    });

    table += `</tbody></table>`;
    return table;
}


