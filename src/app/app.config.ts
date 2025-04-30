import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, RouterModule, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations, BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes,withViewTransitions()),provideClientHydration(),provideAnimations(), provideClientHydration(),
    provideHttpClient(withFetch()),importProvidersFrom(RouterModule,BrowserAnimationsModule,HttpClientModule ),
  ]
};
