const filmListAddForm = document.getElementById("filmListAdd");

const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const filmListAnswerContainer = document.getElementById("filmListAnswer");

filmListAddForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!usernameInput.value && !passwordInput.value) {
    return (filmListAnswerContainer.innerHTML =
      "<p style='color: red'>Du hast nicht alle Felder ausgefüllt!</p>");
  }
  // Alle ausgewählten Checkboxen erfassen
  const checkedFilms = Array.from(
    document.querySelectorAll("input[type='checkbox']:checked")
  ).map((checkbox) => parseInt(checkbox.value));
  console.log(checkedFilms);

  fetch("http://localhost:5005/films", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: usernameInput.value,
      password: passwordInput.value,
      filmID: checkedFilms,
    }).then((res) => res.JSON()),
  });
});
