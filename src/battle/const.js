const startUpScreen = document.getElementById("startupScreen");
const pokeMenu = document.getElementById("pokemonMenu");
const pokeList = document.getElementById("pokemonList");

const pokeApiUrl = "https://pokeapi.co/api/v2/";
const listUrl = `${pokeApiUrl}pokemon?limit=200&offset=0`;

const introMusic = document.getElementById("openingAudio");
const fightMusic = document.getElementById("battleAudio");


// Things for the Battle Screen
const fightScreen = document.getElementById("battleScreen");
const enemyNameDisplay = document.getElementById("opponentName");
const enemyHealthBar = document.getElementById("opponentHpBar");
const enemyHealthText = document.getElementById("opponentHpText");
const enemySprite = document.getElementById("opponentSprite");

const myNameDisplay = document.getElementById("playerName");
const myHealthBar = document.getElementById("playerHpBar");
const myHealthText = document.getElementById("playerHpText");
const mySprite = document.getElementById("playerSprite");

const fightMessages = document.getElementById("battleLog");
const battleMessageDisplay = document.getElementById("battleMessage");
const whatToDo = document.getElementById("actionMenu");
const attackBtn = document.getElementById("attackButton");
const pickAttack = document.getElementById("moveMenu");

// Variables to keep track of the fight
let myPokemonData = null;
let enemyPokemonData = null;
let myMaxHealth = 0;
let enemyMaxHealth = 0;
let myCurrentHealth = 0;
let enemyCurrentHealth = 0;
let myTurn = true;
let myAttacks = [];
let enemyAttacks = [];
