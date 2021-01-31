import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommandName, GithubResponse, SearchService } from '../search.service';

@Component({
  selector: 'app-search-home',
  templateUrl: './search-home.component.html',
})
export class SearchHomeComponent {
  constructor(private searchService: SearchService) {}
  // eslint-disable-next-line @typescript-eslint/unbound-method
  control = new FormControl('', [Validators.required]);
  searchResults$: Observable<GithubResponse> = this.searchService.searchResults$.pipe(
    tap((res) => console.log(res))
  );

  command = CommandName;
  onSubmit(): void {
    this.searchService.onSearch(this.control.value);
  }

  goToNextPage(nextPage: number): void {
    this.searchService.goToNextPage(nextPage);
  }

  //TSC really didnt  like me typing my event as EVENT
  // probs because I have strict mode on
  //eslint-disable-next-line
  sortAndOrder(event: any): void {
    //eslint-disable-next-line
    this.searchService.onSortAndOrder(event.target.value);
  }
}
