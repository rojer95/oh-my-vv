import { api } from "@/api";
import { ProfileType, STORAGE_AUTH_KEY } from "@rojer/mf-common";
import { makeAutoObservable } from "mobx";
import { router } from "../config/route";

class AdminModel {
  logined = false;
  autoLogining = false;
  loading = false;
  profile: ProfileType | undefined = undefined;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  *autoLogin() {
    this.autoLogining = true;
    const hasToken = !!(
      localStorage[STORAGE_AUTH_KEY] || sessionStorage[STORAGE_AUTH_KEY]
    );

    if (hasToken) {
      const success: boolean = yield this.loadProfile();

      // 自动登录成功，跳转到首页
      if (success && router?.state?.location?.pathname === "/") {
        router?.navigate?.("/dashboard", { replace: true });
      }
    }

    if (router?.state?.location?.pathname !== "/" && !this.logined) {
      router?.navigate?.("/", { replace: true });
    }

    this.autoLogining = false;
  }

  *loadProfile() {
    try {
      this.loading = true;
      const { data, error } = yield api.api.v1.auth.profile.get();
      if (error) throw error.value;
      this.profile = data;
      this.logined = true;
    } catch (error) {
      this.logined = false;
      localStorage.removeItem(STORAGE_AUTH_KEY);
      sessionStorage.removeItem(STORAGE_AUTH_KEY);
      router?.navigate?.("/", { replace: true });
    } finally {
      this.loading = false;
    }

    return this.logined;
  }

  logout() {
    localStorage.removeItem(STORAGE_AUTH_KEY);
    sessionStorage.removeItem(STORAGE_AUTH_KEY);
    router?.navigate?.(`/`);
  }
}

const adminModel = new AdminModel();
export { adminModel };
