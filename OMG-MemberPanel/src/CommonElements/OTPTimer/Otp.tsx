import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Btn } from "../../AbstractElements";
const OTPTimer = (ResOTP: any) => {
    const [timer, setTimer] = useState('');
    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
        if (isTimerActive) {
            const duration = moment.duration({
                minutes: 0,
                seconds: ResOTP[0]?.SecondsLeft || 0,
            });
            const interval = 1000; // 1 second

            const intervalId = setInterval(() => {
                const secondsLeft = duration.asSeconds() - 1;

                if (secondsLeft < 0) {
                    clearInterval(intervalId);
                    setTimer('Send OTP');
                    setIsTimerActive(false);
                    return;
                }

                duration.seconds();
                const min = Math.floor(secondsLeft / 60);
                const sec = Math.floor(secondsLeft % 60);

                setTimer(
                    `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
                );
            }, interval);

            return () => clearInterval(intervalId);
        }
    }, [isTimerActive, ResOTP]);

    const startTimer = () => {
        setIsTimerActive(true);
        setTimer('');
    };

    return (
        <div>

            <Btn onClick={startTimer} color="info" style={{ position: 'absolute', right: '2px', bottom: '2px', backgroundColor: '#d0b163', borderColor: '#d0b163', color: '#000' }}>
                {timer || 'Send OTP'}
            </Btn>
        </div>
    );
};

export default OTPTimer;
