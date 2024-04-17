const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/test', routes.test);
app.get('/author/:type', routes.author);
app.get('/top_scorers', routes.top_scorers);
app.get('/most_influential_players', routes.most_influential_players);
app.get('/clutch_players', routes.clutch_players);
app.get('/player_performance_per_season', routes.player_performance_per_season);
app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
