const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

/******************
 * WARM UP ROUTES *
 ******************/

// Route 1: GET /author/:type
const author = async function(req, res) {
  // TODO (TASK 1): replace the values of name and pennkey with your own
  const name = 'Felix Yuzhou Sun';
  const pennkey = 'syz1998';

  // checks the value of type in the request parameters
  // note that parameters are required and are specified in server.js in the endpoint by a colon (e.g. /author/:type)
  if (req.params.type === 'name') {
    // res.send returns data back to the requester via an HTTP response
    res.send(`Created By ${name}`);
  } else if (req.params.type === 'pennkey') {
    // TODO (TASK 2): edit the else if condition to check if the request parameter is 'pennkey' and if so, send back a JSON response with the pennkey
    res.send(`Created By ${pennkey}`);
  } else {
    res.status(400).json({});
  }
}

// Route 2: GET /random
const random = async function(req, res) {
  // you can use a ternary operator to check the value of request query values
  // which can be particularly useful for setting the default value of queries
  // note if users do not provide a value for the query it will be undefined, which is falsey
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  // Here is a complete example of how to query the database in JavaScript.
  // Only a small change (unrelated to querying) is required for TASK 3 in this route.
  connection.query(`
    SELECT *
    FROM Songs
    WHERE explicit <= ${explicit}
    ORDER BY RAND()
    LIMIT 1
  `, (err, data) => {
    if (err || data.length === 0) {
      // If there is an error for some reason, or if the query is empty (this should not be possible)
      // print the error message and return an empty object instead
      console.log(err);
      // Be cognizant of the fact we return an empty object {}. For future routes, depending on the
      // return type you may need to return an empty array [] instead.
      res.json({});
    } else {
      // Here, we return results of the query as an object, keeping only relevant data
      // being song_id and title which you will add. In this case, there is only one song
      // so we just directly access the first element of the query results array (data)
      // TODO (TASK 3): also return the song title in the response
      res.json({
        song_id: data[0].song_id,
        title: data[0].title,
      });
    }
  });
}

/********************************
 * BASIC SONG/ALBUM INFO ROUTES *
 ********************************/

// Route 3: GET /song/:song_id
const song = async function(req, res) {
  // TODO (TASK 4): implement a route that given a song_id, returns all information about the song
  // Hint: unlike route 2, you can directly SELECT * and just return data[0]
  // Most of the code is already written for you, you just need to fill in the query
  const songId = req.params.song_id;
  
  connection.query(`
  SELECT *
  FROM Songs
  WHERE song_id = ?
  `, [songId], (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 4: GET /album/:album_id
const album = async function(req, res) {
  // TODO (TASK 5): implement a route that given a album_id, returns all information about the album
  const albumId = req.params.album_id;

  // SQL query to select all information for the given album_id
  connection.query(`
    SELECT *
    FROM Albums
    WHERE album_id = ?
  `, [albumId], (err, data) => { 
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]); 
    }
  });
}

