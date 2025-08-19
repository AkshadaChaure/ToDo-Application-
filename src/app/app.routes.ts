import { Routes } from '@angular/router';
import { TodoFormComponent } from './components/todo-form/todo-form.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'todos',
    pathMatch: 'full'
  },
  {
    path: 'todos',
    component: TodoListComponent
  },
  {
    path: 'todos/new',
    component: TodoFormComponent
  },
  {
    path: 'todos/:id/edit',
    component: TodoFormComponent
  },
  {
    path: '**', redirectTo: 'todos'
  }
];
