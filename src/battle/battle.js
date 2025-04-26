attackBtn.addEventListener("click", showAttackChoices);

async function startFight(chosenPokemon) {
  introMusic.pause();
  fightMusic.currentTime = 0;
  fightMusic.play();
  // console.log("Starting fight for:", chosenPokemon.name);
  showBattleMessage("Getting ready for battle...");

  myPokemonData = chosenPokemon;
  myAttacks = myPokemonData.detailedMoves;
  // Safety check for moves
  if (!myAttacks || myAttacks.length === 0) {
    // console.warn("You have no detailed moves, adding tackle.");
    myAttacks = [
      { name: "tackle", power: 40, accuracy: 100, type: { name: "normal" } },
    ];
  }

  const randomId = Math.floor(Math.random() * 98) + 1;
  enemyPokemonData = await getPokemonInfo(randomId);

  if (!enemyPokemonData) {
    showBattleMessage("Oops! Couldn't load the opponent. Try again?");
    fightMusic.pause();
    introMusic.play();
    return;
  }

  enemyAttacks = enemyPokemonData.detailedMoves;
  // Safety check for enemy moves
  if (!enemyAttacks || enemyAttacks.length === 0) {
    // console.warn("Enemy has no detailed moves, adding tackle.");
    enemyAttacks = [
      { name: "tackle", power: 40, accuracy: 100, type: { name: "normal" } },
    ];
  }

  const myHpStat = myPokemonData.stats.find(
    (stat) => stat.stat.name === "hp"
  ).base_stat;
  const enemyHpStat = enemyPokemonData.stats.find(
    (stat) => stat.stat.name === "hp"
  ).base_stat;

  myMaxHealth = myHpStat;
  enemyMaxHealth = enemyHpStat;
  myCurrentHealth = myMaxHealth;
  enemyCurrentHealth = enemyMaxHealth;

  myNameDisplay.textContent = myPokemonData.name;
  enemyNameDisplay.textContent = enemyPokemonData.name;

  // Use back sprite for player, front for opponent
  // Not all pokemons have a back_default;
  // mySprite.src =myPokemonData.sprites.back_default;
  mySprite.src =
    myPokemonData.sprites.back_default ?? myPokemonData.sprites.front_default;
  enemySprite.src = enemyPokemonData.sprites.front_default;

  // Fallback images if sprites fail to load
  // mySprite.onerror = () => (mySprite.src = "");
  // enemySprite.onerror = () => (enemySprite.src = "./assets/placeholder.png");

  updateHealthDisplays();
  fillAttackChoices();

  pokeMenu.classList.add("hidden");
  fightScreen.classList.remove("hidden");
  whatToDo.classList.remove("hidden");
  pickAttack.classList.add("hidden");

  myTurn = true;
  showBattleMessage(
    `Let's go! ${myPokemonData.name} vs ${enemyPokemonData.name}!`
  );
  // console.log("Your Pokemon:", myPokemonData);
  // console.log("Enemy Pokemon:", enemyPokemonData);
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

function playerAttack(move) {
  if (!myTurn || !move) return;

  showBattleMessage(`${myPokemonData.name} used ${move.name}!`);
  pickAttack.classList.add("hidden");

  // Check if the attack hits
  const hitChance = move.accuracy ?? 100;
  if (Math.random() * 100 > hitChance) {
    showBattleMessage(`${myPokemonData.name}'s attack missed!`);
    myTurn = false;
    setTimeout(enemyTurn, 1500);

    return;
  }

  enemySprite.classList.add("shakeMe");
  enemySprite.classList.remove("animate2");
  mySprite.classList.add("animate1");
  const myAttackStat = myPokemonData.stats.find(
    (s) => s.stat.name === "attack"
  ).base_stat;
  const enemyDefenseStat = enemyPokemonData.stats.find(
    (s) => s.stat.name === "defense"
  ).base_stat;
  let damage =
    (2.5 * myAttackStat * (move.power ?? 40)) / enemyDefenseStat / 52;
  damage *= Math.random();
  damage = Math.max(1, Math.floor(damage));

  enemyCurrentHealth -= damage;
  enemyCurrentHealth = Math.max(0, enemyCurrentHealth);

  updateHealthDisplays();
  showBattleMessage(`${enemyPokemonData.name} took ${damage} damage!`);

  // Check if the enemy fainted
  if (enemyCurrentHealth <= 0) {
    setTimeout(() => {
      enemySprite.classList.remove("shakeMe");
      mySprite.classList.remove("animate1");
      finishFight(true);
    }, 1500);
  } else {
    myTurn = false;
    setTimeout(() => {
      enemySprite.classList.remove("shakeMe");
      mySprite.classList.remove("animate1");
      enemyTurn();
    }, 2000);
  }
}

function enemyTurn() {
  if (myTurn) return;

  const randomMoveIndex = Math.floor(Math.random() * enemyAttacks.length);
  const move = enemyAttacks[randomMoveIndex];

  // Safety check if enemy somehow has no moves
  if (!move) {
    showBattleMessage(`${enemyPokemonData.name} doesn't know what to do!`);
    myTurn = true;
    whatToDo.classList.remove("hidden");
    return;
  }

  showBattleMessage(`${enemyPokemonData.name} used ${move.name}!`);

  // Check if the attack hits
  const hitChance = move.accuracy ?? 100;
  if (Math.random() * 100 > hitChance) {
    showBattleMessage(`${enemyPokemonData.name}'s attack missed!`);
    setTimeout(() => {
      myTurn = true;
      whatToDo.classList.remove("hidden");
      showBattleMessage(`Your turn!`);
    }, 2000);
    return;
  }

  mySprite.classList.remove("animate1");
  mySprite.classList.add("shakeMe");
  enemySprite.classList.add("animate2");
  const enemyAttackStat = enemyPokemonData.stats.find(
    (s) => s.stat.name === "attack"
  ).base_stat;
  const myDefenseStat = myPokemonData.stats.find(
    (s) => s.stat.name === "defense"
  ).base_stat;
  let damage =
    (2.5 * enemyAttackStat * (move.power ?? 40)) / myDefenseStat / 50 + 2;
  damage *= Math.random() * (1.0 - 0.85) + 0.85;
  damage = Math.max(1, Math.floor(damage));

  myCurrentHealth -= damage;
  myCurrentHealth = Math.max(0, myCurrentHealth);

  updateHealthDisplays();
  showBattleMessage(`${myPokemonData.name} took ${damage} damage!`);

  // Check if your Pokemon fainted
  if (myCurrentHealth <= 0) {
    setTimeout(() => finishFight(false), 1500);
  } else {
    myTurn = true;
    setTimeout(() => {
      mySprite.classList.remove("shakeMe");
      enemySprite.classList.remove("animate2");
      whatToDo.classList.remove("hidden");
      showBattleMessage(`Your turn!`);
    }, 2000);
  }
}

function finishFight(playerWon) {
  fightMusic.pause();
  whatToDo.classList.add("hidden");
  pickAttack.classList.add("hidden");

  if (playerWon) {
    showBattleMessage(`Enemy ${enemyPokemonData.name} fainted! You win!`);
    // Make enemy sprite look fainted
    enemySprite.style.filter = "grayscale(100%) brightness(50%)";
  } else {
    showBattleMessage(`${myPokemonData.name} fainted! You lose!`);
    // Make your sprite look fainted
    mySprite.style.filter = "grayscale(100%) brightness(50%)";
  }

  // Add a 'Back to Menu' button
  const resetButton = document.createElement("button");
  resetButton.textContent = "Back to Menu";
  resetButton.onclick = goBackToStart;
  resetButton.classList.add("move-button");
  fightMessages.appendChild(resetButton);
}

function goBackToStart() {
  fightMusic.pause();
  fightMusic.currentTime = 0;
  introMusic.play();

  fightScreen.classList.add("hidden");
  pokeMenu.classList.remove("hidden");

  const existingResetButton = fightMessages.querySelector(".reset-button");
  if (existingResetButton) fightMessages.removeChild(existingResetButton);

  mySprite.src = "placeholder.png";
  enemySprite.src = "placeholder.png";
  mySprite.style.filter = "none";
  enemySprite.style.filter = "none";
  myNameDisplay.textContent = "Player";
  enemyNameDisplay.textContent = "Opponent";
  myHealthText.textContent = "HP: ??/??";
  enemyHealthText.textContent = "HP: ??/??";
  myHealthBar.style.width = "100%";
  enemyHealthBar.style.width = "100%";
  myHealthBar.className = "hp-bar";
  enemyHealthBar.className = "hp-bar";

  showBattleMessage("Select a Pokémon to start the battle!");
}
