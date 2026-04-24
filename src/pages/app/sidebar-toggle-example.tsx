import * as React from 'react';
import type { NextPage } from 'next';
import { Box, Drawer, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import SidebarToggle from '../../components/app/SidebarToggle';

const drawerWidth = 280;
const toggleWidth = 36;

const SidebarToggleExamplePage: NextPage = () => {
	const theme = useTheme();
	const upSm = useMediaQuery(theme.breakpoints.up('sm'));
	const [open, setOpen] = React.useState<boolean>(true);

	return (
		<Box sx={{ display: 'flex', minHeight: '100vh' }}>
			<SidebarToggle initialOpen={open} onToggle={setOpen} mobileDrawerWidth={drawerWidth} />

			<Drawer
				anchor="left"
				variant={upSm ? 'persistent' : 'temporary'}
				open={open}
				onClose={() => setOpen(false)}
				ModalProps={{ keepMounted: true }}
				sx={{
					'& .MuiDrawer-paper': {
						width: drawerWidth,
						boxSizing: 'border-box'
					}
				}}
			>
				<Box sx={{ p: 2 }}>
					<Typography variant="h6" gutterBottom>
						Sidebar
					</Typography>
					<Typography variant="body2">
						This Drawer opens and closes using the vertical toggle tab.
					</Typography>
				</Box>
			</Drawer>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 2,
					ml: upSm && open ? `${drawerWidth}px` : 0,
					[theme.breakpoints.down('sm')]: {
						ml: open ? 0 : `${toggleWidth}px`
					}
				}}
			>
				<Typography variant="h5" gutterBottom>
					Content Area
				</Typography>
				<Typography variant="body1">
					The toggle remains fixed at the left edge on mobile when closed and moves with the drawer when open.
				</Typography>
			</Box>
		</Box>
	);
};

export default SidebarToggleExamplePage;
