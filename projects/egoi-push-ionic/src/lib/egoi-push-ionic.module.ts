import { EgoiPushIonicService } from './egoi-push-ionic.service';
import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
 
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
  imports: [CommonModule, HttpClientModule, IonicModule]
})
export class EgoiPushIonicModule {
  static register(config: EgoiApp) {
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