'use client'

import { CALENDAR_CLOSING_TIME, CALENDAR_OPENING_HOURS_INTERVAL, CALENDAR_OPEN_TIME, now } from '@/constants/config';
import { getOpeningTimes, roundedToNearestMinutes } from '@/utils/helpers';
import { Day } from '@prisma/client';
import { add, format, formatISO, isBefore, parse } from 'date-fns';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ReactCalendar from 'react-calendar';
export interface CalendarProps {
  days: Day[];
  closedDays: string[]; //as ISO string
}

interface DateType {
  justDate: Date | null;
  dateTime: Date | null;
}

export function Calendar({days, closedDays}:CalendarProps) {
  const router = useRouter();

  //Determine if today is closed
  const today = days.find((d) => d.dayOfWeek == now.getDay());
  const rounded = roundedToNearestMinutes(now, CALENDAR_OPENING_HOURS_INTERVAL);
  const closing = parse(today!.closedTime, 'kk:mm', now);
  const tooLate = !isBefore(rounded, closing);
  
  if(tooLate){
    closedDays.push(formatISO(new Date().setHours(0, 0, 0, 0)))
  }

  const [date, setDate] = useState<DateType>({
    justDate: null,
    dateTime: null
  });

  useEffect(() => {
    if(date.dateTime){
      localStorage.setItem('selectedTime', date.dateTime.toISOString())
      //router.push('/save') //route for save scheduling
    }
    
  },[date.dateTime])

  const getTimes = () => {
    if(!date.justDate) return;

    const { justDate } = date;
    
    const beginning = add(justDate, {hours: CALENDAR_OPEN_TIME});//hour 
    const end = add(justDate, {hours: CALENDAR_CLOSING_TIME});//hour 
    const interval = CALENDAR_OPENING_HOURS_INTERVAL; //in minutes

    const times = [];
    
    for(let i = beginning; i  <= end; i = add(i, {minutes: interval})) {
      times.push(i)
    }

    return times;
  }

  // const times = getTimes();

  const times = date.justDate && getOpeningTimes(date.justDate, days);

  return (
    <div className='h-screen flex flex-col justify-center items-center'>
      {
        date.justDate ? (
          <div className='grid grid-cols-5 gap-4 '>
            {
              times?.map((time, index) => (
                <div key={`time-${index}`} className='  col-span-1'>
                  <button 
                    className='p-2 bg-gray-100 border border-gray-300 rounded-sm'
                    type='button' 
                    onClick={() => setDate((prev) => ({...prev, dateTime: time}) )}
                  >
                    {format(time, 'kk:mm')}
                  </button>
                </div>
              ))
            }
          </div>
        )
        :
        (
          <ReactCalendar 
          className='REACT-CALENDAR p-2' 
          view='month'
          // minDate={new Date()}
          onClickDay={(date) => setDate((prev) => ({...prev, justDate: date}) )}
          tileDisabled={({date}) => closedDays.includes(formatISO(date))}
          locale='pt-BR'

  
        />
        )
      }
     
    </div>
  );
}