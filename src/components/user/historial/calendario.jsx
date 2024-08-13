// CalendarComponent.js
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarStyles.css'; // Custom styles to match your design

const CalendarComponent = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="calendar-container">
      <Calendar
        onChange={setDate}
        value={date}
        selectRange={false} // Change to true if you want range selection
        className="custom-calendar"
      />
    </div>
  );
};

export default CalendarComponent;
