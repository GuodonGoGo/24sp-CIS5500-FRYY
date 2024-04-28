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


// Route 0: GET /test
const test = async function (req, res) {
  connection.query(`
    SELECT COUNT(*) AS shot_count
    FROM shots
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      // Assuming the query always returns one row with one column
      const shotCount = data[0].shot_count;
      res.json({ shotCount });
    }
  });
}

// Route 1: GET /top_scorers
// Description: Returns the names of top 5 goal scorers across all seasons for each league respectively, including own goals.
const top_scorers = async function (req, res) {
  connection.query(`
    WITH goal_scores AS (
      SELECT
          p.playerID,
          l.leagueID,
          l.name AS league_name,
          p.name AS player_name,
          SUM(a.goals + a.ownGoals) AS total_goals
      FROM appearances a
      JOIN players p ON a.playerID = p.playerID
      JOIN games g ON a.gameID = g.gameID
      JOIN leagues l ON g.leagueID = l.leagueID
      GROUP BY p.playerID, l.leagueID
  ), ranked_scores AS (
      SELECT
          leagueID,
          league_name,
          player_name,
          total_goals,
          RANK() OVER (PARTITION BY leagueID ORDER BY total_goals DESC) AS player_rank
      FROM goal_scores
  )
  SELECT player_name
  FROM ranked_scores
  WHERE player_rank = 1; 
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]); // In case of an error, return an empty array
    } else {
      // Extracting just the player names from the data array
      const playerNames = data.map(item => item.player_name);
      res.json(playerNames); // Return the array of top scorers' names
    }
  });
}

// Route 2: GET / most_influential_players
// Description: Returns the data of the top 5 players who contributed to the most goals throughout seasons.
const most_influential_players = async function (req, res) {
  connection.query(`
  WITH goals_from_shots AS (
    SELECT shooterID,
           SUM(CASE WHEN shotResult = 'Goal' THEN 1 ELSE 0 END) AS goals_from_shots
    FROM shots
    GROUP BY shooterID
  )
  SELECT
    p.playerID,
    p.name AS player_name,
    COUNT(a.gameID) AS appearances,
    SUM(a.goals) AS total_goals,
    SUM(a.assists) AS total_assists,
    COALESCE(gfs.goals_from_shots, 0) AS goals_from_shots
  FROM players p
  JOIN appearances a ON p.playerID = a.playerID
  JOIN games g ON a.gameID = g.gameID
  JOIN goals_from_shots gfs ON p.playerID = gfs.shooterID
  JOIN teams t ON t.teamID = g.homeTeamID OR t.teamID = g.awayTeamID
  GROUP BY p.playerID, p.name
  ORDER BY total_goals DESC, total_assists DESC
  LIMIT 5;

  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]); // In case of an error, return an empty array
    } else {
      // Extracting just the player names from the data array
      const playerNames = data.map(item => item.player_name);
      res.json(playerNames); // Return the array of top scorers' names
    }
  });
}

// Route 3: GET /clutch_players
const clutch_players = async function (req, res) {
  connection.query(`
    SELECT p.name, COUNT(*) AS late_goals
    FROM shots s
    JOIN players p ON s.shooterID = p.playerID
    WHERE minute BETWEEN 75 AND 90 AND shotResult = 'Goal'
    GROUP BY p.name
    ORDER BY late_goals DESC
    LIMIT 10;
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]); // In case of an error, return an empty array
    } else {
      console.log(data); // Log the data array
      // Extracting just the player names from the data array
      const playerNames = data.map(item => item.name);
      res.json(playerNames); // Return the array of top scorers' names
    }
  });
}


