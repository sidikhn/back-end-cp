const pool = require('../../config/database');

module.exports = {
  checkUserExists: (username, email, callback) => {
    pool.query(
      `SELECT COUNT(*) AS usernameCount, 
                    (SELECT COUNT(*) FROM users WHERE email = ?) AS emailCount 
             FROM users WHERE username = ?`,
      [email, username],
      (error, results, fields) => {
        if (error) {
          return callback(error, null);
        }

        const usernameExists = results[0].usernameCount > 0;
        const emailExists = results[0].emailCount > 0;

        return callback(null, { usernameExists, emailExists });
      }
    );
  },
  create: (data, callback) => {
    pool.query(`insert into users(username, email, password) VALUES (?,?,?)`, [data.username, data.email, data.password], (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      return callback(null, results);
    });
  },
  getUsers: (callback) => {
    pool.query(`select id, username, email from users`, [], (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      return callback(null, results);
    });
  },
  getUserByID: (id, callback) => {
    pool.query(`select id, username, email from users where id = ?`, [id], (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      return callback(null, results[0]);
    });
  },
  updateUser: (data, callback) => {
    pool.query(`update users set username=?, email=?, password=? where id=?`, [data.username, data.email, data.password, data.id], (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      return callback(null, results);
    });
  },
  deleteUser: (id, callback) => {
    pool.query(`DELETE FROM users WHERE id=?`, [id], (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      if (results.affectedRows === 0) {
        // ID pengguna tidak ditemukan
        return callback({
          message: 'User not found',
          notFound: true,
        });
      }
      callback(null, results); // No need to access results[0]
    });
  },

  // getUserbyEmail: (email, callback) => {
  //     pool.query(
  //         `select * from users where email=?`,
  //         [email],
  //         (error, results, fields) => {
  //             if (error) {
  //                 console.error('Error in getUserbyEmail query:', error);
  //                 return callback(error);
  //             }

  //             console.log('Results from getUserbyEmail:', results);

  //             callback(null, results);
  //         }
  //     );
  // }

  getUserbyEmail: async (email) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
        if (error) {
          console.error('Error in getUserbyEmail query:', error);
          reject(error);
        } else {
          console.log('Results from getUserbyEmail:', results);
          resolve(results[0]); // Assuming results is an array
        }
      });
    });
  },
};
