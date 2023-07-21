import { CALENDAR_OPENING_HOURS_INTERVAL, now } from '@/constants/config';
import { Day } from '@prisma/client';
import { add, addMinutes, getHours, getMinutes, isBefore, isEqual, parse } from "date-fns";
export const weekDayIndexToName = (index: number) => {
  const days = [ 'domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  return days[index];
}

export function classesNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

//function to round a given date up to the nearest half hour
export const roundedToNearestMinutes = (date: Date, interval: number) => {
  const minutesLeftUntilNextInterval = interval - (getMinutes(date) % interval);
  return addMinutes(date, minutesLeftUntilNextInterval);

}

/**
 * 
 * @param startDate Day we want to opening hours for at midnight
 * @param dbDays Open hour for the week
 * @returns Array of dates for every opening hour
 */
export const getOpeningTimes = (startDate: Date, dbDays: Day[]) => {

  const dayOfWeek = startDate.getDay();
  const isToday = isEqual(startDate, new Date().setHours(0, 0, 0, 0));

  const today = dbDays.find((d) => d.dayOfWeek === dayOfWeek);

  if(!today) {
    throw new Error('Esse dia não existe no banco de dados.');
  }

  const opening = parse(today.openTime, 'kk:mm', startDate);
  const closing = parse(today.closedTime, 'kk:mm', startDate);

  let hours: number;
  let minutes: number;
  
  if(today) {
    //Round the current time to the nearest interval. If the are no more scheduling(bookings), today throw an error

    const rounded = roundedToNearestMinutes(now, CALENDAR_OPENING_HOURS_INTERVAL)
    const tooLate = !isBefore(rounded, closing);

    if(tooLate) {
      throw new Error('Sem mais agendamentos hoje'); //no more booking today
    }
    console.log('rounded', rounded);
    
    const isBeforeOpening  = isBefore(rounded, opening);
    
    hours = getHours(isBeforeOpening ? opening : rounded)
    minutes = getMinutes(isBeforeOpening ? opening : rounded)


  }
  else {
    hours = getHours(opening);
    minutes = getMinutes(opening);
  
  }


  const beginning = add(startDate, {hours, minutes});
  const end = add(startDate, {hours: getHours(closing)});
  const interval = CALENDAR_OPENING_HOURS_INTERVAL;

  //from beginning to end, every interval, generate a date and put that into array
  const times = [];
  for(let i = beginning; i <= end; i = add(i, {minutes: interval}) ) {
    times.push(i);
  }

  return times;



}