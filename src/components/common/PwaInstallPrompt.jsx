import { useState, useEffect } from 'react';
import { Snackbar, Button, IconButton } from '@mui/material';
import { Close as CloseIcon, GetApp as InstallIcon } from '@mui/icons-material';

const PwaInstallPrompt = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setInstallPrompt(e);
            // Update UI notify the user they can install the PWA
            setOpen(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for successful installation
        const handleAppInstalled = () => {
            setInstallPrompt(null);
            setOpen(false);
            console.log('PWA was installed');
        };
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        
        // Show the install prompt
        installPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        setInstallPrompt(null);
        setOpen(false);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <Snackbar
            open={open}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            message="Install GG School app on your device for a better experience"
            action={
                <>
                    <Button 
                        color="primary" 
                        size="small" 
                        variant="contained" 
                        onClick={handleInstallClick}
                        startIcon={<InstallIcon />}
                        sx={{ mr: 1 }}
                    >
                        Install
                    </Button>
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={handleClose}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </>
            }
            sx={{
                '& .MuiSnackbarContent-root': {
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 3
                }
            }}
        />
    );
};

export default PwaInstallPrompt;
