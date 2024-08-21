"use client";
import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import Badge from '@mui/material/Badge';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay, DateCalendar, DayCalendarSkeleton } from '@mui/x-date-pickers';
import { Box, Typography, Dialog, DialogTitle, DialogContent } from '@mui/material';

const BasicDateCalendar = ({ events }) => {
  const requestAbortController = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState([]);

  const fetchHighlightedDays = (date) => {
    if (events && events.length > 0) {
      const daysToHighlight = events
        .filter(event => dayjs(event.date).isSame(date, 'month')) // Asegurarse de que los eventos coincidan con el mes y año actual
        .map(event => dayjs(event.date).date());
      
      setHighlightedDays(daysToHighlight);
    } else {
      setHighlightedDays([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // console.log(events);
    fetchHighlightedDays(dayjs());
    return () => requestAbortController.current?.abort();
  }, [events]);

  const handleMonthChange = (date) => {
    if (requestAbortController.current) {
      requestAbortController.current.abort();
    }

    setIsLoading(true);
    setHighlightedDays([]);
    fetchHighlightedDays(date);
  };

  const handleDateClick = (date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    const eventsForDate = events ? events.filter(event => dayjs(event.date).isSame(date, 'day')) : [];
    setEventDetails(eventsForDate);
    setSelectedDate(formattedDate);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEventDetails([]);
  };

  const ServerDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const isSelected = !outsideCurrentMonth && highlightedDays.includes(day.date());

    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={isSelected ? '🔔' : undefined}
      >
        <PickersDay
          {...other}
          outsideCurrentMonth={outsideCurrentMonth}
          day={day}
          onClick={() => handleDateClick(day)}
        />
      </Badge>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        onChange={handleDateClick}
        onMonthChange={handleMonthChange}
        loading={isLoading}
        renderLoading={() => <DayCalendarSkeleton />}
        slots={{
          day: ServerDay,
        }}
        slotProps={{
          day: {
            highlightedDays,
          },
        }}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {eventDetails.length > 0 ? (
            eventDetails.map((event, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="h6">{event.name}</Typography>
                <Typography variant="h6">{event.empresa}</Typography>
                <Typography variant="body1">
                Amount: ${
                  typeof event.amount === 'string'
                    ? parseFloat(event.amount).toFixed(2)
                    : typeof event.amount === 'number'
                    ? event.amount.toFixed(2)
                    : 'N/A'
                }
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body1">No events for this date.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default BasicDateCalendar;
