import {
  createHttpFactory,
  HttpMethod,
  SpectatorHttp,
} from '@ngneat/spectator';
import { last } from 'rxjs/operators';
import {
  GithubResponse,
  Item,
  RawGitHubResponse,
  SearchService,
  SpecificUser,
  Status,
} from './search.service';

describe('SearchService', () => {
  let spectator: SpectatorHttp<SearchService>;
  const createHttp = createHttpFactory({
    service: SearchService,
  });

  beforeEach(() => (spectator = createHttp()));

  describe('SierraDeviceService.searchResults$', () => {
    it('should make a successful http call with no items', () => {
      const result: RawGitHubResponse = {
        incomplete_results: true,
        items: [],
        pagingModel: { currentPage: 1, totalPages: 1 },
        total_count: 1,
      };
      const firstResult: GithubResponse = {
        data: {},
        errorMessage: '',
        status: Status.Loading,
      } as GithubResponse;
      spectator.service.searchResults$.subscribe({
        next: (res) => expect(res).toEqual(firstResult),
        error: (res) => console.log(res),
      });
      spectator.service.onSearch('Chandler');
      const firstReq = spectator.expectOne(
        'https://api.github.com/search/users?q=Chandler&per_page=10&page=1&sort=&order=desc',
        HttpMethod.GET
      );

      firstReq.flush(result);
    });
    it('should make a successful http call and return correct user', () => {
      const userResult: SpecificUser = {
        login: 'ChandlerBaskins',
        id: 43590431,
        node_id: 'MDQ6VXNlcjQzNTkwNDMx',
        avatar_url: 'https://avatars.githubusercontent.com/u/43590431?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/ChandlerBaskins',
        html_url: 'https://github.com/ChandlerBaskins',
        followers_url: 'https://api.github.com/users/ChandlerBaskins/followers',
        following_url:
          'https://api.github.com/users/ChandlerBaskins/following{/other_user}',
        gists_url:
          'https://api.github.com/users/ChandlerBaskins/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/ChandlerBaskins/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/ChandlerBaskins/subscriptions',
        organizations_url: 'https://api.github.com/users/ChandlerBaskins/orgs',
        repos_url: 'https://api.github.com/users/ChandlerBaskins/repos',
        events_url:
          'https://api.github.com/users/ChandlerBaskins/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/ChandlerBaskins/received_events',
        type: 'User',
        site_admin: false,
        name: 'Chandler Baskins',
        company: '@nsideapp',
        blog: 'nside.io',
        location: 'Alabama',
        email: null,
        hireable: null,
        bio: "Tired Father of 3. I'm getting there. ",
        twitter_username: null,
        public_repos: 32,
        public_gists: 0,
        followers: 10,
        following: 37,
        created_at: '2018-09-25T23:13:29Z',
        updated_at: '2021-01-31T02:42:25Z',
      };
      const result: RawGitHubResponse = {
        total_count: 1,
        incomplete_results: false,
        items: [
          {
            login: 'ChandlerBaskins',
            id: 43590431,
            node_id: 'MDQ6VXNlcjQzNTkwNDMx',
            avatar_url: 'https://avatars.githubusercontent.com/u/43590431?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/ChandlerBaskins',
            html_url: 'https://github.com/ChandlerBaskins',
            followers_url:
              'https://api.github.com/users/ChandlerBaskins/followers',
            following_url:
              'https://api.github.com/users/ChandlerBaskins/following{/other_user}',
            gists_url:
              'https://api.github.com/users/ChandlerBaskins/gists{/gist_id}',
            starred_url:
              'https://api.github.com/users/ChandlerBaskins/starred{/owner}{/repo}',
            subscriptions_url:
              'https://api.github.com/users/ChandlerBaskins/subscriptions',
            organizations_url:
              'https://api.github.com/users/ChandlerBaskins/orgs',
            repos_url: 'https://api.github.com/users/ChandlerBaskins/repos',
            events_url:
              'https://api.github.com/users/ChandlerBaskins/events{/privacy}',
            received_events_url:
              'https://api.github.com/users/ChandlerBaskins/received_events',
            type: 'User',
            site_admin: false,
            score: 1,
          },
        ],
      };

      const firstResult: GithubResponse = {
        data: {},
        status: Status.Loading,
        errorMessage: '',
      } as GithubResponse;

      const finalResult: GithubResponse = {
        data: {
          incomplete_results: false,
          total_count: 1,
          items: [{ ...result.items[0], user: { ...userResult } }],
        },
        errorMessage: '',
        status: Status.Success,
      };
      spectator.service.searchResults$.pipe(last()).subscribe({
        next: (res) => expect(res).toBe(finalResult),
        error: (res) => console.log(res),
      });
      spectator.service.onSearch('Chandler');
      const firstReq = spectator.expectOne(
        'https://api.github.com/search/users?q=Chandler&per_page=10&page=1&sort=&order=desc',
        HttpMethod.GET
      );

      firstReq.flush(result);

      const secondReq = spectator.expectOne(
        'https://api.github.com/users/ChandlerBaskins',
        HttpMethod.GET
      );

      secondReq.flush(userResult);
    });
  });
});
