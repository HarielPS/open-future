"use client";
import React, { useState, useEffect } from "react";
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { db } from '../../../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function CalendarioHistorial() {
    const [date, setDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, 'payments'));
            const eventsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setEvents(eventsData);
        };

        fetchData();
    }, []);

    const onDateSelect = (e) => {
        const selectedDate = e.value;
        setDate(selectedDate);
        const event = events.find(event => new Date(event.date).toDateString() === selectedDate.toDateString());
        if (event) {
            setSelectedEvent(event);
            setModalVisible(true);
        }
    };

    return (
        <div className="card" style={{ width: "100%", height: "100%", padding: 0, boxSizing: 'border-box' }}>
            <Calendar value={date} onChange={onDateSelect} inline showWeek style={{ width: "100%", height: "100%", boxSizing: 'border-box' }} />
            <Dialog header="Payment Information" visible={modalVisible} style={{ width: '50vw' }} onHide={() => setModalVisible(false)}>
                {selectedEvent && (
                    <div>
                        <p><strong>Date:</strong> {new Date(selectedEvent.date).toDateString()}</p>
                        <p><strong>Amount:</strong> {selectedEvent.amount}</p>
                        <p><strong>Description:</strong> {selectedEvent.description}</p>
                    </div>
                )}
            </Dialog>
        </div>
    )
}
