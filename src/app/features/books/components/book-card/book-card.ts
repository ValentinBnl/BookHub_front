import { Component, input } from '@angular/core';
import { Book } from '../../../../shared/models/book.model';
import { BadgeComponent } from '../../../../shared/components/badge/badge';
import { BookCoverComponent } from '../../../../shared/components/book-cover/book-cover';

@Component({
  selector: 'app-book-card',
  imports: [BadgeComponent, BookCoverComponent],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css',
})
export class BookCardComponent {
  book = input.required<Book>();
}
