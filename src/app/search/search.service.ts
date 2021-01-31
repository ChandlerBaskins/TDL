import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, of, Subject } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';

export enum Sort {
  Followers = 'followers',
  Repositories = 'repositories',
  Joined = 'joined',
  BestMatch = '',
}

export enum CommandName {
  BestMatch = 'bestMatch',
  MostFollowers = 'mostFollowers',
  LeastFollowers = 'leastFollowers',
  MostRecentJoin = 'mostRecentJoin',
  LeastRecentJoin = 'leastRecentJoin',
  MostRepos = 'mostRepos',
  LeastRepos = 'leastRepos',
}

interface Command {
  bestMatch: { order: 'desc'; sort: Sort.BestMatch };
  mostFollowers: { order: 'desc'; sort: Sort.Followers };
  leastFollowers: { order: 'asc'; sort: Sort.Followers };
  mostRecentJoin: { order: 'desc'; sort: Sort.Joined };
  leastRecentJoin: { order: 'asc'; sort: Sort.Joined };
  mostRepos: { order: 'desc'; sort: Sort.Repositories };
  leastRepos: { order: 'asc'; sort: Sort.Repositories };
}

export interface SortAndOrder {
  order: 'desc' | 'asc';
  sort: Sort;
}

export interface Item {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  score: number;
  user?: SpecificUser;
}

export interface SpecificUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: string;
  blog: string;
  location: string;
  email?: any;
  hireable?: any;
  bio: string;
  twitter_username?: any;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface RawGitHubResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Item[];
  pagingModel?: {
    totalPages: number;
    currentPage: number;
  };
}

export enum Status {
  Loading = 'loading',
  Error = 'error',
  Success = 'success',
}

export interface GithubResponse {
  data: RawGitHubResponse;
  status: Status;
  errorMessage: string;
}

const initSort: SortAndOrder = { order: 'desc', sort: Sort.BestMatch };
const pageSize = 10;

const commandBook: Command = {
  bestMatch: { order: 'desc', sort: Sort.BestMatch },
  mostFollowers: { order: 'desc', sort: Sort.Followers },
  leastFollowers: { order: 'asc', sort: Sort.Followers },
  mostRecentJoin: { order: 'desc', sort: Sort.Joined },
  leastRecentJoin: { order: 'asc', sort: Sort.Joined },
  mostRepos: { order: 'desc', sort: Sort.Repositories },
  leastRepos: { order: 'asc', sort: Sort.Repositories },
};

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private http: HttpClient) {}
  private searchTerm$ = new Subject<string>();
  private sortResults$ = new BehaviorSubject<SortAndOrder>(initSort);
  private pageNumber$ = new BehaviorSubject<number>(1);

  searchResults$ = combineLatest([
    this.searchTerm$.pipe(
      distinctUntilChanged(),
      tap(() => this.pageNumber$.next(1))
    ),
    this.sortResults$.pipe(tap(() => this.pageNumber$.next(1))),
    this.pageNumber$,
  ]).pipe(
    switchMap(([searchTerm, sortResults, pageNumber]) => {
      const params = {
        params: new HttpParams()
          .set('q', searchTerm)
          .set('per_page', String(pageSize))
          .set('page', String(pageNumber))
          .set('sort', sortResults.sort)
          .set('order', sortResults.order),
      };

      return this.http
        .get<RawGitHubResponse>('https://api.github.com/search/users', params)
        .pipe(
          catchError(() => {
            const fallback: RawGitHubResponse = {
              incomplete_results: true,
              items: [],
              total_count: 0,
              pagingModel: { currentPage: 1, totalPages: 1 },
            };
            return of(fallback);
          }),
          switchMap((rawResponse) =>
            forkJoin(
              rawResponse.items.map((item) =>
                this.http.get<SpecificUser>(item.url).pipe(
                  map((user) => ({
                    ...item,
                    user,
                  }))
                )
              )
            ).pipe(
              map(
                (allData) =>
                  ({
                    ...rawResponse,
                    items: allData,
                  } as RawGitHubResponse)
              )
            )
          ),

          map((gitHubRes) =>
            this.calculatePagingModel(gitHubRes, pageNumber.toString())
          ),
          map(
            (res) =>
              ({
                data: res,
                status: Status.Success,
                errorMessage: '',
              } as GithubResponse)
          ),
          startWith({
            data: {},
            status: Status.Loading,
            errorMessage: '',
          } as GithubResponse),
          catchError((err: HttpErrorResponse) => {
            if (err.status === 403) {
              return of({
                data: {},
                errorMessage: 'Please wait an hour before your next search!',
                status: Status.Error,
              } as GithubResponse);
            }
            console.log(err);
            return of({
              data: {},
              errorMessage: 'Something went wrong, please try again!',
              status: Status.Error,
            } as GithubResponse);
          })
        );
    })
  );

  ////////HELPER METHODS

  onSortAndOrder(command: CommandName): void {
    const sortCommand: SortAndOrder = commandBook[command];
    this.sortResults$.next(sortCommand);
  }
  onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  goToNextPage(pageNumber: number): void {
    this.pageNumber$.next(pageNumber);
  }

  private calculatePagingModel(
    response: RawGitHubResponse,
    currentPage: string
  ): RawGitHubResponse {
    const { total_count } = response;
    const totalPages =
      total_count % pageSize === 0
        ? total_count / pageSize
        : Math.ceil(total_count / pageSize);
    const pagingModel = {
      totalPages,
      currentPage: Number(currentPage),
    };
    return { ...response, pagingModel };
  }
}
