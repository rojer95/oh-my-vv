import "dayjs/locale/zh-cn";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import IsTomorrow from "dayjs/plugin/isTomorrow";
import IsYesterday from "dayjs/plugin/isYesterday";
import isoWeek from "dayjs/plugin/isoWeek";
import isToday from "dayjs/plugin/isToday";
import dayOfYear from "dayjs/plugin/dayOfYear";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isToday);
dayjs.extend(IsTomorrow);
dayjs.extend(IsYesterday);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);

dayjs.locale("zh-cn");
