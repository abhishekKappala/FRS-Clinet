import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Fade,
  LinearProgress,
  Chip,
  Avatar
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  PhotoCamera,
  Search as SearchIcon,
  Check as CheckIcon,
  RestartAlt as RestartIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
  Download as DownloadIcon,
  Undo as UndoIcon
} from '@mui/icons-material';

// Stats Component
const AttendanceStats = ({ presentCount, totalCount }) => {
  const attendanceRate = ((presentCount / totalCount) * 100).toFixed(1);
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mb: 2 
              }}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h4" color="primary.main">
                  {attendanceRate}%
                </Typography>
              </Box>
              <Typography color="text.secondary" variant="body2">
                Attendance Rate
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mb: 2 
              }}>
                <Avatar sx={{ bgcolor: 'secondary.light', mr: 2 }}>
                  <GroupIcon />
                </Avatar>
                <Typography variant="h4" color="secondary.main">
                  {presentCount}/{totalCount}
                </Typography>
              </Box>
              <Typography color="text.secondary" variant="body2">
                Students Present
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mb: 2 
              }}>
                <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                  <AccessTimeIcon />
                </Avatar>
                <Typography variant="h4" color="text.primary">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
              <Typography color="text.secondary" variant="body2">
                Last Updated
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const MarkAttendance = () => {
  // States
  const [activeStep, setActiveStep] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceProcessed, setAttendanceProcessed] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [presentStudents, setPresentStudents] = useState([]);
  const [absentStudents, setAbsentStudents] = useState([]);
  const [recentlyMoved, setRecentlyMoved] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Sample student database
  const allStudents = [
    { id: '001', name: 'John Doe' },
    { id: '002', name: 'Jane Smith' },
    { id: '003', name: 'Alice Johnson' },
    { id: '004', name: 'Bob Wilson' },
    { id: '005', name: 'Charlie Brown' }
  ];

  // Camera cleanup effect
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(null);
    } catch (error) {
      setCameraError('Unable to access camera. Please check permissions.');
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleStartCapture = async () => {
    await startCamera();
    setIsCapturing(true);
    setFrameCount(0);
    
    const interval = setInterval(() => {
      setFrameCount(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          handleCaptureComplete();
          return 5;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleCaptureComplete = () => {
    setIsCapturing(false);
    stopCamera();
    setTimeout(() => {
      const presentIds = new Set(allStudents
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(allStudents.length * 0.7))
        .map(s => s.id));
      
      setPresentStudents(allStudents.filter(s => presentIds.has(s.id)));
      setAbsentStudents(allStudents.filter(s => !presentIds.has(s.id)));
      setAttendanceProcessed(true);
      setActiveStep(1);
    }, 2000);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFrameCount(0);
    setIsCapturing(false);
    setAttendanceProcessed(false);
    setPresentStudents([]);
    setAbsentStudents([]);
    setRecentlyMoved(null);
    stopCamera();
  };

  const moveToPresent = (student) => {
    setAbsentStudents(prev => prev.filter(s => s.id !== student.id));
    setPresentStudents(prev => [...prev, student]);
    setRecentlyMoved(student);
  };

  const undoMove = () => {
    if (recentlyMoved) {
      setPresentStudents(prev => prev.filter(s => s.id !== recentlyMoved.id));
      setAbsentStudents(prev => [...prev, recentlyMoved]);
      setRecentlyMoved(null);
    }
  };

  const filteredPresentStudents = presentStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.id.includes(searchQuery)
  );

  const steps = ['Capture Attendance', 'Review & Adjust'];

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4 
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                background: 'linear-gradient(45deg, #2196f3 30%, #4caf50 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}
            >
              Mark Attendance 
            </Typography>
            {attendanceProcessed && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #2196f3 30%, #4caf50 90%)',
                  color: 'white',
                }}
              >
                Export Report
              </Button>
            )}
          </Box>

          {/* Stats Overview - Only shown after capture */}
          {attendanceProcessed && (
            <AttendanceStats 
              presentCount={presentStudents.length} 
              totalCount={allStudents.length}
            />
          )}
          
          {/* Stepper */}
          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              mb: 4,
              '& .MuiStepLabel-root .Mui-completed': {
                color: 'secondary.main',
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: 'primary.main',
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Camera Section */}
          {activeStep === 0 && (
            <Card 
              sx={{ 
                mb: 4,
                background: 'linear-gradient(120deg, rgba(33, 150, 243, 0.05), rgba(76, 175, 80, 0.05))'
              }}
            >
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 3 
                }}>
                  <Box sx={{ 
                    width: '100%',
                    maxWidth: 640,
                    height: 480,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                  }}>
                    {!isCapturing && !videoRef.current?.srcObject && (
                      <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}>
                        <PhotoCamera sx={{ fontSize: 64, color: 'primary.light' }} />
                        <Typography color="text.secondary" sx={{ mt: 2 }}>
                          Click Start Capture to begin
                        </Typography>
                      </Box>
                    )}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {isCapturing && (
                      <Box sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        p: 1,
                        borderRadius: 1,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}>
                        <Typography color="primary">
                          Frame {frameCount + 1}/5
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(frameCount + 1) * 20} 
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    )}
                  </Box>

                  {cameraError && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        width: '100%',
                        borderRadius: 2
                      }}
                    >
                      {cameraError}
                    </Alert>
                  )}
                  
                  <Button
                    variant="contained"
                    onClick={handleStartCapture}
                    disabled={isCapturing}
                    startIcon={<PhotoCamera />}
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem'
                    }}
                  >
                    Start Capture
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {activeStep === 1 && (
            <Fade in={attendanceProcessed}>
              <Box>
                <Box sx={{ 
                  mb: 3, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <Typography variant="h6">
                    Attendance Results
                  </Typography>
                  <Box>
                    {recentlyMoved && (
                      <Button
                        variant="outlined"
                        startIcon={<UndoIcon />}
                        onClick={undoMove}
                        sx={{ mr: 2 }}
                      >
                        Undo Last Move
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<RestartIcon />}
                      onClick={handleReset}
                      sx={{ borderRadius: 20 }}
                    >
                      Reset
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  {/* Present Students List */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Present Students
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Search students..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          InputProps={{
                            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                          }}
                          sx={{ mb: 2 }}
                        />
                        <List>
                          {filteredPresentStudents.map((student) => (
                            <ListItem
                              key={student.id}
                              sx={{
                                bgcolor: 'background.paper',
                                mb: 1,
                                borderRadius: 1,
                              }}
                            >
                              <ListItemText
                                primary={student.name}
                                secondary={`ID: ${student.id}`}
                              />
                              <Chip
                                color="success"
                                label="Present"
                                size="small"
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                   <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Absent Students
                        </Typography>
                        <List>
                          {absentStudents.map((student) => (
                            <ListItem
                              key={student.id}
                              sx={{
                                bgcolor: 'background.paper',
                                mb: 1,
                                borderRadius: 1,
                              }}
                            >
                              <ListItemText
                                primary={student.name}
                                secondary={`ID: ${student.id}`}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip
                                  label="Absent"
                                  size="small"
                                  sx={{
                                    color: 'white',
                                    borderColor: 'error.main',
                                    bgcolor: 'error.light',
                                    opacity: 0.9
                                  }}
                                />
                                <Button
                                  size="small"
                                  onClick={() => moveToPresent(student)}
                                  sx={{
                                    minWidth: 'auto',
                                    color: 'primary.main',
                                    '&:hover': {
                                      bgcolor: 'primary.light',
                                      color: 'white'
                                    }
                                  }}
                                >
                                  Move
                                </Button>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    error: {
      main: '#ef5350',
      light: '#e57373',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 4px 6px rgba(33, 150, 243, 0.2)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

export default MarkAttendance;