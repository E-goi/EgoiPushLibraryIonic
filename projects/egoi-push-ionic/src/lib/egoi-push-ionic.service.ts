import { Injectable, Inject } from '@angular/core';
import { EgoiAppService, EgoiApp } from './egoi-push-ionic.module';
import { Plugins, PushNotification, PushNotificationActionPerformed, PushNotificationToken } from '@capacitor/core'
import { HTTP } from '@ionic-native/http/ngx'
import { AlertController } from '@ionic/angular'
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx'

const { PushNotifications } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class EgoiPushIonicService {

  /**
     * Service Properties
     */
    private app: EgoiApp | undefined;
    private token: string = '';
    private contactId: string = '';
    private messageHash: string = '';
    private http: HTTP;
    private alerts: AlertController;
    private iab: InAppBrowser;

    /**
     * Endpoint configs
     */
    private apiEndpoint: string;
    private registerDeviceEndpoint: string;
    private eventsEndpoint: string;

    constructor(@Inject(EgoiAppService) private config: EgoiApp) {
        console.log('My config: ', config);

        this.apiEndpoint = 'https://dev-push-wrapper.egoiapp.com';
        this.registerDeviceEndpoint = '/token';
        this.eventsEndpoint = '/event';
        this.http = new HTTP();

        this.app = config;
        this.alerts = new AlertController();
        this.iab = new InAppBrowser();

        this.initFCM();
    }

    /**
     * @private
     * Logs an error to the console.
     * @param {String} error The error to log.
     */
    private logError(error : string): void {
        console.error('EgoiPushLib: ' + error);
    }

    /**
     * @private
     * Method called when there is a required field missing that should have been provided in the
     * init method.
     * @param field The name of the required field missing.
     * @returns Returns false.
     */
    private missingField(field: string): boolean {
        this.logError('Required field "' + field + '" missing, please provide it when calling the init() method.');
        return false;
    }

    /**
     * Call this method after providing all the required information (appID and API key) to register the device.
     *
     * @param twoStepsField The two steps field can also be provided here (overrides previously set values).
     * @param twoStepsValue The two steps value can also be provided here (overrides previously set values).
     *
     * @returns boolean The success state of registering the device.
     */
    registerDevice(twoStepsField?: string, twoStepsValue?: string) : any {
        if(this.app === undefined) {
            this.logError('Your app are not registered! Use register() function to set the credentials..');
            return;
        }
        // Required fields
        if (!this.app.appId) {
            return this.missingField('appId');
        }

        if (!this.token) {
            return this.missingField('token');
        }

        if (!this.app.apiKey) {
            return this.missingField('apiKey');
        }

        if (!this.app.os) {
            return this.missingField('os');
        }

        const payload: {
            api_key: string,
            app_id: number,
            token: string,
            os: string,
            two_steps_data?: {
                field: string,
                value: string
            } | undefined
        } = {
            api_key: this.app.apiKey,
            app_id: this.app.appId,
            token: this.token,
            os: this.app.os
        };

        if (twoStepsField) {
            this.app.twoStepsField = twoStepsField;
        }

        if (twoStepsValue) {
            this.app.twoStepsValue = twoStepsValue;
        }

        if (this.app.twoStepsField && this.app.twoStepsValue) {
            payload.two_steps_data = {
                field: this.app.twoStepsField,
                value: this.app.twoStepsValue
            };
        }

        console.log('Url:', this.apiEndpoint + this.registerDeviceEndpoint);
        console.log('Payload:', payload);

        this.http.post(this.apiEndpoint + this.registerDeviceEndpoint, payload, {})
            .then(
                (res) => {
                    const data = JSON.parse(res.data);
                    console.log('Payload:', data);

                    if (data.data === 'OK') {
                        this.presentRegistrationAlert('success').then();
                        return true;
                    } else {
                        this.presentRegistrationAlert('error').then();
                        return false;
                    }
                }
            );
    }

    /**
     * Show a success/failed notification, depending of the status of the registration of the device in the E-goi list
     * @param type - Type of alert (success/error)
     */
    async presentRegistrationAlert(type: string) {
        let alert;

        switch (type) {
            case 'success':
                alert = await this.alerts.create({
                    header: 'Alert',
                    subHeader: 'Device registered',
                    message: 'Successfully registered device on E-goi API.',
                    buttons: ['OK']
                });
                break;

            case 'error':
                alert = await this.alerts.create({
                    header: 'Alert',
                    subHeader: 'Failed to register',
                    message: 'There was a problem and we could not register your device on our database.',
                    buttons: ['OK']
                });
        }

        if(alert) {
            await alert.present();
        }
    }

    /**
     * Method called once a notification is received. Uses $ionicPopup to display the notification.
     *
     * @param notification -  An object with the information about the notification being displayed:
     *  - 'title' - the title of the notification.
     *  - 'cancelText' - the text for the cancel button.
     *  - 'okText' - the text for the ok button.
     *  - 'subTitle' - notification subtitle.
     *  - 'actions' - object that will be provided to _handleSuccessActions for handling the
     * action after clicking the success button.
     */
    async displayPush(notification : any) {
        const alertPush = await this.alerts.create({
            header: notification.title,
            message: notification.message,
            buttons: [
                {
                    text: 'Close',
                    role: 'cancel',
                    handler: () => {
                        this.sendEvent('canceled');
                    }
                },
                {
                    text: notification.okText,
                    handler: () => {
                        this.sendEvent('open', () => {
                            this.handleSuccessLink(notification.actions);
                        });
                    }
                }
            ]
        });

        await alertPush.present();
    }

    /**
     * Saves the provided token in local storage.
     * @param token The token to save.
     */
    private saveToken(token: string): void {
        this.token = token;
    }

    /**
     * Initiate the Firebase Cloud Messaging
     */
    private initFCM(): void {
        if(this.app === undefined) {
            this.logError('Your app are not registered! Use register() function to set the credentials..');
            return;
        }
        switch (this.app.os) {
            case 'ios':
                break;
            case 'android':
                break;
        }

        console.error('EgoiPushLib: ' + 'initFCM');

        PushNotifications.requestPermission().then(
            (result) => {
                if (result.granted) {
                    PushNotifications.register().then();
                }
            });

        PushNotifications.addListener('registration',
            (token: PushNotificationToken) => {
                this.saveToken(token.value);
            }
        );

        PushNotifications.addListener('registrationError',
            (error: any) => {
                alert('Error on registration: ' + JSON.stringify(error));
            }
        );

        PushNotifications.addListener('pushNotificationReceived',
            (notification: PushNotification) => {
                this.handleReceivedPush(notification);
            }
        );

        PushNotifications.addListener('pushNotificationActionPerformed',
            (notification: PushNotificationActionPerformed) => {
                this.handleReceivedPush(notification.notification);
            }
        );
    }

    /**
     * Handler for when a push notification is received.
     * @param payload - The payload received from the push notification.
     */
    private handleReceivedPush(payload : any) {
        if (typeof payload.data.data === 'string') {
            payload.data.data = JSON.parse(payload.data.data);
        }

        // Fetch and set the contact id and message hash from the received notification
        this.setContactId(payload.data.data.egoiCustomData.contactId || null);
        this.setMessageHash(payload.data.data.egoiCustomData.messageHash || null);

        const actions = payload.data.data.egoiCustomData.actions[0] || null;

        const notification = {
            title: payload.title || payload.data.data.notification.title || null,
            message: payload.body || payload.data.data.notification.body || null,
            okText: actions.text || 'View',
            actions: actions || {}
        };

        this.displayPush(notification).then();
    }

    /**
     * Call this method to send an event to the egoi web service API.
     *
     * @param event - The event identifier that will be sent in the payload of the request.
     * @param {Function} successCallback - Callback in case of success in the sendEvent request. Defaults to noop.
     */
    private sendEvent(event: string, successCallback?: any): boolean {
        if(this.app === undefined) {
            this.logError('Your app are not registered! Use register() function to set the credentials..');
            return false;
        }

        const payload = {
            api_key: this.app.apiKey,
            app_id: this.app.appId,
            contact: this.contactId,
            os: this.app.os,
            message_hash: this.messageHash,
            event,
            device_id: this.token
        };

        this.http.post(this.apiEndpoint + this.eventsEndpoint, payload, {})
            .then(
                (res) => {
                    if (successCallback) {
                        successCallback();
                    }

                    return res.data === 'OK';
                }
            );

        return false;
    }

    /**
     * Handles the action after the click on the success button of the push notification.
     *
     * @param configs - The configuration for the action after the click on the success button.
     */
    private handleSuccessLink(configs : any) {
        if(this.app === undefined) {
            this.logError('Your app are not registered! Use register() function to set the credentials..');
            return;
        }

        if (configs.type === 'http' || configs.type === 'url') {
            const browser = this.iab.create(configs.url, '_blank');
            browser.show();
        } else if (configs.type === 'deep') {
            this.app.deepLinkHandler(configs.url);
        }
    }

    /**
     * Set the contact id
     * @param id - Id of the contact (received in the push notification)
     */
    private setContactId(id: string) {
        this.contactId = id;
    }

    /**
     * Set the message hash
     * @param hash - Hash of the message (received in the push notification)
     */
    private setMessageHash(hash: string) {
        this.messageHash = hash;
    }
}
