/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  isBefore,
  isAfter
} from 'date-fns';

import '.././Styles/globals.css';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Calendar({ setDateData }) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(format(today, 'MMM-yyyy'));
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const firstDayCurrentMonth = parse(selectedMonth, 'MMM-yyyy', new Date());

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth)
  });

  const fetchSchedule = async () => {
    const day = new Date(selectedMonth);
    try {
      await axios
        .get(
          `/date-schedule?year=${day.getFullYear()}&month=${day.getMonth()}&sort=date`
        )
        .then(res => {
          setScheduleData(prev => [...prev, res.data.data.data]);
          setIsLoading(false);
        });
    } catch (err) {
      console.log(err);
    }
  };

  const findFirstAvailability = selectedDay => {
    let curDate = selectedDay;
    const index = curDate.getMonth() - today.getMonth();
    if (scheduleData.length > index) {
      while (
        scheduleData[curDate.getMonth() - today.getMonth()][
          curDate.getDate() - 1
        ].isFull
      ) {
        curDate.setDate(curDate.getDate() + 1);
      }
      setSelectedDay(curDate);
      setSelectedMonth(format(curDate, 'MMM-yyyy'));
      setDateData(
        scheduleData[getIndex(today, format(curDate, 'MMM-yyyy'))][
          curDate.getDate() - 1
        ]
      );
    }
  };

  useEffect(() => {
    if (getIndex(today, selectedMonth) >= scheduleData.length) {
      fetchSchedule();
    } else {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    findFirstAvailability(selectedDay);
  }, [scheduleData]);

  function previousMonth() {
    const firstDayPreviousMonth = add(firstDayCurrentMonth, { months: -1 });
    if (firstDayPreviousMonth.getMonth() === today.getMonth()) {
      findFirstAvailability(today);
    } else {
      findFirstAvailability(firstDayPreviousMonth);
    }
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    if (
      firstDayNextMonth.getMonth() - today.getMonth() >=
      scheduleData.length
    ) {
      setIsLoading(true);
      setSelectedDay(firstDayNextMonth);
      setSelectedMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    } else {
      findFirstAvailability(firstDayNextMonth);
    }
  }

  function handleOnClick(day) {
    setSelectedDay(day);
    setDateData(
      scheduleData[getIndex(today, selectedMonth)][day.getDate() - 1]
    );
  }
  return (
    <div className="pt-5 m-bottom--32">
      <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6">
        <div className="md:grid md:grid-cols-1 md:divide-x md:divide-gray-200 border">
          <div className="md:pr-0">
            <div className="flex items-center pd-1 border-bottom">
              <h2 className="flex-auto font-semibold text-gray-800">
                {format(firstDayCurrentMonth, 'MMM yyyy')}
              </h2>
              <button
                type="button"
                onClick={previousMonth}
                className={
                  '-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 none-border ' +
                  (selectedMonth === format(today, 'MMM-yyyy')
                    ? 'text-gray-200'
                    : 'hover:text-gray-500')
                }
                disabled={selectedMonth === format(today, 'MMM-yyyy')}
              >
                <span className="sr-only">Previous month</span>
                <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={nextMonth}
                type="button"
                className={
                  '-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 none-border ' +
                  (getIndex(today, selectedMonth) > 0
                    ? 'text-gray-200'
                    : 'hover:text-gray-500')
                }
                disabled={getIndex(today, selectedMonth) > 0}
              >
                <span className="sr-only">Next month</span>
                <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-7 mt-5 text-xs leading-6 text-center text-gray-1300">
              <div>S</div>
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
            </div>
            {!isLoading ? (
              <div className="grid grid-cols-7 mt-2 mb-2 text-sm">
                {days.map((day, dayIdx) => (
                  <div
                    key={day.toString()}
                    className={classNames(
                      dayIdx === 0 && colStartClasses[getDay(day)],
                      'py-1.5'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleOnClick(day)}
                      disabled={
                        !isLoading &&
                        (isToday(day) ||
                          isBefore(day, today) ||
                          scheduleData[getIndex(today, selectedMonth)][
                            day.getDate() - 1
                          ].isFull)
                      }
                      className={classNames(
                        isEqual(day, selectedDay) && 'text-white',
                        !isEqual(day, selectedDay) &&
                          isToday(day) &&
                          'text-red-500 text-underline',
                        !isEqual(day, selectedDay) &&
                          isAfter(day, today) &&
                          !scheduleData[getIndex(today, selectedMonth)][
                            day.getDate() - 1
                          ].isFull &&
                          'text-blue-700 blue-border',
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          !isSameMonth(day, firstDayCurrentMonth) &&
                          'text-gray-400',
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          'bg-red-500',
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          'bg-blue-500',
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          !isBefore(day, today) &&
                          !scheduleData[getIndex(today, selectedMonth)][
                            day.getDate() - 1
                          ].isFull &&
                          'hover:bg-gray-200',
                        (isEqual(day, selectedDay) || isToday(day)) &&
                          'font-semibold',
                        (isBefore(day, today) ||
                          scheduleData[getIndex(today, selectedMonth)][
                            day.getDate() - 1
                          ].isFull) &&
                          'text-gray-400',
                        'mx-auto flex h-10 w-10 items-center justify-center rounded-full none-border font--bold'
                      )}
                    >
                      <time dateTime={format(day, 'yyyy-MM-dd')}>
                        {format(day, 'd')}
                      </time>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 mt-2 mb-2 text-sm">
                {Array(35)
                  .fill(1)
                  .map((el, index) => (
                    <div className="py-1.5" key={index}>
                      <button className="mx-auto flex h-10 w-10 bg-gray-100 justify-center items-center rounded-full"></button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7'
];

const getIndex = (today, cur) => {
  return new Date(cur).getMonth() - today.getMonth();
};

export default Calendar;
