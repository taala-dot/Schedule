import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Chip,
  Alert,
  Autocomplete
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

export default function Teachers() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState('');

  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
  const hours = Array.from({ length: 8 }, (_, i) => i + 1);

  // Загрузка существующих учителей при монтировании компонента
  useEffect(() => {
    const savedTeachers = localStorage.getItem('teachers');
    if (savedTeachers) {
      setTeachers(JSON.parse(savedTeachers));
    }
  }, []);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSubjectChange = (event, newValue) => {
    setSubject(newValue);
  };

  const handleClassesChange = (e) => {
    setSelectedClasses(e.target.value);
  };

  const handleSlotToggle = (day, hour) => {
    const slotKey = `${day}-${hour}`;
    setAvailableSlots(prev => {
      if (prev.includes(slotKey)) {
        return prev.filter(slot => slot !== slotKey);
      } else {
        return [...prev, slotKey];
      }
    });
  };

  const isSlotAvailable = (day, hour) => {
    const slotKey = `${day}-${hour}`;
    return availableSlots.includes(slotKey);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!subject) {
      setError('Пожалуйста, выберите предмет');
      return;
    }

    const newTeacher = {
      id: Date.now(),
      name,
      subject,
      classes: selectedClasses,
      availableSlots
    };

    const conflicts = teachers.filter(teacher => {
      return teacher.subject === subject && 
             teacher.classes.some(cls => selectedClasses.includes(cls));
    });

    if (conflicts.length > 0) {
      setError('Внимание: Этот предмет уже преподается в выбранных классах другими учителями. Они будут иметь приоритет при составлении расписания.');
    }

    const updatedTeachers = [...teachers, newTeacher];
    setTeachers(updatedTeachers);
    localStorage.setItem('teachers', JSON.stringify(updatedTeachers));

    setName('');
    setSubject('');
    setSelectedClasses([]);
    setAvailableSlots([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Добавление учителя
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Имя учителя"
                value={name}
                onChange={handleNameChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                value={subject}
                onChange={handleSubjectChange}
                options={SUBJECTS}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Предмет"
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Классы</InputLabel>
                <Select
                  multiple
                  value={selectedClasses}
                  onChange={handleClassesChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  required
                >
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((num) => (
                    <MenuItem key={num} value={`${num} класс`}>
                      {num} класс
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Доступное время
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {days.map(day => (
                  <Box key={day}>
                    <Typography variant="subtitle2" gutterBottom>
                      {day}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {hours.map(hour => (
                        <Chip
                          key={`${day}-${hour}`}
                          label={`${hour} урок`}
                          onClick={() => handleSlotToggle(day, hour)}
                          color={isSlotAvailable(day, hour) ? "primary" : "default"}
                          variant={isSlotAvailable(day, hour) ? "filled" : "outlined"}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Добавить учителя
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {teachers.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Зарегистрированные учителя
          </Typography>
          <Grid container spacing={2}>
            {teachers.map(teacher => (
              <Grid item xs={12} sm={6} md={4} key={teacher.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">{teacher.name}</Typography>
                  <Typography color="text.secondary">{teacher.subject}</Typography>
                  <Typography variant="body2">
                    Классы: {teacher.classes.join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    Доступных слотов: {teacher.availableSlots.length}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
} 