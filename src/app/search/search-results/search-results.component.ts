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
    const currentPage = this.searchResults?.data?.pagingModel?.currentPage
      ? this.searchResults?.data?.pagingModel?.currentPage
      : 1;

    this.changePage.emit(currentPage + 1);
  }

  goToLastPage(): void {
    // We wanna assign to two here so we go back to the first page
    const currentPage = this.searchResults?.data?.pagingModel?.currentPage
      ? this.searchResults?.data?.pagingModel?.currentPage
      : 2;
    this.changePage.emit(currentPage - 1);
  }
}
