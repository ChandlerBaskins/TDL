import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchRoutingModule } from './search-routing.module';
import { SearchHomeComponent } from './search-home/search-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchResultsComponent } from './search-results/search-results.component';

@NgModule({
  declarations: [SearchHomeComponent, SearchResultsComponent],
  imports: [
    CommonModule,
    FormsModule,
    SearchRoutingModule,
    ReactiveFormsModule,
  ],
  exports: [SearchHomeComponent],
})
export class SearchModule {}
