import { useEffect } from 'react';
import axios from 'axios';

const NotificationManager = () => {
    useEffect(() => {
        // Request Notification Permission on mount
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        const checkReminders = async () => {
            const token = localStorage.getItem('token');
            if (!token) return; // Not logged in

            try {
                // Fetch medicines directly here to ensure background checking even if user is on another page
                const res = await axios.get('http://localhost:5000/api/medicine', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const medicines = res.data;
                const now = new Date();
                const currentHour = now.getHours().toString().padStart(2, '0');
                const currentMinute = now.getMinutes().toString().padStart(2, '0');
                const currentTime = `${currentHour}:${currentMinute}`;

                // Safety check: Avoid spamming notifications every second
                // We use sessionStorage to track "sent" notifications for this minute
                const lastSentTime = sessionStorage.getItem('last_notification_time');
                if (lastSentTime === currentTime) return;

                medicines.forEach(med => {
                    if (med.times && med.times.includes(currentTime)) {
                        console.log(`Triggering notification for ${med.name}`);
                        // Send Notification
                        if (Notification.permission === "granted") {
                            new Notification(`Time for your ${med.name}`, {
                                body: `Take ${med.dosage}. Current stock: ${med.stock}`,
                                icon: '/vite.svg', // Update with a real pill icon if available
                            });
                            sessionStorage.setItem('last_notification_time', currentTime);
                        }
                    }
                });
            } catch (err) {
                console.error("Failed to check reminders", err);
            }
        };

        // Check every minute (60,000ms)
        const intervalId = setInterval(checkReminders, 60000);

        // Initial check on load (with a small delay to ensure login state is ready)
        const timeoutId = setTimeout(checkReminders, 5000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, []);

    return null; // This component handles side effects only
};

export default NotificationManager;
