import { range } from "lodash-es";
import dayjs from "dayjs";

export const getDisabledProps = (start?: Date, end?: Date) => {
  return {
    disabledTime: (date: Date) => {
      if (!start && !end) return false;
      return {
        disabledHours: () =>
          range(0, 23).filter((i) => {
            if (start && dayjs(date).hour(i).isBefore(start, "hour")) {
              return true;
            }

            if (end && dayjs(date).hour(i).isAfter(start, "hour")) {
              return true;
            }
            return false;
          }),
        disabledMinutes: (hour: number) =>
          range(0, 59).filter((i) => {
            if (
              start &&
              dayjs(date).hour(hour).minute(i).isBefore(start, "minute")
            ) {
              return true;
            }

            if (
              end &&
              dayjs(date).hour(hour).minute(i).isAfter(start, "minute")
            ) {
              return true;
            }
            return false;
          }),

        disabledSeconds: (hour: number, minute: number) =>
          range(0, 59).filter((i) => {
            if (
              start &&
              dayjs(date)
                .hour(hour)
                .minute(minute)
                .second(i)
                .isBefore(start, "second")
            ) {
              return true;
            }

            if (
              end &&
              dayjs(date)
                .hour(hour)
                .minute(minute)
                .second(i)
                .isAfter(start, "second")
            ) {
              return true;
            }
            return false;
          }),
      };
    },
    disabledDate: (date: Date) => {
      if (!start && !end) return false;

      if (start && dayjs(date).isBefore(start, "d")) {
        return true;
      }

      if (end && dayjs(date).isAfter(end, "d")) {
        return true;
      }

      return false;
    },
  };
};
