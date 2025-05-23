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

// function createUser(username, password) {
//   userList = readFile("users.json");
//   hashPassword(password)
//     .then((hashedPasswort) => {
//       let newUser = {
//         username: username,
//         password: hashedPasswort,
//       };
//       userList.push(newUser);
//       writeFile("users.json", userList);
//     })
//     .catch((err) => console.error("Fehler beim Hashen:", err));
// }

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
  } catch (err) {
    res.status(500).json({
      error: `Internal Server Error: ${err}`,
    });
  }
});

app.post("/users", (req, res) => {
  try {
    const { username, password } = req.body; // Extrahiert Nutzerdaten aus der Anfrage.

    // Prüfen, ob Benutzername und Passwort vorhanden sind.
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username und Passwort erforderlich!" });
    }

    let users = readFile("users.json"); // Bestehenden Nutzer aus der Datei laden.

    // Prüfen, ob der Benutzer bereits existiert.
    if (users.some((user) => user.username === username)) {
      return res.status(409).json({ error: "Nutzer existiert bereits." });
    }
    // Neuen Nutzer zur Liste hinzufügen.
    hashPassword(password).then((hashedPassword) => {
      users.push({ id: users.length + 1, username, password: hashedPassword });
      writeFile("users.json", users); // Nutzerliste speichern

      res.status(201).json({ message: "Nutzer erfolgreich hinzugefügt." });
    });
  } catch (err) {
    res.status(500).json({
      error: `Internal Server Error: ${err}`,
    });
  }
});

