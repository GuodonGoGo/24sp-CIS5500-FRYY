import { useEffect, useState } from 'react';
import { CircularProgress, Container, Divider, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Skeleton, List, ListItem, ListItemText } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Modal from '@mui/material/Modal';
import '../styles.css';

import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';

const config = require('../config.json');

export default function HomePage() {
  // We use the setState hook to persist information across renders (such as the result of our API calls)
  const [topScorers, setTopScorers] = useState([]);
  const [influentialPlayers, setInfluentialPlayers] = useState([]);
  const [clutchPlayers, setClutchPlayers] = useState([]);

  // Use the useState hook to store the loading state of our data
  const [isLoadingTopScorers, setIsLoadingTopScorers] = useState(false); 
  const [isLoadingInfluentialPlayers, setIsLoadingInfluentialPlayers] = useState(false); 
  const [isLoadingClutchPlayers, setIsLoadingClutchPlayers] = useState(false); 
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const isLoading = isLoadingTopScorers || isLoadingInfluentialPlayers || isLoadingClutchPlayers;

  // For the jump out modal
  const [playerStats, setPlayerStats] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Define the theme for the tables
  const theme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: 'rgba(0, 0, 0, 0.6)', // Adjust transparency as needed
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 'bold',
            fontFamily: 'Roboto',
            fontSize: '14px',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            textTransform: 'uppercase',
            padding: '10px',
          },
        },
      },
    },
  });

  // The useEffect hook by default runs the provided callback after every render
  // The second (optional) argument, [], is the dependency array which signals
  // to the hook to only run the provided callback if the value of the dependency array
  // changes from the previous render. In this case, an empty array means the callback
  // will only run on the very first render.
  useEffect(() => {
    const fetchTopScorers = async () => {
      try {
        setIsLoadingTopScorers(true);
        const startTime = Date.now();
        const response = await fetch(`http://${config.server_host}:${config.server_port}/top_scorers`);
        const data = await response.json();
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        const delay = Math.max(0, 3000 - elapsedTime); // Minimum delay of 3 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
        setTopScorers(data);
        setIsLoadingTopScorers(false);
      } catch (error) {
        console.error("Error fetching top scorers:", error);
        setIsLoadingTopScorers(false);
      }
    };
  
    const fetchInfluentialPlayers = async () => {
      try {
        setIsLoadingInfluentialPlayers(true);
        const startTime = Date.now();
        const response = await fetch(`http://${config.server_host}:${config.server_port}/most_influential_players`);
        const data = await response.json();
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        const delay = Math.max(0, 3000 - elapsedTime); // Minimum delay of 3 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
        setInfluentialPlayers(data);
        setIsLoadingInfluentialPlayers(false);
      } catch (error) {
        console.error("Error fetching influential players:", error);
        setIsLoadingInfluentialPlayers(false);
      }
    };
  
    const fetchClutchPlayers = async () => {
      try {
        setIsLoadingClutchPlayers(true);
        const startTime = Date.now();
        const response = await fetch(`http://${config.server_host}:${config.server_port}/clutch_players`);
        const data = await response.json();
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        const delay = Math.max(0, 3000 - elapsedTime); // Minimum delay of 3 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
        setClutchPlayers(data);
        setIsLoadingClutchPlayers(false);
      } catch (error) {
        console.error("Error fetching clutch players:", error);
        setIsLoadingClutchPlayers(false);
      }
    };
  
    // Schedule the fetch functions based on their expected execution time
    const scheduleFetch = async () => {
      // Fetch data for all three sets
      const fetchPromises = [fetchTopScorers(), fetchInfluentialPlayers(), fetchClutchPlayers()];
  
      // Wait for all promises to resolve, then update state
      await Promise.all(fetchPromises);
    };
  
    scheduleFetch();
  }, []);
  
  

  // Define the columns for the top scorers list
  const topScorersColumns = [
    { field: 'player_name', headerName: 'Player', width: 180 }, 
    { field: 'league_name', headerName: 'League', width: 150 },
    { field: 'total_goals', headerName: 'Total Goals', width: 120, align: 'right' },
  ];

  // Define the columns for the most influential scorers table
  const influentialPlayersColumns = [
    { field: 'player_name', headerName: 'Player', width: 150 },
    { field: 'appearances', headerName: 'Appearances', width: 100, align: 'right' },
    { field: 'total_goals', headerName: 'Goals', width: 80, align: 'right' },
    { field: 'total_assists', headerName: 'Assists', width: 80, align: 'right' },
    { field: 'goals_from_shots', headerName: 'Goals from Shots', width: 150, align: 'right' },
  ];

  // Define the columns for the most influential players table
  const clutchPlayersColumns = [
    { field: 'name', headerName: 'Player', width: 150 }, // Assuming you're using 'name' in your data
    { field: 'late_goals', headerName: 'Late Goals', width: 100, align: 'right' }, 
  ];

  const fetchPlayerStats = async (playerName, season) => {
    try {
      setIsLoadingStats(true);
      setIsModalOpen(true); 
      const response = await fetch(`http://${config.server_host}:${config.server_port}/player_performance_per_season?name=${playerName}`);
      const data = await response.json();
      setPlayerStats(data);
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const modalStyles = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',  // Match MUI theme
    boxShadow: 24,
    padding: 4, 
    // ... more styles as needed 
  };

  return (
    <Container>
      {isLoading && (
        <div className="loading-overlay"> 
          <CircularProgress size={80} /> 
        </div>
      )}

      <h2>Top Scorers Across Leagues</h2>
      <ThemeProvider theme={theme}>
        <TableContainer component={Paper}>
          <Table size="small" aria-label="top scorers table">
            <TableHead>
              <TableRow>
                {topScorersColumns.map((column) => (
                  <TableCell key={column.field} align={column.align}>
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingTopScorers ? ( 
                Array.from(new Array(5)).map((_, index) => ( 
                  <TableRow key={index}> 
                    {topScorersColumns.map((column) => (
                      <TableCell key={column.field} align={column.align}>
                        <Skeleton variant="text" width={column.width} /> 
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : ( 
                topScorers.map((player) => ( 
                  <TableRow key={player.league_name + player.player_name}
                    onClick={() => fetchPlayerStats(player.player_name)} 
                    sx={{ '&:hover': { cursor: 'pointer', backgroundColor: 'grey' }}}
                  > 
                    {topScorersColumns.map((column) => (
                      <TableCell key={column.field} align={column.align}>
                        {player[column.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))         
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ThemeProvider>


      <Divider />
      <h2>Top 10 Most Influential Players</h2>
      <ThemeProvider theme={theme}>
        <TableContainer component={Paper}>
          <Table size="small" aria-label="influential players table"> 
            <TableHead>
              <TableRow>
                {influentialPlayersColumns.map((column) => (
                  <TableCell key={column.field} align={column.align}>
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingInfluentialPlayers ? ( // Conditional rendering for loading state
                Array.from(new Array(5)).map((_, index) => ( 
                  <TableRow key={index}> 
                    {influentialPlayersColumns.map((column) => (
                      <TableCell key={column.field} align={column.align}>
                        <Skeleton variant="text" width={column.width} /> 
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : ( 
                influentialPlayers.map((player) => (
                  <TableRow key={player.player_id}
                    onClick={() => fetchPlayerStats(player.player_name)} 
                    sx={{ '&:hover': { cursor: 'pointer', backgroundColor: 'grey' }}}
                  >
                    {influentialPlayersColumns.map((column) => (
                      <TableCell key={column.field} align={column.align}>
                        {player[column.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
      </TableBody>
          </Table>
        </TableContainer>
      </ThemeProvider>
      
      <Divider />
      <h2>Top 10 Clutch Players</h2>
      <ThemeProvider theme={theme}> 
        <TableContainer component={Paper}>
          <Table size="small" aria-label="clutch players table"> 
            <TableHead>
              <TableRow>
                {clutchPlayersColumns.map((column) => (
                  <TableCell key={column.field} align={column.align}>
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingClutchPlayers ? ( 
                Array.from(new Array(5)).map((_, index) => ( 
                  <TableRow key={index}> 
                    {clutchPlayersColumns.map((column) => (
                      <TableCell key={column.field} align={column.align}>
                        <Skeleton variant="text" width={column.width} /> 
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                clutchPlayers.slice(0, 10).map((player) => (
                  <TableRow key={player.player_id}
                    onClick={() => fetchPlayerStats(player.player_name)} 
                    sx={{ '&:hover': { cursor: 'pointer', backgroundColor: 'grey' }}}
                  > 
                    {clutchPlayersColumns.map((column) => (
                      <TableCell key={column.field} align={column.align}>
                        {player[column.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ThemeProvider>
        
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div style={modalStyles}>
          <h2 style={{ backgroundColor: 'black', padding: '10px' }}>
            Player Statistics: {playerStats ? playerStats[0].playerName : ''}
          </h2>
          {isLoadingStats ? (
            <div className="loading-overlay"> 
              <CircularProgress size={80} /> 
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}> {/* Scrollable container */}
              <TableContainer component={Paper} sx={{ maxWidth: 800 }}> {/* Adjust maxWidth if needed */}
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Season</TableCell>
                      <TableCell align="right">League</TableCell>
                      <TableCell align="right">Games Played</TableCell>
                      <TableCell align="right">Goals</TableCell>
                      <TableCell align="right">Shots</TableCell>
                      <TableCell align="right">Goals/Shot</TableCell>
                      <TableCell align="right">Avg Goals/Game</TableCell>
                      <TableCell align="right">Avg Shots/Game</TableCell>
                      <TableCell align="right">Avg Assists/Game</TableCell>
                      <TableCell align="right">Avg Key Passes/Game</TableCell>
                      <TableCell align="right">Avg Yellow Card/Game</TableCell>
                      <TableCell align="right">Avg Red Card/Game</TableCell>
                      <TableCell align="right">Avg Minutes/Game</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {playerStats && playerStats.map((row) => (
                      <TableRow key={row.season}>
                        <TableCell>{row.season}</TableCell>
                        <TableCell align="right">{row.league}</TableCell>
                        <TableCell align="right">{row.games_played}</TableCell>
                        <TableCell align="right">{row.num_goals}</TableCell>
                        <TableCell align="right">{row.num_shots}</TableCell>
                        <TableCell align="right">{row.goals_per_shot}</TableCell>
                        <TableCell align="right">{row.avg_goal_per_game}</TableCell>
                        <TableCell align="right">{row.avg_shots_per_game}</TableCell>
                        <TableCell align="right">{row.avg_assists_per_game}</TableCell>
                        <TableCell align="right">{row.avg_keyPasses_per_game}</TableCell>
                        <TableCell align="right">{row.avg_yellowCard}</TableCell>
                        <TableCell align="right">{row.avg_redCard}</TableCell>
                        <TableCell align="right">{row.avg_minutes_per_game}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </div>
      </Modal>

    </Container>
  );
};