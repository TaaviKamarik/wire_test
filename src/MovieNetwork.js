// Function to process movie data into network graph format
function preprocessMovieData(moviesData) {
  // Maps to store unique people and their relationships
  const peopleMap = new Map(); // Store unique people and their roles
  const collaborations = new Map(); // Store collaboration counts
  const peopleMovies = new Map(); // Store movies per person

  // Process each movie
  moviesData.forEach(movie => {
    // Combine all people involved in the movie
    const allPeople = [
      // Process crew members (Vastutusandmed)
      ...(movie.Vastutusandmed || []).map(p => ({
        name: p.name,
        role: p.role
      })),
      // Process main actors (Näitlejad Peaosatäitjad)
      ...(movie['Näitlejad Peaosatäitjad'] || []).map(p => ({
        name: p.actor,
        role: 'Actor (Lead)'
      })),
      // Process supporting actors (Näitlejad Kõrvalosatäitjad)
      ...(movie['Näitlejad Kõrvalosatäitjad'] || []).map(p => ({
        name: p.actor,
        role: 'Actor (Supporting)'
      })),
      // Process episodic actors (Näitlejad Episoodides)
      ...(movie['Näitlejad Episoodides'] || []).map(p => ({
        name: p.actor,
        role: 'Actor (Episodic)'
      }))
    ];

    // Process each person in the movie
    allPeople.forEach(person => {
      // Add or update person in peopleMap
      if (!peopleMap.has(person.name)) {
        peopleMap.set(person.name, {
          id: person.name,
          name: person.name,
          roles: new Set()
        });
      }
      peopleMap.get(person.name).roles.add(person.role);

      // Add movie to person's filmography
      if (!peopleMovies.has(person.name)) {
        peopleMovies.set(person.name, []);
      }
      peopleMovies.get(person.name).push({
        id: movie.EfisId,
        title: movie.EfisPealkiri,
        year: movie.Tootmisaasta,
        role: person.role,
        image: movie.Meedia?.profile,
        language: movie.EfisKeelVäli,
        type: movie.TeoseLiik?.Tüüp,
        subtype: movie.TeoseLiik?.Alamtüüp,
        genre: movie.TeoseLiik?.Žanr
      });

      // Record collaborations between people
      allPeople.forEach(otherPerson => {
        if (person.name !== otherPerson.name) {
          // Create a unique key for each collaboration (sorted to ensure consistency)
          const linkKey = [person.name, otherPerson.name].sort().join('---');
          collaborations.set(linkKey, (collaborations.get(linkKey) || 0) + 1);
        }
      });
    });
  });

  // Convert the data into the format needed for force graph
  const nodes = Array.from(peopleMap.values()).map(person => ({
    ...person,
    roles: Array.from(person.roles), // Convert Set to Array
    movies: peopleMovies.get(person.name)
  }));

  const links = Array.from(collaborations.entries()).map(([key, value]) => {
    const [source, target] = key.split('---');
    return {
      source,
      target,
      value // This represents the number of collaborations
    };
  });

  return {
    nodes,
    links,
    peopleMovies: Object.fromEntries(peopleMovies)
  };
}

// Example usage:
/*
const movieData = [your JSON array];
const processedData = preprocessMovieData(movieData);

console.log(processedData);
// Output format:
{
    nodes: [
        {
            id: "Person Name",
            name: "Person Name",
            roles: ["Director", "Producer"],
            movies: [{
                id: 1,
                title: "Movie Title",
                year: "2001",
                role: "Director",
                image: "url",
                language: "Estonian",
                type: "Mängufilmid",
                subtype: "Lühimängufilm",
                genre: null
            }]
        }
    ],
    links: [
        {
            source: "Person Name 1",
            target: "Person Name 2",
            value: 3  // Number of times they worked together
        }
    ],
    peopleMovies: {
        "Person Name": [
            {movie details...}
        ]
    }
}
*/

export default preprocessMovieData;