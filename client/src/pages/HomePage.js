import { useEffect, useState } from 'react';
import { Container, Divider, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, List, ListItem, ListItemText } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';


import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
const config = require('../config.json');

export default function HomePage() {
  // We use the setState hook to persist information across renders (such as the result of our API calls)
  const [topScorers, setTopScorers] = useState([]);
  const [influentialPlayers, setInfluentialPlayers] = useState([]);
  const [clutchPlayers, setClutchPlayers] = useState([]);

  const theme = createTheme({
    components: {
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 'bold',
            fontFamily: 'Roboto',
            fontSize: '14px',
            color: 'black',
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
    const fetchData = async () => {
      try {
        // Fetch data from the server
        const [topScorersData, influentialPlayersData, clutchPlayersData] = await Promise.all([
          fetch(`http://${config.server_host}:${config.server_port}/top_scorers`),
          fetch(`http://${config.server_host}:${config.server_port}/most_influential_players`),
          fetch(`http://${config.server_host}:${config.server_port}/clutch_players`)
        ]);
        
        // Parse JSON responses
        const topScorers = await topScorersData.json();
        const influentialPlayers = await influentialPlayersData.json();
        const clutchPlayers = await clutchPlayersData.json();

        // Set the state variables with the fetched data
        setTopScorers(topScorers);
        setInfluentialPlayers(influentialPlayers);
        setClutchPlayers(clutchPlayers);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle errors (display an error message to the user)
      }
    };

    fetchData();
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

  return (
    <Container>
      <Divider />
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
              {topScorers.map((player) => (
                <TableRow key={player.league_name + player.player_name}> {/* Unique key suggestion */}
                  {topScorersColumns.map((column) => (
                    <TableCell key={column.field} align={column.align}>
                      {player[column.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
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
              {influentialPlayers.map((player) => (
                <TableRow key={player.player_id}>
                  {influentialPlayersColumns.map((column) => (
                    <TableCell key={column.field} align={column.align}>
                      {player[column.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
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
              {clutchPlayers.slice(0, 10).map((player) => ( // Limit to top 10
                <TableRow key={player.player_id}> 
                  {clutchPlayersColumns.map((column) => (
                    <TableCell key={column.field} align={column.align}>
                      {player[column.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ThemeProvider>
    </Container>
  );
};