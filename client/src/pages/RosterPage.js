// import React, { useEffect, useState } from 'react';
// import { Container, Typography } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';

// const config = require('../config.json');

// export default function RosterPage() {
//     const [rows, setRows] = useState([]);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         setLoading(true);
//         fetch(`http://${config.server_host}:${config.server_port}/roster_test?teamName=Liverpool`)
//             .then(res => res.json())
//             .then(data => {
//                 setRows(data.map((item, index) => ({ ...item, id: index })));
//                 setLoading(false);
//             })
//             .catch(err => {
//                 console.error('Failed to fetch data:', err);
//                 setLoading(false);
//             });
//     }, []);

//     const columns = [
//         { field: 'season', headerName: 'Season', width: 150 },
//         { field: 'roster', headerName: 'Roster', width: 400, flex: 1 }
//     ];

//     return (
//         <Container>
//             <Typography variant="h4" gutterBottom>
//                 Liverpool Roster by Season
//             </Typography>
//             <div style={{ height: 600, width: '100%' }}>
//                 <DataGrid
//                     rows={rows}
//                     columns={columns}
//                     pageSize={10}
//                     // rowsPerPageOptions={[5, 10, 25]}
//                     loading={loading}
//                 />
//             </div>
//         </Container>
//     );
// }

import React, { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const config = require('../config.json');

export default function RosterPage({ teamNameProp }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const teamName = teamNameProp || 'Liverpool'; // Use the prop if available, otherwise default to 'Liverpool'

    useEffect(() => {
        setLoading(true);
        fetch(`http://${config.server_host}:${config.server_port}/roster_test?teamName=${teamName}`)
            .then(res => res.json())
            .then(data => {
                setRows(data.map((item, index) => ({ ...item, id: index })));
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch data:', err);
                setLoading(false);
            });
    }, [teamName]);

    // const columns = [
    //     { field: 'season', headerName: 'Season', width: 150 },
    //     { field: 'roster', headerName: 'Roster', width: 650, flex: 1 }
    // ];
    const columns = [
        { field: 'season', headerName: 'Season', width: 150 },
        {
            field: 'roster',
            headerName: 'Roster',
            width: 650,
            flex: 1,
            renderCell: (params) => (
                <div 
                style={{ 
                    maxHeight: '50px', // Set a smaller max height
                    overflow: 'auto',  // Apply the scrollbar if content overflows
                    whiteSpace: 'nowrap',
                    cursor: 'pointer' // Optional: makes it clear the text is interactable
                    }}
                >
                    {params.value}
                </div>
            ),
        }
    ];
    

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" gutterBottom>
                {teamName} Roster by Season
            </Typography>
            <div style={{ width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    autoHeight
                    // Disable pagination
                    pagination={false}
                    hideFooter
                />
            </div>
        </Container>
    );
}