// Route 4: GET /player_performance_per_season
const player_performance_per_season = async function (req, res) {
  const name = req.query.name;
  // if season is not provided, return all seasons
  const season = req.query.season;

  if (!season) {
    connection.query(`
    WITH gamesInfo AS(
      SELECT P.playerID AS playerID, P.name AS name, G.season AS season, G.homeTeamID AS homeTeamID, G.awayTeamID AS awayTeamID, G.leagueID AS leagueID
      FROM players P
          JOIN appearances A ON P.playerID = A.playerID
          JOIN games G ON A.gameID = G.gameID
   ), teamsPlayed AS(
      SELECT playerID, name, season, teamID, leagueID, COUNT(*) AS TOTAL_APPEARANCE
      FROM (SELECT playerID, name, season, homeTeamID AS teamID, leagueID
            FROM gamesInfo
   
            UNION ALL
   
            SELECT playerID, name, season, awayTeamID AS teamID, leagueID
            FROM gamesInfo) TA
      GROUP BY name, season, teamID
      ORDER BY TOTAL_APPEARANCE DESC
   ), teamsBelong AS (
      SELECT TP.playerID, TP.name, season, TP.teamID, T.name AS team, L.name AS league, MAX(TOTAL_APPEARANCE) AS TOTAL_APPEARANCE
      FROM teamsPlayed TP
          JOIN teams T ON TP.teamID = T.teamID
          JOIN leagues L ON TP.leagueID = L.leagueID
      GROUP BY TP.name, season
   ), seasonAvg AS (
      SELECT P.name AS playerName,
             G.season AS season,
             SUM(A.goals) AS num_goals,
             SUM(A.shots) AS num_shots,
             SUM(A.assists) AS num_assists,
             ROUND(AVG(A.goals), 2) AS avg_goal,
             ROUND(AVG(A.ownGoals), 2) AS avg_own_goal,
             ROUND(AVG(A.shots), 2) AS avg_shots,
             ROUND(AVG(A.assists), 2) AS avg_assists,
             ROUND(AVG(A.keyPasses), 2) AS avg_keyPasses,
             ROUND(AVG(A.yellowCard), 2) AS avg_yellowCard,
             ROUND(AVG(A.redCard), 2) AS avg_redCard,
             ROUND(AVG(A.time), 2) AS avg_minutes
      FROM appearances A
          JOIN games G ON A.gameID = G.gameID
          JOIN players P ON A.playerID = P.playerID
      WHERE P.name = ?
      GROUP BY P.name, G.season
   )
   SELECT TB.name AS name,
         SA.season AS season,
         TB.team AS team,
         TB.league as league,
         TB.TOTAL_APPEARANCE AS games_played,
         SA.num_goals AS num_goals,
         SA.num_shots AS num_shots,
         ROUND(AVG(num_goals / num_shots), 2) AS goals_per_shot,
         SA.avg_goal AS avg_goal_per_game,
         SA.avg_own_goal AS avg_own_goal_per_game,
         SA.avg_shots AS avg_shots_per_game,
         SA.avg_assists AS avg_assists_per_game,
         SA.avg_keyPasses AS avg_keyPasses_per_game,
         SA.avg_yellowCard AS avg_yellowCard,
         SA.avg_redCard AS avg_redCard,
         SA.avg_minutes AS avg_minutes_per_game
   FROM seasonAvg SA
      JOIN teamsBelong TB ON SA.playerName = TB.name AND SA.season = TB.season
   GROUP BY name, season, team
   ORDER BY name, season, team;
      `, [name], (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  } else {
    connection.query(`    
      WITH gamesInfo AS(
        SELECT P.playerID AS playerID, P.name AS name, G.season AS season, G.homeTeamID AS homeTeamID, G.awayTeamID AS awayTeamID, G.leagueID AS leagueID
        FROM players P
            JOIN appearances A ON P.playerID = A.playerID
            JOIN games G ON A.gameID = G.gameID
    ), teamsPlayed AS(
        SELECT playerID, name, season, teamID, leagueID, COUNT(*) AS TOTAL_APPEARANCE
        FROM (SELECT playerID, name, season, homeTeamID AS teamID, leagueID
              FROM gamesInfo
    
              UNION ALL
    
              SELECT playerID, name, season, awayTeamID AS teamID, leagueID
              FROM gamesInfo) TA
        GROUP BY name, season, teamID
        ORDER BY TOTAL_APPEARANCE DESC
    ), teamsBelong AS (
        SELECT TP.playerID, TP.name, season, TP.teamID, T.name AS team, L.name AS league, MAX(TOTAL_APPEARANCE) AS TOTAL_APPEARANCE
        FROM teamsPlayed TP
            JOIN teams T ON TP.teamID = T.teamID
            JOIN leagues L ON TP.leagueID = L.leagueID
        GROUP BY TP.name, season
    ), seasonAvg AS (
        SELECT P.name AS playerName,
              G.season AS season,
              SUM(A.goals) AS num_goals,
              SUM(A.shots) AS num_shots,
              SUM(A.assists) AS num_assists,
              ROUND(AVG(A.goals), 2) AS avg_goal,
              ROUND(AVG(A.ownGoals), 2) AS avg_own_goal,
              ROUND(AVG(A.shots), 2) AS avg_shots,
              ROUND(AVG(A.assists), 2) AS avg_assists,
              ROUND(AVG(A.keyPasses), 2) AS avg_keyPasses,
              ROUND(AVG(A.yellowCard), 2) AS avg_yellowCard,
              ROUND(AVG(A.redCard), 2) AS avg_redCard,
              ROUND(AVG(A.time), 2) AS avg_minutes
        FROM appearances A
            JOIN games G ON A.gameID = G.gameID
            JOIN players P ON A.playerID = P.playerID
        WHERE P.name = ? AND G.season = ?
        GROUP BY P.name, G.season
    )
    SELECT TB.name AS name,
          SA.season AS season,
          TB.team AS team,
          TB.league as league,
          TB.TOTAL_APPEARANCE AS games_played,
          SA.num_goals AS num_goals,
          SA.num_shots AS num_shots,
          ROUND(AVG(num_goals / num_shots), 2) AS goals_per_shot,
          SA.avg_goal AS avg_goal_per_game,
          SA.avg_own_goal AS avg_own_goal_per_game,
          SA.avg_shots AS avg_shots_per_game,
          SA.avg_assists AS avg_assists_per_game,
          SA.avg_keyPasses AS avg_keyPasses_per_game,
          SA.avg_yellowCard AS avg_yellowCard,
          SA.avg_redCard AS avg_redCard,
          SA.avg_minutes AS avg_minutes_per_game
    FROM seasonAvg SA
        JOIN teamsBelong TB ON SA.playerName = TB.name AND SA.season = TB.season
    GROUP BY name, season, team
    ORDER BY name, season, team;
      `, [name, season], (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  }
}

// Route 5: GET /top_leagues
const top_leagues = async function (req, res) {

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
    ORDER BY avg_total_goals DESC,
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

// Route 6: GET /top_offensive_leagues
const top_offensive_leagues = async function (req, res) {

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
    FROM teamstats ts
        JOIN games g ON ts.gameID = g.gameID
        JOIN leagues l ON g.leagueID = l.leagueID
    WHERE ts.season BETWEEN ${startSeason} AND ${endSeason}
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

// Route 7: GET /top_defensive_leagues
const top_defensive_leagues = async function (req, res) {

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

// Route 8: GET /team_roster
const team_roster = async function (req, res) {

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

//Route 9: GET /total_goals
// Total goals per season
const total_goals = async function (req, res) {
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  connection.query(`
    SELECT t.teamID, t.name AS team_name, g.season,
    SUM(CASE WHEN g.homeTeamID = t.teamID THEN g.homeGoals ELSE g.awayGoals END) AS goals_scored,
    SUM(CASE WHEN g.homeTeamID = t.teamID THEN g.awayGoals ELSE g.homeGoals END) AS goals_conceded
    FROM  teams t
    JOIN games g ON t.teamID = g.homeTeamID OR t.teamID = g.awayTeamID
    GROUP BY t.teamID, t.name, g.season
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 10: GET /wld_ratios
// Win/Loss/Draw Ratio Per Season
const wld_ratios = async function (req, res) {
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  connection.query(`
    SELECT t.teamID, t.name AS team_name, g.season, COUNT(*) AS total_games,
    COUNT(CASE WHEN (g.homeTeamID = t.teamID AND g.homeGoals > g.awayGoals) OR (g.awayTeamID = t.teamID AND g.awayGoals > g.homeGoals) THEN 1 END) AS wins,
    COUNT(CASE WHEN (g.homeTeamID = t.teamID AND g.homeGoals < g.awayGoals) OR (g.awayTeamID = t.teamID AND g.awayGoals < g.homeGoals) THEN 1 END) AS losses,
    COUNT(CASE WHEN g.homeGoals = g.awayGoals THEN 1 END) AS draws
    FROM teams t
    JOIN games g ON t.teamID = g.homeTeamID OR t.teamID = g.awayTeamID
    GROUP BY t.teamID, t.name, g.season
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 11: GET /season_performance
// Seasonal Performance
const season_performance = async function (req, res) {
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  connection.query(`
    SELECT t.teamID, t.name AS team_name, g.season,
    SUM(
        CASE
            WHEN (g.homeTeamID = t.teamID AND g.homeGoals > g.awayGoals) OR (g.awayTeamID = t.teamID AND g.awayGoals > g.homeGoals) THEN 3
            WHEN g.homeGoals = g.awayGoals THEN 1
            ELSE 0
        END
    ) AS total_points
    FROM teams t
    JOIN games g ON t.teamID = g.homeTeamID OR t.teamID = g.awayTeamID
    GROUP BY t.teamID, t.name, g.season
    ORDER BY total_points DESC
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 12: GET /efficiency
// Efficiency (Goals per Shot, Goals per Game)
const efficiency = async function (req, res) {
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  connection.query(`
    SELECT t.teamID, t.name AS team_name, g.season,
    SUM(g.homeGoals + g.awayGoals) AS total_goals, SUM(a.shots) AS total_shots,
    (SUM(g.homeGoals + g.awayGoals) * 1.0 / NULLIF(SUM(a.shots), 0)) AS goals_per_shot,
    (SUM(g.homeGoals + g.awayGoals) * 1.0 / NULLIF(COUNT(g.gameID), 0)) AS goals_per_game
    FROM teams t
    RIGHT OUTER JOIN games g ON t.teamID = g.homeTeamID OR t.teamID = g.awayTeamID
    RIGHT OUTER JOIN appearances a ON g.gameID = a.gameID AND (a.playerID IN (SELECT playerID FROM players WHERE homeTeamID = t.teamID OR awayTeamID = t.teamID))
    GROUP BY t.teamID, t.name, g.season
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 13: GET /roster_test
const roster_test = async function (req, res) {
  const teamName = req.query.teamName;
  const startSeason = req.query.startSeason ?? 2014;
  const endSeason = req.query.endSeason ?? 2020;

  let query;
  let queryParams;

  if (teamName) {
    // If teamName is provided, filter by team and seasons
    query = `
      SELECT season, roster
      FROM team_roster
      WHERE team = ? AND season BETWEEN ? AND ?
      ORDER BY season;
    `;
    queryParams = [teamName, parseInt(startSeason), parseInt(endSeason)];
  } else {
    // If no teamName, return all data within the specified seasons
    query = `
      SELECT season, roster
      FROM team_roster
      WHERE season BETWEEN ? AND ?
      ORDER BY season;
    `;
    queryParams = [parseInt(startSeason), parseInt(endSeason)];
  }

  connection.query(query, queryParams, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error executing query' });
    } else {
      res.json(data);
    }
  });
};

module.exports = {
  test,
  top_scorers,
  most_influential_players,
  clutch_players,
  player_performance_per_season,
  top_leagues,
  top_offensive_leagues,
  top_defensive_leagues,
  team_roster,
  total_goals,
  wld_ratios,
  season_performance,
  efficiency
}
