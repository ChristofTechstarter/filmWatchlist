const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");


app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

function readFile(file) {
  const data = fs.readFileSync(file, "utf-8");
  return JSON.parse(data);
}

function writeFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function verifyPassword(inputPassword, storedHash) {
  const match = await bcrypt.compare(inputPassword, storedHash);
  return match;
}

// Musterfunktion zum anlegen eines neuen Users mit einem gehashten Passwort

function createUser(username, password) {
  userList = readFile("users.json");

  hashPassword(password)
    .then((hashedPasswort) => {
      let newUser = {
        username: username,
        password: hashedPasswort,
      };
      userList.push(newUser);
      writeFile("users.json", userList);
    })
    .catch((err) => console.error("Fehler beim Hashen:", err));
}

// createUser("marcus", "test123");

// Musterfunktion zum überprüfen ob das eingegebene Passwort mit dem gespeicherten gehashten Passwort übereinstimmt!

// function testHash(username, password) {
//   userList = readFile("test.json");
//   let FoundUser = userList.find((user) => user.username === username);
//   let StoredHashedPassword = FoundUser.password;

//   verifyPassword(password, StoredHashedPassword)
//     .then((ergebniss) => console.log("Passwort korrekt:", ergebniss))
//     .catch((err) => console.error("Fehler beim Vergleich:", err));
// }

// testHash("hans", "test123");

app.get("/films", (req, res) => {
  try {
    const filmList = readFile("films.json");
    res.json(filmList);
  } catch (error) {
    res.status(500).json({
      error: "Internal Server error, Please try again later!",
      errorMessage: error,
    });
  }
});



app.post("/users", (req, res) => {
  try {


    const { username, password } = req.body; // Extrahiert Nutzerdaten aus der Anfrage.

    // Prüfen, ob Benutzername und Passwort vorhanden sind.
    if (!username || !password) {
      return res.status(400).json({ error: "Username und Passwort erforderlich!" });
    }

    let users = readFile("users.json");// Bestehenden Nutzer aus der Datei laden.

    // Prüfen, ob der Benutzer bereits existiert.
    if (users.some(user => user.username === username)) {
      return res.status(409).json({ error: "Nutzer existiert bereits." });
    }
    // Neuen Nutzer zur Liste hinzufügen.
    hashPassword(password).then(hashedPassword => {
      users.push({ id: users.length + 1, username, password: hashedPassword });
      writeFile("users.json", users) // Nutzerliste speichern

      res.status(201).json({ message: "Nutzer erfolgreich hinzugefügt." });
    })
    console.log("irgendwas")
  }  catch (err) {
    res.status(500).json({
      error: `Internal Server Error: ${err}`,
    });
  }
})




app.listen(5005, () => {
  console.log("API läuft auf Port 5005");
})
