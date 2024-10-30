import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StateService } from "./state.service";
import { JsonPipe } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'state-management';
  private readonly fb = inject(FormBuilder);

  protected form = this.fb.group({
    newItem: ['', [Validators.required], { updateOn: 'blur' }]
  });

  protected readonly state = inject(StateService)

  protected addItem() {
    this.state.add$.next({
      item: { name: this.form.get('newItem')?.value ?? '' },
      id: uuid()
    });
    this.form.get('newItem')?.reset();
  }
}
