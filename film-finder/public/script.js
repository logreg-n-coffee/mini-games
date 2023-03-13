const tmdbKey = "f16a9edb97efb24d7c261e596b0c5fe0";
const tmdbBaseUrl = "https://api.themoviedb.org/3";
const playBtn = document.getElementById("playBtn");

const getGenres = async () => {
  const genreRequestEndpoint = "/genre/movie/list";
  const requestParams = "?api_key=" + tmdbKey;
  const urlToFetch = tmdbBaseUrl + genreRequestEndpoint + requestParams;

  try {
    const response = await fetch(urlToFetch);
    if (response.ok) {
      const jsonResponse = await response.json();
      console.log(jsonResponse);
      const genres = jsonResponse.genres;
      console.log(genres);
      return genres;
    }
  } catch (err) {
    console.log(err);
  }
};

const getMovies = async () => {
  const selectedGenre = getSelectedGenre();
  const discoverMovieEndpoint = "/discover/movie";
  const requestParams =
    "?api_key=" + tmdbKey + "&" + "with_genres=" + selectedGenre;

  const urlToFetch = tmdbBaseUrl + discoverMovieEndpoint + requestParams;

  try {
    const response = await fetch(urlToFetch);
    if (response.ok) {
      const jsonResponse = await response.json();
      const movies = jsonResponse.results;
      console.log(movies);
      return movies;
    }
  } catch (err) {
    console.log(err);
  }
};

const getMovieInfo = async (movie) => {
  const movieId = movie.id;
  const movieEndpoint = `/movie/${movieId}`;
  const requestParams = "?api_key=" + tmdbKey;

  const urlToFetch = tmdbBaseUrl + movieEndpoint + requestParams;

  try {
    const response = await fetch(urlToFetch);
    if (response.ok) {
      const movieInfo = await response.json();
      return movieInfo;
    }
  } catch (err) {
    console.log(err);
  }
};

// Gets a list of movies and ultimately displays the info of a random movie from the list
const showRandomMovie = async () => {
  const movieInfo = document.getElementById("movieInfo");
  if (movieInfo.childNodes.length > 0) {
    clearCurrentMovie();
  }
  const movies = await getMovies();
  const randomMovie = getRandomMovie(movies);
  const info = await getMovieInfo(randomMovie);
  displayMovie(info);
};


(async() => {
    const genres = await getGenres();
    console.log(genres);
    populateGenreDropdown(genres);
})();

playBtn.onclick = showRandomMovie;
