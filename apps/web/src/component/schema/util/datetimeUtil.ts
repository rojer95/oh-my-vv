import dayjs from "dayjs";

export const datetimeUtil = {
  formats: {
    date: "YYYY-MM-DD",
    dateRange: "YYYY-MM-DD",
    dateTime: "YYYY-MM-DD HH:mm:ss",
    dateTimeRange: "YYYY-MM-DD HH:mm:ss",
    month: "YYYY-MM",
    time: "HH:mm:ss",
  } as Record<string, string>,

  preset: [
    {
      text: "上周今日",
      start: dayjs().subtract(7, "d").startOf("date").toDate(),
      end: dayjs().subtract(7, "d").endOf("date").toDate(),
    },

    {
      text: "昨天",
      start: dayjs().subtract(1, "d").startOf("date").toDate(),
      end: dayjs().subtract(1, "d").endOf("date").toDate(),
    },

    {
      text: "今天",
      start: dayjs().startOf("date").toDate(),
      end: dayjs().endOf("date").toDate(),
    },
  ],

  presets: [
    {
      text: "今天",
      start: dayjs().startOf("day").toDate(),
      end: dayjs().endOf("day").toDate(),
    },
    {
      text: "本周",
      start: dayjs().startOf("week").toDate(),
      end: dayjs().endOf("week").toDate(),
    },
    {
      text: "本月",
      start: dayjs().startOf("month").toDate(),
      end: dayjs().endOf("month").toDate(),
    },
    {
      text: "今年",
      start: dayjs().startOf("year").toDate(),
      end: dayjs().endOf("year").toDate(),
    },
  ],

  format: (
    date: string | string[] | Date | Date[],
    type: string,
    linkString: string | boolean = "~"
  ): any => {
    if (Array.isArray(date)) {
      const dates = date.map((i) => datetimeUtil.format(i, type));
      if (typeof linkString === "string") return dates.join(linkString);
      return dates;
    }
    const format = datetimeUtil.formats[type || "dateTime"];
    const mdate = dayjs(date);
    if (mdate.isValid()) return mdate.format(format);
    return date;
  },
};
