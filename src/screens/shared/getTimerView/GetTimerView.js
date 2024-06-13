import React, {useState, useEffect} from 'react';
import {Text} from 'react-native';
import moment from 'moment';

const GetTimerView = ({style, date}) => {
  const [timeText, setTimeText] = useState('');

  useEffect(() => {
    // save intervalId to clear the interval when the
    // component re-renders
    const intervalId = setInterval(() => {
      setTimeText(timeRemaining(date, moment(new Date())));
    }, 1000);

    // clear interval on re-render to avoid memory leaks
    return () => clearInterval(intervalId);
    // add timeLeft as a dependency to re-rerun the effect
    // when we update it
  }, [timeText]);

  function timeRemaining(start, end) {
    // get unix seconds
    const began = moment(start).unix();
    const stopped = moment(end).unix();
    // find difference between unix seconds
    const difference = began - stopped;

    // apply to moment.duration
    const duration = moment.duration(difference, 'seconds');
    // then format the duration
    const h = duration.hours().toString().padStart(2, '0');
    const m = duration.minutes().toString().padStart(2, '0');
    const s = duration.seconds().toString().padStart(2, '0');
    return `${h}h:${m}m:${s}s`;
  }

  return (
    <Text
      // ref={timerRef}
      style={style}>
      {timeText}
    </Text>
  );
};

export {GetTimerView};
