const form = document.getElementById("birthday-form");
const messageEl = document.getElementById("message");

const openers = [
  "Happy Birthday",
  "Cheers to",
  "Raise the cake for",
  "Alert the confetti cannon for",
];

const ageJokes = [
  (age) => `${age} is just ${age - 1} with extra experience points.`,
  (age) => `At ${age}, you're now old enough to know better and young enough to do it anyway.`,
  (age) => `${age} candles? That's not a fire hazard, that's a light show.`,
  (age) => `${age} years of being awesome with only occasional buffering.`,
];

const hobbyJokes = [
  (hobby) => `May your ${hobby} adventures be legendary and only mildly chaotic.`,
  (hobby) => `May your ${hobby} skills be so good that people ask for autographs.`,
  (hobby) => `Wishing you a year full of ${hobby}, snacks, and dramatic victories.`,
  (hobby) => `May your ${hobby} hobby budget stay hidden from your bank app.`,
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const age = Number(document.getElementById("age").value);
  const hobby = document.getElementById("hobby").value.trim().toLowerCase();

  if (!name || !age || !hobby) {
    messageEl.textContent = "Please fill in all fields so I can craft comedic greatness.";
    return;
  }

  const opener = pickRandom(openers);
  const ageLine = pickRandom(ageJokes)(age);
  const hobbyLine = pickRandom(hobbyJokes)(hobby);

  messageEl.textContent = `${opener}, ${name}! ${ageLine} ${hobbyLine} Have a ridiculously fantastic birthday!`;
});
