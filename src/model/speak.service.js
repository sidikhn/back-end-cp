const pool = require('../../config/database'); // Ubah path sesuai dengan lokasi file db.js Anda

const getAllSpeakers = async () => {
  return new Promise((resolve, reject) => {
    pool.query(
      `
      SELECT full_name AS \`Full Name\`, 
             rating AS \`Rating\`, 
             experience AS \`Experience\`,
             IFNULL(category1, '') AS \`Category1\`,
             IFNULL(category2, '') AS \`Category2\`,
             IFNULL(category3, '') AS \`Category3\`
      FROM data
      WHERE category1 IS NOT NULL OR category2 IS NOT NULL OR category3 IS NOT NULL
    `,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      }
    );
  });
};

const getSpeakerDetails = async (speakerId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        d.full_name,
        d.rating,
        d.experience,
        d.category1,
        d.category2,
        d.category3
      FROM data d
      WHERE d.speaker_id = ?
    `;

    pool.query(query, [speakerId], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      if (results.length === 0) {
        return resolve(null);
      }
      resolve(results[0]);
    });
  });
};

const getRecommendedSpeakers = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT speaker_id, rating_ave, 
      CASE 
        WHEN Business = 1 THEN 'Business'
        WHEN Entertainment = 1 THEN 'Entertainment'
        WHEN Politics = 1 THEN 'Politics'
        WHEN Sport = 1 THEN 'Sport'
        WHEN Tech = 1 THEN 'Tech'
        WHEN Healthcare = 1 THEN 'Healthcare'
        WHEN Academic = 1 THEN 'Academic'
        WHEN Media_News = 1 THEN 'Media_News'
      END AS field 
      FROM speaker_side_data 
      WHERE rating_ave >= 4.5 
      ORDER BY RAND() 
      LIMIT 7`;
    pool.query(query, (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

const searchSpeakers = async (keyword) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT d.full_name AS name,
             d.rating AS rating,
             CASE
               WHEN ssd.Business = 1 THEN 'Business'
               WHEN ssd.Entertainment = 1 THEN 'Entertainment'
               WHEN ssd.Politics = 1 THEN 'Politics'
               WHEN ssd.Sport = 1 THEN 'Sport'
               WHEN ssd.Tech = 1 THEN 'Tech'
               WHEN ssd.Healthcare = 1 THEN 'Healthcare'
               WHEN ssd.Academic = 1 THEN 'Academic'
               WHEN ssd.Media_News = 1 THEN 'Media_News'
             END AS field
      FROM data d
      INNER JOIN speaker_side_data ssd ON d.speaker_id = ssd.speaker_id
      WHERE 
        (ssd.Business = 1 AND LOWER('business') LIKE LOWER(?)) OR
        (ssd.Entertainment = 1 AND LOWER('entertainment') LIKE LOWER(?)) OR
        (ssd.Politics = 1 AND LOWER('politics') LIKE LOWER(?)) OR
        (ssd.Sport = 1 AND LOWER('sport') LIKE LOWER(?)) OR
        (ssd.Tech = 1 AND LOWER('tech') LIKE LOWER(?)) OR
        (ssd.Healthcare = 1 AND LOWER('healthcare') LIKE LOWER(?)) OR
        (ssd.Academic = 1 AND LOWER('academic') LIKE LOWER(?)) OR
        (ssd.Media_News = 1 AND LOWER('media_news') LIKE LOWER(?))
    `;
    const params = Array(8).fill(`%${keyword.toLowerCase()}%`);

    pool.query(query, params, (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

const addFavorite = async (userId, speakerId) => {
  const insertQuery = `
    INSERT INTO user_favorites (user_id, speaker_id)
    VALUES (?, ?)
  `;
  const values = [userId, speakerId];

  return new Promise((resolve, reject) => {
    pool.query(insertQuery, values, (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

const getFavorites = async (userId) => {
  const query = `
SELECT DISTINCT
  d.full_name AS Name,
  d.experience AS Experience,
  ROUND(ssd.rating_ave, 1) AS Rating,
  CASE
    WHEN ssd.Business = 1 THEN 'Business'
    WHEN ssd.Entertainment = 1 THEN 'Entertainment'
    WHEN ssd.Politics = 1 THEN 'Politics'
    WHEN ssd.Sport = 1 THEN 'Sport'
    WHEN ssd.Tech = 1 THEN 'Tech'
    WHEN ssd.Healthcare = 1 THEN 'Healthcare'
    WHEN ssd.Academic = 1 THEN 'Academic'
    WHEN ssd.Media_News = 1 THEN 'Media News'
    ELSE ''
  END AS Field
FROM (
  SELECT uf.speaker_id, MAX(d.rating) AS max_rating
  FROM user_favorites uf
  INNER JOIN data d ON uf.speaker_id = d.speaker_id
  WHERE uf.user_id = '2'
  GROUP BY uf.speaker_id
) AS max_rating_data
INNER JOIN data d ON max_rating_data.speaker_id = d.speaker_id AND d.rating = max_rating_data.max_rating
INNER JOIN speaker_side_data ssd ON d.speaker_id = ssd.speaker_id;
  `;
  const values = [userId];

  return new Promise((resolve, reject) => {
    pool.query(query, values, (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

const deleteFavorite = async (userId, speakerId) => {
  const deleteQuery = `
    DELETE FROM user_favorites
    WHERE user_id = ? AND speaker_id = ?
  `;
  const values = [userId, speakerId];

  return new Promise((resolve, reject) => {
    pool.query(deleteQuery, values, (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results.affectedRows);
    });
  });
};

const getMostFavoritedSpeakers = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        d.full_name AS \`Full Name\`,
        d.rating AS \`Rating\`,
        d.experience AS \`Experience\`,
        COUNT(uf.speaker_id) AS favorite_count
      FROM data d
      LEFT JOIN user_favorites uf ON d.speaker_id = uf.speaker_id
      GROUP BY d.speaker_id
      ORDER BY favorite_count DESC
      LIMIT 7
    `;
    pool.query(query, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};


const getHomeSpeakers = async () => {
  const popularSpeakers = await getMostFavoritedSpeakers();
  const randomSpeakers = await getAllSpeakers();

  return { popularSpeakers, randomSpeakers };
};


module.exports = {
  getAllSpeakers,
  getSpeakerDetails,
  getRecommendedSpeakers,
  searchSpeakers,
  addFavorite,
  getFavorites,
  deleteFavorite,
  getMostFavoritedSpeakers,
  getHomeSpeakers,
};
