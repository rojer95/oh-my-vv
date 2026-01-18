import { api } from "@/api";
import { makeAutoObservable } from "mobx";

class NoticeModel {
  notices: any[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  *loadNotices() {
    this.notices = yield api.api.v1.notice.get();
  }
}

const noticeModel = new NoticeModel();
export { noticeModel };