app.put("/users", (req, res) => {
  try {
    const usersList = readFile("users.json");
    const { username, password, newUsername, newPassword } = req.body;

    // Überprüfung, ob eingegebener Nutzername existiert
    if (!usersList.some((user) => user.username === username)) {
      return res.status(400).json({
        error: `Invalid Criteria. Please check your input and try again.`,
      });
    }

    // initialisierung des user-Objektes und seines gespeicherten gehashten Passwort
    let FoundUser = usersList.find((user) => user.username === username);
    let StoredHashedPassword = FoundUser.password;

    // Überprüfung des eingegeben Passworts mit dem Gespeicherten
    verifyPassword(password, StoredHashedPassword).then((ergebniss) => {
      if (!ergebniss) {
        return res.status(400).json({
          error: `Invalid Criteria. Please check your input and try again.`,
        });
      }

      // Wenn ein neuer Username mitgegeben wird, wird er zu dem Objekt "Found User" hinzugefügt
      if (newUsername) {
        if (usersList.some((user) => user.username === newUsername)) {
          return res
            .status(400)
            .json({ error: `Username '${newUsername}' already exists!` });
        }
        FoundUser.username = newUsername;
      }

      // Falls keine neue Daten mitgegeben werden, wird die Funktion abgebrochen
      if (!newUsername && !newPassword) {
        return res.status(400).json({ error: "No new Data given!" });
      }

      // Wenn ein neues passwort mitgegeben wird, wird dieses gehashed und in dem Objekt (FoundUser) als password eingetragen

      if (newPassword) {
        hashPassword(newPassword).then((hashedPasswort) => {
          FoundUser.password = hashedPasswort;
          writeFile("users.json", usersList);
          return res.status(200).json({
            message: "Sucessfully updated User!",
            updatedUser: FoundUser,
          });
        });
      } else {
        // Falls kein Neues Passwort mitgegeben wird, damit der geänderte Username Übernommen wird
        writeFile("users.json", usersList);
        return res.status(200).json({
          message: "Sucessfully updated User!",
          updatedUser: FoundUser,
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      error: `Internal Server Error: ${err}`,
    });
  }
});

app.delete("/users", (req, res) => {
  try {
    const usersList = readFile("users.json");
    const { username, password } = req.body;

    // Überprüfung, ob eingegebener Nutzername existiert
    if (!usersList.some((user) => user.username === username)) {
      return res.status(400).json({
        error: `Invalid Criteria. Please check your input and try again.`,
      });
    }

    // initialisierung des user-Objektes und seines gespeicherten gehashten Passwort
    let FoundUser = usersList.find((user) => user.username === username);
    let StoredHashedPassword = FoundUser.password;

    // Überprüfung des eingegeben Passworts mit dem Gespeicherten
    verifyPassword(password, StoredHashedPassword).then((ergebniss) => {
      if (!ergebniss) {
        return res.status(400).json({
          error: `Invalid Criteria. Please check your input and try again.`,
        });
      }
      let FoundUserIndex = usersList.findIndex(
        (user) => user.username === username
      );
      let deletedUser = usersList.splice(FoundUserIndex, 1);
      writeFile("users.json", usersList);
      return res.status(200).json({
        message: "Sucessfully deleted User!",
        deletedUser: deletedUser[0],
      });
    });
  } catch (err) {
    res.status(500).json({
      error: `Internal Server Error: ${err}`,
    });
  }
});

app.post("/users/login", (req, res) => {
  try {
    const usersList = readFile("users.json");
    const { username, password } = req.body;

    // Überprüfung, ob eingegebener Nutzername existiert
    if (!usersList.some((user) => user.username === username)) {
      return res.status(400).json({
        error: `Invalid Criteria. Please check your input and try again.`,
      });
    }

    // initialisierung des user-Objektes und seines gespeicherten gehashten Passwort
    let FoundUser = usersList.find((user) => user.username === username);
    let StoredHashedPassword = FoundUser.password;

    // Überprüfung des eingegeben Passworts mit dem Gespeicherten
    verifyPassword(password, StoredHashedPassword).then((ergebniss) => {
      if (!ergebniss) {
        return res.status(400).json({
          error: `Invalid Criteria. Please check your input and try again.`,
        });
      }
      return res
        .status(200)
        .json({ message: "Sucessfully logged in!", loggedInUser: FoundUser });
    });
  } catch (err) {
    res.status(500).json({
      error: `Internal Server Error: ${err}`,
    });
  }
});

app.post("/watchlist", (req, res) => {
  try {
    const usersWatchList = readFile("usersWatchlist.json");
    const usersList = readFile("users.json");
    const { username, password } = req.body;

    // Überprüfung, ob eingegebener Nutzername existiert
    if (!usersList.some((user) => user.username === username)) {
      return res.status(400).json({
        error: `Invalid Criteria. Please check your input and try again.`,
      });
    }

    // initialisierung des user-Objektes und seines gespeicherten gehashten Passwort
    let FoundUser = usersList.find((user) => user.username === username);
    let StoredHashedPassword = FoundUser.password;

    // Überprüfung des eingegeben Passworts mit dem Gespeicherten
    verifyPassword(password, StoredHashedPassword).then((ergebniss) => {
      if (!ergebniss) {
        return res.status(400).json({
          error: `Invalid Criteria. Please check your input and try again.`,
        });
      }

      // Überprüfung, ob Liste existiert, wenn nicht ein Fehler zurück gegeben!
      const userID = FoundUser.id;
      if (!usersWatchList[userID]) {
        return res
          .status(404)
          .json({ error: "Du hast noch keine Watchlist erstellt!" });
      }

      return res.status(200).json({ userWatchlist: usersWatchList[userID] });
    });
  } catch (err) {
    res.status(500).json({
      error: `Internal Server Error: ${err}`,
    });
  }
});

app.post("/films", (req, res) => {
  try {
    const filmList = readFile("films.json");
    const usersWatchList = readFile("usersWatchlist.json");
    const usersList = readFile("users.json");

    const { username, password, filmID } = req.body;

    // Überprüfung, ob eingegebener Nutzername existiert
    if (!usersList.some((user) => user.username === username)) {
      return res.status(400).json({
        error: `Invalid Criteria. Please check your input and try again.`,
      });
    }

    // initialisierung des user-Objektes und seines gespeicherten gehashten Passwort
    let FoundUser = usersList.find((user) => user.username === username);
    let StoredHashedPassword = FoundUser.password;

    // Überprüfung des eingegeben Passworts mit dem Gespeicherten
    verifyPassword(password, StoredHashedPassword).then((ergebniss) => {
      if (!ergebniss) {
        return res.status(400).json({
          error: `Invalid Criteria. Please check your input and try again.`,
        });
      }

      // Überprüfung, ob Liste existiert, wenn nicht wird sie erstellt
      const userID = FoundUser.id;
      if (!usersWatchList[userID]) {
        usersWatchList[userID] = [];
      }

      let userWatchList = usersWatchList[userID]; // die aktuelle Filmliste

      filmID.forEach((item) => {
        let film = filmList.find((film) => film.id == item);
        const alreadyExists = userWatchList.some((f) => f.id == item);

        if (film && !alreadyExists) {
          userWatchList.push(film);
        }
      });

      writeFile("usersWatchlist.json", usersWatchList);
      return res.status(200).json({
        message: "Sucessfully added Film(s) to Watchlist!",
        filmList: userWatchList,
      });
    });
  } catch (err) {
    res.status(500).json({
      error: `Internal Server Error: ${err}`,
    });
  }
});

app.delete("/usersWatchlist", (req, res) => {
  try {
    const usersWatchList = readFile("usersWatchlist.json");
    const { username, password, movieId } = req.body;
    const usersList = readFile("users.json");

    // Überprüfung, ob eingegebener Nutzername existiert
    if (!usersList.some((user) => user.username === username)) {
      return res.status(400).json({
        error: `Invalid Criteria. Please check your input and try again.`,
      });
    }

    // initialisierung des user-Objektes und seines gespeicherten gehashten Passwort
    let FoundUser = usersList.find((user) => user.username === username);
    let StoredHashedPassword = FoundUser.password;

    // Überprüfung des eingegeben Passworts mit dem Gespeicherten
    verifyPassword(password, StoredHashedPassword).then((ergebniss) => {
      if (!ergebniss) {
        return res.status(400).json({
          error: `Invalid Criteria. Please check your input and try again.`,
        });
      }

      if (movieId) {
        let movieIndex = usersWatchList[FoundUser.id].findIndex(
          (movie) => movie.id == movieId
        );

        usersWatchList[FoundUser.id].splice(movieIndex, 1);
      }

      writeFile("usersWatchlist.json", usersWatchList);
      return res.status(200).json({
        message: "Sucessfully deleted User!",
        userWatchlist: usersWatchList[FoundUser.id] // die aktuelle Watchlist (bei Wojciech)
      });
    });
  } catch (err) {
    res.status(500).json({
      error: `Internal Server Error: ${err}`,
    });
  }
});

app.listen(5005, () => {
  console.log("API läuft auf Port 5005");
});
