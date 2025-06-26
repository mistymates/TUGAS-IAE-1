const apiBase = 'https://pokeapi.co/api/v2';

async function getAllPokemon(limit = 100) {
  try {
    const res = await fetch(`${apiBase}/pokemon?limit=${limit}`);
    const data = await res.json();
    const detailPromises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
    return await Promise.all(detailPromises);
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
    return [];
  }
}

async function searchPokemon(query) {
  try {
    const res = await fetch(`${apiBase}/pokemon/${query.toLowerCase()}`);
    if (!res.ok) throw new Error('Pokémon not found');
    return [await res.json()];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

function displayResults(pokemons) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (!pokemons.length) {
    resultsDiv.innerHTML = '<p class="error">No Pokémon found.</p>';
    return;
  }

  pokemons.forEach(pokemon => {
    const card = document.createElement('div');
    card.className = 'pokemon-card';

    const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

    card.innerHTML = `
      <img src="${imageUrl}" alt="${pokemon.name}" />
      <h2>${capitalize(pokemon.name)}</h2>
      <a href="https://www.pokemon.com/us/pokedex/${pokemon.name}" target="_blank">View Details</a>
    `;

    resultsDiv.appendChild(card);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function performSearch() {
  const query = document.getElementById('searchInput').value.trim();
  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = '';

  if (!query) {
    messageDiv.innerHTML = '<p class="loading">Menampilkan semua Pokémon...</p>';
    const pokemons = await getAllPokemon();
    displayResults(pokemons);
    messageDiv.innerHTML = '';
    return;
  }

  messageDiv.innerHTML = '<p class="loading">Mencari Pokémon...</p>';
  const result = await searchPokemon(query);

  if (result.length > 0) {
    messageDiv.innerHTML = `<p class="success">Ditemukan: ${capitalize(result[0].name)}</p>`;
  } else {
    messageDiv.innerHTML = `<p class="error">Pokémon tidak ditemukan.</p>`;
  }

  displayResults(result);
}

document.getElementById('searchButton').addEventListener('click', performSearch);
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    performSearch();
  }
});

searchInput.addEventListener('input', async function () {
  const value = searchInput.value.trim();
  const messageDiv = document.getElementById('message');

  if (value === '') {
    messageDiv.innerHTML = '<p class="loading">Menampilkan semua Pokémon...</p>';
    const pokemons = await getAllPokemon();
    displayResults(pokemons);
    messageDiv.innerHTML = '';
  }
});


window.addEventListener('DOMContentLoaded', async () => {
  const pokemons = await getAllPokemon();
  displayResults(pokemons);
});
