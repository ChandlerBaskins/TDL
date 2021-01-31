import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

describe('ButtonComponent', () => {
  let spectator: Spectator<AppComponent>;
  const createComponent = createComponentFactory({
    component: AppComponent,
    imports: [AppRoutingModule],
  });

  beforeEach(() => (spectator = createComponent()));

  it('should have a success class by default', () => {
    expect(spectator.component).toBeTruthy();
  });
});
