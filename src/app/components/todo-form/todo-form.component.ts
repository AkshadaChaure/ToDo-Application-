import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Todo, TodoService } from '../../services/todo.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.css'
})

export class TodoFormComponent implements OnInit {
  private todoService = inject(TodoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form!: FormGroup;
  isEdit = false;
  todoId?: number;
  isSubmitting = false;

  ngOnInit() {
    console.log('TodoFormComponent ngOnInit');
    
    this.form = new FormGroup({
      title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
      description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      is_done: new FormControl(false, { nonNullable: true })
    });

    this.todoId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Todo ID from route:', this.todoId);
    
    if (this.todoId) {
      this.isEdit = true;
      console.log('Loading todo for edit:', this.todoId);
      this.todoService.getTodo(this.todoId).subscribe({
        next: (todo) => {
          console.log('Todo loaded:', todo);
          this.form.patchValue(todo);
        },
        error: (error) => {
          console.error('Error loading todo:', error);
        }
      });
    } else {
      console.log('Creating new todo');
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const data: Todo = this.form.value;
    
    console.log('Form data being sent:', data);

    if (this.isEdit && this.todoId) {
      console.log('Updating todo ID:', this.todoId, 'with data:', data);
      this.todoService.update(this.todoId, data).subscribe({
        next: () => {
          console.log('Todo updated successfully');
          this.router.navigate(['/todos']);
        },
        error: (error) => {
          console.error('Error updating todo:', error);
          console.error('Error details:', error.error);
          this.isSubmitting = false;
        }
      });
    } else {
      console.log('Creating new todo with data:', data);
      this.todoService.create(data).subscribe({
        next: () => {
          console.log('Todo created successfully');
          this.router.navigate(['/todos']);
        },
        error: (error) => {
          console.error('Error creating todo:', error);
          console.error('Error details:', error.error);
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/todos']);
  }
}