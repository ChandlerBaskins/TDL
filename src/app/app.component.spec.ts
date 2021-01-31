import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

describe('AppComp', () => {
  let spectator: Spectator<AppComponent>;
  const createComponent = createComponentFactory({
    component: AppComponent,
    imports: [AppRoutingModule],
  });

  beforeEach(() => (spectator = createComponent()));

  it('should render', () => {
    expect(spectator.component).toBeTruthy();
  });
});
