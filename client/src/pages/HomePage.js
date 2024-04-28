import { useEffect, useState } from 'react';
import { CircularProgress, Container, Divider, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Skeleton, List, ListItem, ListItemText } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
  const isLoading = isLoadingTopScorers || isLoadingInfluentialPlayers || isLoadingClutchPlayers;
  
  // Define the theme for the tables
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
              {isLoadingTopScorers ? ( // Conditional rendering for loading state
                Array.from(new Array(5)).map((_, index) => ( // Replace with Skeletons
                  <TableRow key={index}> 
                    {topScorersColumns.map((column) => (
                      <TableCell key={column.field} align={column.align}>
                        <Skeleton variant="text" width={column.width} /> 
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : ( 
                topScorers.map((player) => ( // No need for curly braces here
                  <TableRow key={player.league_name + player.player_name}> {/* Unique key suggestion */}
                    {topScorersColumns.map((column) => (
                      <TableCell key={column.field} align={column.align}>
                        {player[column.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                )) // Close parentheses correctly
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
                  <TableRow key={player.player_id}>
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
                  <TableRow key={player.player_id}> 
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

    </Container>
  );
};