// Route 5: GET /albums
const albums = async function(req, res) {
  // TODO (TASK 6): implement a route that returns all albums ordered by release date (descending)
  // Note that in this case you will need to return multiple albums, so you will need to return an array of objects
  connection.query(`
    SELECT *
    FROM Albums
    ORDER BY release_date DESC
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]); // In case of an error, return an empty array
      } else {
        res.json(data); // Return the array of albums
      }
    });
}

// Route 6: GET /album_songs/:album_id
const album_songs = async function(req, res) {
  // TODO (TASK 7): implement a route that given an album_id, returns all songs on that album ordered by track number (ascending)
  const albumId = req.params.album_id;

  // SQL query to select specified song information for a given album_id, ordered by track number
  connection.query(`
    SELECT song_id, title, number, duration, plays
    FROM Songs
    WHERE album_id = ?
    ORDER BY number ASC
    `, [albumId], (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
}

/************************
 * ADVANCED INFO ROUTES *
 ************************/

// Route 7: GET /top_songs
const top_songs = async function(req, res) {
  const page = parseInt(req.query.page); 
  // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
  const pageSize = parseInt(req.query.page_size ?? 10);

  if (!page) {
    // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
    // Hint: you will need to use a JOIN to get the album title as well
    connection.query(`
      SELECT Songs.song_id, Songs.title, Songs.album_id, Albums.title AS album, Songs.plays
      FROM Songs
      JOIN Albums ON Songs.album_id = Albums.album_id
      ORDER BY Songs.plays DESC
      `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  } else {
    // TODO (TASK 10): reimplement TASK 9 with pagination
    // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)
    const offset = (page - 1) * pageSize; // Calculate offset, remember page is 1-indexed

    connection.query(`
      SELECT Songs.song_id, Songs.title, Songs.album_id, Albums.title AS album, Songs.plays
      FROM Songs
      JOIN Albums ON Songs.album_id = Albums.album_id
      ORDER BY Songs.plays DESC
      LIMIT ? OFFSET ?
      `, [parseInt(pageSize), offset], (err, data) => { // Ensure pageSize and offset are integers
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  }
}

// Route 8: GET /top_albums
const top_albums = async function(req, res) {
  // TODO (TASK 11): return the top albums ordered by aggregate number of plays of all songs on the album (descending), with optional pagination (as in route 7)
  // Hint: you will need to use a JOIN and aggregation to get the total plays of songs in an album
  res.json([]); // replace this with your implementation
}

// Route 9: GET /search_albums
const search_songs = async function(req, res) {
  // TODO (TASK 12): return all songs that match the given search query with parameters defaulted to those specified in API spec ordered by title (ascending)
  // Some default parameters have been provided for you, but you will need to fill in the rest
  const title = req.query.title ?? '';
  const durationLow = req.query.duration_low ?? 60;
  const durationHigh = req.query.duration_high ?? 660;

  res.json([]); // replace this with your implementation
}

const top_leagues = async function(req, res) {

  const startSeason = req.query.season ?? 2014;
  const endSeason = req.query.season ?? 2020;

  connection.query(
    `WITH game_stats AS (
      SELECT leagueID,
             AVG(homeGoals + awayGoals) AS total_goals,
             AVG(homeGoals - awayGoals) AS goal_difference
      FROM games
      WHERE season BETWEEN ${startSeason} AND ${endSeason}
      GROUP BY leagueID
    )
    SELECT l.name AS league_name,
          AVG(gs.total_goals) AS avg_total_goals,
          AVG(gs.goal_difference) AS avg_goal_difference
    FROM game_stats gs
        JOIN leagues l ON gs.leagueID = l.leagueID
    GROUP BY l.name
    ORDER BY avg_draw_probability DESC,
            avg_total_goals DESC,
            avg_goal_difference
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const top_offensive_leagues = async function(req, res) {

  const startSeason = req.query.season ?? 2014;
  const endSeason = req.query.season ?? 2020;

  connection.query(
    `SELECT l.name AS league_name,
            AVG(ts.goals) AS avg_goals,
            AVG(ts.xGoals) AS avg_expected_goals,
            AVG(ts.shots) AS avg_shots,
            AVG(ts.shotsOnTarget) AS avg_shots_on_target,
            AVG(ts.deep) AS avg_deep_shots,
            AVG(ts.corners) AS avg_corners
    FROM teamstats ts.season BETWEEN ${startSeason} AND ${endSeason}
        JOIN games g ON ts.gameID = g.gameID
        JOIN leagues l ON g.leagueID = l.leagueID
    WHERE ts.
    GROUP BY l.name
    ORDER BY avg_goals DESC,
            avg_shots_on_target DESC,
            avg_corners DESC
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const top_defensive_leagues = async function(req, res) {

  const startSeason = req.query.season ?? 2014;
  const endSeason = req.query.season ?? 2020;

  connection.query(
    `SELECT l.name AS league_name,
            AVG(g.awayGoals) AS avg_goals_conceded,
            AVG(ts.shots) AS avg_shots_faced,
            AVG(ts.ppda) AS avg_ppda
    FROM teamstats ts
        JOIN games g ON ts.gameID = g.gameID
        JOIN leagues l ON g.leagueID = l.leagueID
    WHERE ts.season BETWEEN ${startSeason} AND ${endSeason}
    GROUP BY l.name
    ORDER BY avg_ppda,
            avg_goals_conceded,
            avg_shots_faced DESC
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

const team_roster = async function(req, res) {

  const startSeason = req.query.season ?? 2014;
  const endSeason = req.query.season ?? 2020;

  connection.query(
    `WITH gamesInfo AS(
      SELECT P.playerID AS playerID,
             P.name AS name,
             G.season AS season,
             G.homeTeamID AS homeTeamID,
             G.awayTeamID AS awayTeamID,
             G.leagueID AS leagueID
      FROM players P
          JOIN appearances A ON P.playerID = A.playerID
          JOIN games G ON A.gameID = G.gameID
    ), teamsPlayed AS(
        SELECT playerID,
              name,
              season,
              teamID,
              leagueID,
              COUNT(*) AS TOTAL_APPEARANCE
        FROM (
            SELECT playerID, name, season, homeTeamID AS teamID, leagueID
            FROM gamesInfo
    
            UNION ALL
    
            SELECT playerID, name, season, awayTeamID AS teamID, leagueID
            FROM gamesInfo) TA
        GROUP BY name, season, teamID
        ORDER BY TOTAL_APPEARANCE DESC
    ), teamsBelong AS (
        SELECT TP.playerID,
              TP.name,
              TP.season,
              TP.teamID,
              T.name AS team,
              L.name AS league,
              MAX(TOTAL_APPEARANCE) AS TOTAL_APPEARANCE
        FROM teamsPlayed TP
            JOIN teams T ON TP.teamID = T.teamID
            JOIN leagues L ON TP.leagueID = L.leagueID
        GROUP BY TP.name, season
    )
    SELECT season, team, league, GROUP_CONCAT(name separator ', ') AS roster
    FROM teamsBelong
    WHERE season BETWEEN ${startSeason} AND ${endSeason}
    GROUP BY league, team, season
    ORDER BY season, league, team
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    }
  );
}

module.exports = {
  author,
  random,
  song,
  album,
  albums,
  album_songs,
  top_songs,
  top_albums,
  search_songs,
  top_leagues,
  top_offensive_leagues,
  top_defensive_leagues,
  team_roster
}
