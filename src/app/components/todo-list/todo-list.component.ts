import { Component, inject, OnInit } from '@angular/core';
import { Todo, TodoService } from '../../services/todo.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TodoFormComponent } from '../todo-form/todo-form.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css'
})
export class TodoListComponent implements OnInit {
  private todoService = inject(TodoService);
  todos: Todo[] = [];

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.todoService.getTodos().subscribe({
      next: (data) => this.todos = data,
      error: (error) => console.error('Error loading todos:', error)
    });
  }

  deleteTodo(id?: number) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this todo?')) {
      this.todoService.delete(id).subscribe({
        next: () => this.loadTodos(),
        error: (error) => console.error('Error deleting todo:', error)
      });
    }
  }

  toggleStatus(todo: Todo) {
    if (!todo.id) return;
    
    const updatedTodo = { ...todo, is_done: !todo.is_done };
    console.log('Sending update for todo:', todo.id, 'Payload:', updatedTodo);
    
    this.todoService.update(todo.id, updatedTodo).subscribe({
      next: () => this.loadTodos(),
      error: (error) => {
        console.error('Error updating todo:', error);
        console.error('Error details:', error.error);
      }
    });
  }

  trackByTodo(index: number, todo: Todo): number {
    return todo.id || index;
  }
}
