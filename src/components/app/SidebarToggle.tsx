import * as React from 'react';
import { ButtonBase } from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

export type SidebarToggleProps = {
	initialOpen?: boolean;
	open?: boolean;
	onToggle?: (open: boolean) => void;
	ariaLabel?: string;
	className?: string;
	sx?: SxProps<Theme>;
	mobileDrawerWidth?: number;
};

const BUTTON_WIDTH = 36;
const FOOTER_HEIGHT_MOBILE = 60;

const SidebarToggle: React.FC<SidebarToggleProps> = ({
	initialOpen = true,
	open: openProp,
	onToggle,
	ariaLabel = 'Toggle sidebar',
	className,
	sx,
	mobileDrawerWidth = 280
}) => {
	const theme = useTheme();
	const isControlled = typeof openProp === 'boolean';
	const [internalOpen, setInternalOpen] = React.useState<boolean>(initialOpen);

	React.useEffect(() => {
		setInternalOpen(initialOpen);
	}, [initialOpen]);

	const currentOpen = isControlled ? (openProp as boolean) : internalOpen;

	const handleToggle = React.useCallback(() => {
		if (isControlled) {
			onToggle?.(!currentOpen);
			return;
		}
		setInternalOpen(prev => {
			const next = !prev;
			onToggle?.(next);
			return next;
		});
	}, [isControlled, currentOpen, onToggle]);

	return (
		<ButtonBase
			onClick={handleToggle}
			aria-label={ariaLabel}
			role="switch"
			aria-checked={currentOpen}
			className={className}
			sx={[
				(t: Theme) => ({
					position: 'fixed',
					top: '50vh',
					left: 0,
					transform: 'translateY(-50%)',
					width: BUTTON_WIDTH,
					height: 72,
					borderTopRightRadius: 14,
					borderBottomRightRadius: 14,
					backgroundColor: '#ffffff',
					color: t.palette.grey[800],
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: 'pointer',
					zIndex: Math.max(t.zIndex.drawer, t.zIndex.modal) + 1,
					boxShadow: currentOpen ? 'none' : '4px 0 8px -4px rgba(0,0,0,0.22)',
					transition: 'transform 300ms ease-in-out, left 300ms ease-in-out, box-shadow 150ms ease',
					[t.breakpoints.down('sm')]: {
						top: 0,
						transform: 'none',
						height: `calc(100vh - ${FOOTER_HEIGHT_MOBILE}px)`,
						left: currentOpen ? mobileDrawerWidth : 0,
						borderTopRightRadius: 0,
						borderBottomRightRadius: 0
					}
				}),
				sx as any
			]}
		>
			<KeyboardDoubleArrowRightIcon
				sx={{
					transition: 'transform 300ms ease-in-out',
					transform: currentOpen ? 'rotate(180deg)' : 'none'
				}}
				fontSize="small"
			 />
		</ButtonBase>
	);
};

export default SidebarToggle;
