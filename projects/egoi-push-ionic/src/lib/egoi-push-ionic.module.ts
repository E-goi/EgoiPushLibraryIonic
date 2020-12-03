import { EgoiPushIonicService } from './egoi-push-ionic.service';
import { NgModule, InjectionToken } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx'

export interface EgoiApp {
    apiKey: string;
    appId: number;
    os: string;
    twoStepsField?: string | undefined;
    twoStepsValue?: string | undefined;
    deepLinkHandler?: any | undefined;
}
 
export const EgoiAppService = new InjectionToken<EgoiApp>('EgoiApp');

@NgModule({
    providers : [
        HTTP
    ]
})

export class EgoiPushIonicModule {
  static forRoot(config: EgoiApp) {
    return {
      ngModule: EgoiPushIonicModule,
      providers: [
        EgoiPushIonicService,
        {
          provide: EgoiAppService,
          useValue: config
        }
      ]
    };
  }
}