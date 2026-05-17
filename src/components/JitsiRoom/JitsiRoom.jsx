import { JitsiMeeting } from '@jitsi/react-sdk';
import { Box, Typography, Chip, IconButton, Tooltip, Paper } from '@mui/material';
import { FiberManualRecord, Close, Videocam } from '@mui/icons-material';

/**
 * JitsiRoom — reusable embedded Jitsi Meet panel.
 *
 * Props:
 *   roomName    {string}   — Unique Jitsi room identifier (auto-generated from course ID)
 *   displayName {string}   — User's display name inside the call
 *   role        {'Teacher'|'Student'} — Grants moderator rights to teachers
 *   onLeave     {Function} — Called when the user hangs up or closes the panel
 */
export default function JitsiRoom({ roomName, displayName, role = 'Student', onLeave }) {
    const isTeacher = role === 'Teacher';

    return (
        <Paper
            elevation={4}
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: isTeacher ? '2px solid #f44336' : '2px solid #2e7d32',
                position: 'relative',
            }}
        >
            {/* Header bar */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    bgcolor: isTeacher ? 'error.dark' : 'success.dark',
                    color: 'white',
                }}
            >
                <Videocam fontSize="small" />

                {isTeacher ? (
                    <Chip
                        icon={
                            <FiberManualRecord
                                sx={{
                                    fontSize: 10,
                                    color: 'white !important',
                                    animation: 'jitsiPulse 1.2s infinite',
                                    '@keyframes jitsiPulse': {
                                        '0%, 100%': { opacity: 1 },
                                        '50%': { opacity: 0.3 },
                                    },
                                }}
                            />
                        }
                        label="LIVE — Broadcasting"
                        size="small"
                        sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 'bold', letterSpacing: 1 }}
                    />
                ) : (
                    <Chip
                        icon={<FiberManualRecord sx={{ fontSize: 10, color: 'white !important' }} />}
                        label="Live Session"
                        size="small"
                        sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 'bold' }}
                    />
                )}

                <Typography variant="caption" sx={{ opacity: 0.8, flexGrow: 1 }}>
                    {displayName}
                </Typography>

                {onLeave && (
                    <Tooltip title="Leave video call (attendance stays logged)">
                        <IconButton size="small" onClick={onLeave} sx={{ color: 'white' }}>
                            <Close fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* Jitsi iframe */}
            <JitsiMeeting
                domain="meet.jit.si"
                roomName={roomName}
                configOverwrite={{
                    startWithAudioMuted: true,
                    startWithVideoMuted: !isTeacher, // Teacher starts with video on
                    disableModeratorIndicator: false,
                    enableEmailInStats: false,
                    prejoinPageEnabled: false,        // Skip the pre-join screen
                    disableDeepLinking: true,
                    toolbarButtons: isTeacher
                        ? [
                            'microphone', 'camera', 'desktop', 'participants-pane',
                            'chat', 'recording', 'raisehand', 'tileview',
                            'select-background', 'hangup',
                          ]
                        : [
                            'microphone', 'camera', 'chat',
                            'raisehand', 'tileview', 'hangup',
                          ],
                }}
                interfaceConfigOverwrite={{
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                    BRAND_WATERMARK_LINK: '',
                    DEFAULT_BACKGROUND: '#1a1a2e',
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    MOBILE_APP_PROMO: false,
                }}
                userInfo={{
                    displayName: isTeacher ? `${displayName} (Teacher)` : displayName,
                    moderator: isTeacher,
                }}
                onReadyToClose={onLeave}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '520px';
                    iframeRef.style.width = '100%';
                    iframeRef.style.border = 'none';
                    iframeRef.style.display = 'block';
                }}
            />
        </Paper>
    );
}
