import { inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { Observable, of } from "rxjs";
import { isPlatformBrowser } from "@angular/common";
import { Item } from "./state.service";

export const LOCAL_STORAGE = new InjectionToken<Storage>(
  'window local storage object',
  {
    providedIn: 'root',
    factory: () => {
      return isPlatformBrowser(inject(PLATFORM_ID)) ? window.localStorage : {} as Storage;
    },
  }
);

@Injectable({
  providedIn: 'root'
})

export class StorageService {

  private storage = inject(LOCAL_STORAGE);

  load(key: string): Observable<Item[] | null> {
    const data = this.storage?.getItem?.(key);
    return of(data ? JSON.parse(data) : null);
  }

  save(key: string, data: string) {
    this.storage?.setItem?.(key, data);
  }

  remove(key: string) {
    this.storage?.removeItem?.(key);
  }
}
