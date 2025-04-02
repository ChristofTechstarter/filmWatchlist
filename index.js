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
  } catch (error) {
    res.status(500).json({
      error: "Internal Server error, Please try again later!",
      errorMessage: error,
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
        hashPassword(newPassword)
          .then((hashedPasswort) => {
            FoundUser.password = hashedPasswort;
            writeFile("users.json", usersList);
            return res.status(200).json({
              message: "Sucessfully updated User!",
              updatedUser: FoundUser,
            });
          })
          .catch((err) => {
            console.error("Fehler beim Vergleich:", err);
            return res.status(500).json({
              error: "Internal Server error, Please try again later!",
              errorMessage: err,
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
  } catch (error) {
    res.status(500).json({
      error: "Internal Server error, Please try again later!",
      errorMessage: error,
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
  } catch (error) {
    res.status(500).json({
      error: "Internal Server error, Please try again later!",
      errorMessage: error,
    });
  }
});

app.listen(5005, () => {
  console.log("API läuft auf Port 5005");
});
