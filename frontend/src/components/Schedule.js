import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';

const SUBJECTS = [
  'Русский язык',
  'Математика',
  'Литература',
  'Иностранный язык (Английский)',
  'История',
  'Физкультура',
  'Технология',
  'Музыка'
];

export default function Schedule() {
  const [schedule, setSchedule] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
  const hours = Array.from({ length: 8 }, (_, i) => i + 1);

  // Загрузка учителей при монтировании компонента
  useEffect(() => {
    const savedTeachers = localStorage.getItem('teachers');
    if (savedTeachers) {
      setTeachers(JSON.parse(savedTeachers));
    }
  }, []);

  const handleCellClick = (day, hour) => {
    setSelectedCell({ day, hour });
    setOpenDialog(true);
  };

  const isTeacherAvailable = (teacher, day, hour) => {
    const slotKey = `${day}-${hour}`;
    return teacher.availableSlots.includes(slotKey);
  };

  const handleTeacherSelect = (teacher) => {
    if (selectedCell) {
      const { day, hour } = selectedCell;
      
      // Проверяем, доступен ли учитель в этот слот
      if (!isTeacherAvailable(teacher, day, hour)) {
        setError('Этот учитель недоступен в выбранное время');
        return;
      }

      // Проверяем, не занят ли уже этот слот
      const slotKey = `${day}-${hour}`;
      const existingTeacher = schedule[slotKey];
      
      if (existingTeacher) {
        // Если слот занят, проверяем приоритет (ID учителя = timestamp регистрации)
        if (existingTeacher.id < teacher.id) {
          setError('Этот слот уже занят учителем с более высоким приоритетом');
          return;
        }
      }

      setSchedule(prev => ({
        ...prev,
        [slotKey]: teacher
      }));
      
      setError('');
      setOpenDialog(false);
      setSelectedCell(null);
    }
  };

  // Фильтруем доступных учителей для выбранного слота
  const getAvailableTeachers = () => {
    if (!selectedCell) return [];
    
    const { day, hour } = selectedCell;
    return teachers
      .filter(teacher => {
        // Фильтруем по классу
        if (selectedClass && !teacher.classes.includes(selectedClass)) {
          return false;
        }
        // Фильтруем по предмету
        if (selectedSubject && teacher.subject !== selectedSubject) {
          return false;
        }
        // Фильтруем по доступности
        return isTeacherAvailable(teacher, day, hour);
      })
      .sort((a, b) => a.id - b.id);
  };

  const generateSchedule = () => {
    setIsGenerating(true);
    setError('');
    const newSchedule = {};

    // Создаем копию учителей и сортируем по времени регистрации (ID)
    const sortedTeachers = [...teachers].sort((a, b) => a.id - b.id);

    // Для каждого класса
    Array.from({ length: 11 }, (_, i) => `${i + 1} класс`).forEach(className => {
      // Для каждого предмета
      SUBJECTS.forEach(subject => {
        // Находим учителей, которые преподают этот предмет в этом классе
        const availableTeachers = sortedTeachers.filter(teacher => 
          teacher.subject === subject && 
          teacher.classes.includes(className)
        );

        if (availableTeachers.length > 0) {
          // Для каждого дня
          days.forEach(day => {
            // Для каждого часа
            hours.forEach(hour => {
              const slotKey = `${day}-${hour}`;
              
              // Если слот еще не занят
              if (!newSchedule[slotKey]) {
                // Ищем учителя, доступного в это время
                const availableTeacher = availableTeachers.find(teacher =>
                  teacher.availableSlots.includes(slotKey)
                );

                if (availableTeacher) {
                  newSchedule[slotKey] = {
                    ...availableTeacher,
                    currentClass: className
                  };
                }
              }
            });
          });
        }
      });
    });

    setSchedule(newSchedule);
    setIsGenerating(false);
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Расписание уроков
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Класс</InputLabel>
            <Select
              value={selectedClass}
              onChange={handleClassChange}
              label="Класс"
            >
              <MenuItem value="">Все классы</MenuItem>
              {Array.from({ length: 11 }, (_, i) => i + 1).map(num => (
                <MenuItem key={num} value={`${num} класс`}>
                  {num} класс
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Предмет</InputLabel>
            <Select
              value={selectedSubject}
              onChange={handleSubjectChange}
              label="Предмет"
            >
              <MenuItem value="">Все предметы</MenuItem>
              {SUBJECTS.map(subject => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={generateSchedule}
            disabled={isGenerating}
            fullWidth
          >
            {isGenerating ? 'Генерация расписания...' : 'Сгенерировать расписание'}
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Время</TableCell>
              {days.map(day => (
                <TableCell 
                  key={day} 
                  sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: '#f5f5f5',
                    textAlign: 'center'
                  }}
                >
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {hours.map(hour => (
              <TableRow key={hour}>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  {hour} урок
                </TableCell>
                {days.map(day => {
                  const cellKey = `${day}-${hour}`;
                  const cellData = schedule[cellKey];
                  const showCell = !selectedClass || (cellData && cellData.currentClass === selectedClass);
                  const showSubject = !selectedSubject || (cellData && cellData.subject === selectedSubject);

                  return (
                    <TableCell 
                      key={cellKey}
                      sx={{ 
                        backgroundColor: cellData ? '#e3f2fd' : 'white',
                        height: '80px',
                        textAlign: 'center',
                        opacity: showCell && showSubject ? 1 : 0.3
                      }}
                    >
                      {cellData && showCell && showSubject ? (
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {cellData.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {cellData.subject}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cellData.currentClass}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Выберите учителя</DialogTitle>
        <DialogContent>
          {getAvailableTeachers().length === 0 ? (
            <Typography color="error">
              Нет доступных учителей для этого времени
            </Typography>
          ) : (
            <List>
              {getAvailableTeachers().map((teacher, index) => (
                <React.Fragment key={teacher.id}>
                  <ListItem 
                    button 
                    onClick={() => handleTeacherSelect(teacher)}
                    sx={{ 
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <ListItemText
                      primary={teacher.name}
                      secondary={`${teacher.subject} (Классы: ${teacher.classes.join(', ')})`}
                    />
                  </ListItem>
                  {index < getAvailableTeachers().length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setError('');
          }}>
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 