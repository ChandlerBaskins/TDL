import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GithubResponse } from '../search.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
})
export class SearchResultsComponent {
  @Input() searchResults = {} as GithubResponse;
  @Output() changePage = new EventEmitter();
  @Output() changeSort = new EventEmitter();

  goToNextPage(): void {
    const currentPage = this.searchResults.data.pagingModel.currentPage;
    this.changePage.emit(currentPage + 1);
  }

  goToLastPage(): void {
    const currentPage = this.searchResults.data.pagingModel.currentPage;
    this.changePage.emit(currentPage - 1);
  }
}
