async function getPokemonInfo(pokemonName) {
  try {
    const response = await fetch(`${pokeApiUrl}pokemon/${pokemonName}`);
    if (!response.ok) throw new Error(`Couldn't find Pokemon: ${pokemonName}`);
    const data = await response.json();

    const movePromises = data.moves
      .slice(0, 4)
      .map((moveData) => getMoveInfo(moveData.move.url));
    const moveDetails = await Promise.all(movePromises);

    data.detailedMoves = moveDetails.filter(
      (move) => move !== null && move.power !== null
    );

    // If no damaging moves found, give it Tackle
    if (data.detailedMoves.length === 0) {
      data.detailedMoves.push({
        name: "tackle",
        power: 40,
        accuracy: 100,
        type: { name: "normal" },
      });
    }
    return data;
  } catch (error) {
    return null;
  }
}

async function getMoveInfo(moveUrl) {
  try {
    const response = await fetch(moveUrl);
    if (!response.ok) throw new Error(`Couldn't find move: ${moveUrl}`);
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function fetchAndMakeCard(pokeInfoShort) {
  try {
    const fullData = await getPokemonInfo(pokeInfoShort.name);
    if (!fullData) return;

    const pokeCardDiv = makePokemonCard(fullData);
    pokeList.appendChild(pokeCardDiv);
  } catch (error) {}
}

function makePokemonCard(pokeDetails) {
  const pokeCardDiv = document.createElement("div");
  pokeCardDiv.classList.add("pokemon-card");

  // Pokemon picture
  const pokePic = document.createElement("img");
  pokePic.src = pokeDetails.sprites.front_default;
  pokePic.alt = pokeDetails.name;
  pokePic.onerror = () => (pokePic.src = "placeholder.png"); // Fallback image

  // Pokemon name
  const pokeNameText = document.createElement("h4");
  pokeNameText.textContent = pokeDetails.name;

  // Basic stats (HP and Attack)
  const pokeHpText = document.createElement("p");
  pokeHpText.textContent = `HP: ${
    pokeDetails.stats.find((s) => s.stat.name === "hp").base_stat
  }`;
  const pokeAtkText = document.createElement("p");
  pokeAtkText.textContent = `ATK: ${
    pokeDetails.stats.find((s) => s.stat.name === "attack").base_stat
  }`;

  pokeCardDiv.appendChild(pokePic);
  pokeCardDiv.appendChild(pokeNameText);
  pokeCardDiv.appendChild(pokeHpText);
  pokeCardDiv.appendChild(pokeAtkText);

  // Make the card clickable to start a battle
  pokeCardDiv.addEventListener("click", () => {
    startFight(pokeDetails);
  });
  return pokeCardDiv;
}

async function loadPokemonChoices() {
  pokeMenu.classList.remove("hidden");
  startUpScreen.classList.add("hidden");
  introMusic.play();
  pokeList.innerHTML = "<p>Loading Pokémon...</p>";
  try {
    const response = await fetch(listUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const pokemonListResult = data.results;

    pokeList.innerHTML = "";

    // Fetch details for each Pokemon and create cards
    await Promise.all(
      pokemonListResult.map((pokemon) => fetchAndMakeCard(pokemon))
    );
  } catch (error) {
    pokeList.innerHTML =
      "<p>Couldn't load the Pokémon list. Maybe try refreshing?</p>";
  }
}

function fillAttackChoices() {
  pickAttack.innerHTML = "";
  myAttacks.forEach((move) => {
    const moveButton = document.createElement("button");
    moveButton.classList.add("move-button");
    moveButton.textContent = `${move.name} (Pow:${move.power ?? "?"}, Acc:${
      move.accuracy ?? "?"
    })`;
    moveButton.dataset.moveName = move.name;
    moveButton.onclick = () => playerAttack(move);
    pickAttack.appendChild(moveButton);
  });
  // Add a 'Back to Menu' button
  const menuButton = document.createElement("button");
  menuButton.classList.add("move-button", "back-button");
  menuButton.textContent = "Back to Menu";
  menuButton.onclick = goBackToStart;
  pickAttack.appendChild(menuButton);
}

function updateHealthDisplays() {
  const myHpPercent = Math.max(0, (myCurrentHealth / myMaxHealth) * 100);
  myHealthBar.style.width = `${myHpPercent}%`;
  myHealthText.textContent = `HP: ${Math.ceil(myCurrentHealth)}/${Math.ceil(
    myMaxHealth
  )}`;
  // Change bar color based on health
  myHealthBar.className = "hp-bar";
  if (myHpPercent < 20) myHealthBar.classList.add("low");
  else if (myHpPercent < 50) myHealthBar.classList.add("medium");

  const enemyHpPercent = Math.max(
    0,
    (enemyCurrentHealth / enemyMaxHealth) * 100
  );
  enemyHealthBar.style.width = `${enemyHpPercent}%`;
  enemyHealthText.textContent = `HP: ${Math.ceil(
    enemyCurrentHealth
  )}/${Math.ceil(enemyMaxHealth)}`;

  // For enemy
  enemyHealthBar.className = "hp-bar";
  if (enemyHpPercent < 20) enemyHealthBar.classList.add("low");
  else if (enemyHpPercent < 50) enemyHealthBar.classList.add("medium");
}

function showBattleMessage(message) {
  battleMessageDisplay.textContent = message;
}

function showAttackChoices() {
  if (!myTurn) return;
  fillAttackChoices();
  whatToDo.classList.add("hidden");
  pickAttack.classList.remove("hidden");
}

function fillAttackChoices() {
  pickAttack.innerHTML = "";
  myAttacks.forEach((move) => {
    const moveButton = document.createElement("button");
    moveButton.classList.add("move-button");
    moveButton.textContent = `${move.name} (Pow:${move.power ?? "?"}, Acc:${
      move.accuracy ?? "?"
    })`;
    moveButton.dataset.moveName = move.name;
    moveButton.onclick = () => playerAttack(move);
    pickAttack.appendChild(moveButton);
  });
  // Add a 'Back to Menu' button
  const menuButton = document.createElement("button");
  menuButton.classList.add("move-button", "back-button");
  menuButton.textContent = "Back to Menu";
  menuButton.onclick = goBackToStart;
  pickAttack.appendChild(menuButton);
}
