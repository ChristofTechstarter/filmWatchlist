const filmListAddForm = document.getElementById("filmListAdd");

const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const filmListAnswerContainer = document.getElementById("filmListAnswer");

filmListAddForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!usernameInput.value || !passwordInput.value) {
    return (filmListAnswerContainer.innerHTML =
      "<p style='color: red'>Du hast nicht alle Felder ausgefüllt!</p>");
  }
  // Alle ausgewählten Checkboxen erfassen
  const checkedFilms = Array.from(
    document.querySelectorAll("input[type='checkbox']:checked")
  ).map((checkbox) => parseInt(checkbox.value));

  if (checkedFilms.length === 0) {
    return (filmListAnswerContainer.innerHTML =
      "<p style='color: red'>Du hast keine Filme zum hinzufügen markiert!</p>");
  }

  fetch("http://localhost:5005/films", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: usernameInput.value,
      password: passwordInput.value,
      filmID: checkedFilms,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return (filmListAnswerContainer.innerHTML =
          "<p>Filme erfolgreich der Watchlist hinzugefügt!</p><a href='watchlist.html'>Watchlist anzeigen!</a>");
      } else if (res.status === 400) {
        return (filmListAnswerContainer.innerHTML =
          "<p style='color: red'> Fehler beim Loginversuch! Überprüfe deine Eingaben und versuche es erneut!</p>");
      } else if (res.status === 500) {
        return (filmListAnswerContainer.innerHTML =
          "<p style='color: red'> Fehler beim Verarbeiten deiner Anfrage! Bitte versuche es später erneut!</p>");
      }
    })
    .catch((err) => {
      console.log(err);
      return (filmListAnswerContainer.innerHTML =
        "<p style='color: red'>Fehler beim erstellen der Anfrage, bitte versuche es erneut!</p>");
    });
});
