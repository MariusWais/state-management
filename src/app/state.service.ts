import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { distinctUntilChanged, Subject } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { StorageService } from "./storage.service";

export type Item = {
  id: string,
  name: string
}

export type AddItem = { item: Pick<Item, 'name'>; id: Item['id'] };

export interface State {
  items: Item[],
  loaded: boolean,
  error: string | null
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private readonly storageService = inject(StorageService);
  private readonly storageKey = 'data';

  private state = signal<State>({
    items: [],
    loaded: false,
    error: null
  });

  // selectors
  items = computed(() => this.state().items);
  loaded = computed(() => this.state().loaded);

  // actions
  private loaded$ = this.storageService.load(this.storageKey);
  add$ = new Subject<AddItem>();
  remove$ = new Subject<string>();

  constructor() {
    // reducers
    this.loaded$.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe({
      next: (items) => {
        this.state.update((state) => ({
          ...state,
          items: items ?? [],
          loaded: true,
        }));
      },
      error: (err) => this.state.update((state) => ({ ...state, error: err }))
    });


    this.add$.pipe(takeUntilDestroyed()).subscribe((item) => {
      this.state.update((state) => ({
        ...state, items: [...state.items,
          {
            ...item.item,
            id: item.id
          }
        ]
      }))
    });

    this.remove$.pipe(takeUntilDestroyed()).subscribe((id) => {
        this.state.update((state) => ({
          ...state,
          items: state.items.filter((item) => item.id !== id),
        }))
      }
    );

    // effects
    effect(() => {
      if (this.loaded()) {
        this.storageService.save(this.storageKey, JSON.stringify(this.items()))
      }
    });
  }
}
