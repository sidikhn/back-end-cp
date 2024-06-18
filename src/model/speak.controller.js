const { getHomeSpeakers, getSpeakerDetails, searchSpeakers, getFavorites, addFavorite, deleteFavorite } = require('./speak.service');

//MENU HOME BERISI SPEAKER PALING FAVORIT DAN RANDOM SPEAKER
const getHomeData = async (req, res) => {
  try {
    const { popularSpeakers, randomSpeakers } = await getHomeSpeakers();

    const formattedPopularSpeakers = popularSpeakers.map((speaker) => ({
      'Full Name': speaker['Full Name'],
      Rating: speaker['Rating'],
      Experience: speaker['Experience'],
      Favorites: speaker['favorite_count'] || 0,
    }));

    const formattedRandomSpeakers = randomSpeakers
      .sort(() => 0.5 - Math.random()) // Randomize order
      .slice(0, 7) // Take the first 7 speakers
      .map((speaker) => ({
        'Full Name': speaker['Full Name'],
        Rating: speaker['Rating'],
        Experience: speaker['Experience'],
      }));

    const response = {
      'Popular Speakers': formattedPopularSpeakers,
      'Random Speakers': formattedRandomSpeakers,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).send('Internal Server Error');
  }
};


const getField = (speaker) => {
  if (speaker.Business) return 'Business';
  if (speaker.Entertainment) return 'Entertainment';
  if (speaker.Politics) return 'Politics';
  if (speaker.Sport) return 'Sport';
  if (speaker.Tech) return 'Tech';
  if (speaker.Healthcare) return 'Healthcare';
  if (speaker.Academic) return 'Academic';
  if (speaker['Media_News']) return 'Media_News';
  return null;
};

///MENAMPILKAN DETAIL DARI SPEAKER
const getSpeakerDetailsById = async (req, res) => {
  const { id } = req.params;
  try {
    const speakerDetails = await getSpeakerDetails(id);
    if (!speakerDetails) {
      return res.status(404).json({ message: 'No details found for the given speaker ID' });
    }
    res.json(speakerDetails);
  } catch (error) {
    console.error('Error fetching speaker details:', error);
    res.status(500).send('Internal Server Error');
  }
};

///MENCARI SPEAKER BERDASARKAN BIDANGNYA
const searchSpeakersByField = async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({ message: 'Keyword is required' });
  }

  try {
    const speakers = await searchSpeakers(keyword);
    if (!speakers || speakers.length === 0) {
      return res.status(404).json({ message: 'No speakers found' });
    }
    res.json(speakers);
  } catch (error) {
    console.error('Error searching speakers by field:', error);
    res.status(500).send('Internal Server Error');
  }
};

// MENAMBAHKAN FAVORIT USER
const addFavoriteController = async (req, res) => {
  const { userId, speakerId } = req.body;

  try {
    await addFavorite(userId, speakerId);
    res.status(200).json({ message: 'Favorite added successfully' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).send('Internal Server Error');
  }
};

// MENAMPILKAN FAVORIT USER
const getFavoritesController = async (req, res) => {
  const { userId } = req.params;

  try {
    const favoritesData = await getFavorites(userId);
    res.json(favoritesData);
  } catch (error) {
    console.error('Error retrieving favorites data:', error);
    res.status(500).send('Internal Server Error');
  }
};

// MENGHAPUS FAVORIT USER
const deleteFavoriteController = async (req, res) => {
  const { userId, speakerId } = req.body;

  try {
    await deleteFavorite(userId, speakerId);
    res.status(200).json({ message: 'Favorite deleted successfully' });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  getHomeData,
  getSpeakerDetailsById,
  searchSpeakersByField,
  addFavoriteController,
  getFavoritesController,
  deleteFavoriteController,
};
