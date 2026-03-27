export const environment = {
	production: true ,
	name: window['env' as any]['name' as any] as unknown as string,
	baseUrl: window['env' as any]['baseUrl'] as unknown as string,
	sqliteDBName: window['env' as any]['sqliteDBName' as any]  as unknown as string,
	deepLinkUrl: window['env' as any]['deepLinkUrl']  as unknown as string,
	privacyPolicyUrl: window['env' as any]['privacyPolicyUrl' as any]  as unknown as string,
	termsOfServiceUrl: window['env' as any]['termsOfServiceUrl' as any]  as unknown as string,
	recaptchaSiteKey: window['env' as any]['recaptchaSiteKey' as any]  as unknown as string,
	recaptchaSiteKeyOld: window['env' as any]['recaptchaSiteKeyOld']  as unknown as string,
	restictedPages: window['env' as any]['restictedPages'],
	unauthorizedRedirectUrl: window['env' as any]['unauthorizedRedirectUrl' as string]  as unknown as any,
	supportEmail: window['env' as any]['supportEmail' as any] as unknown as string,
	isAuthBypassed: window['env' as any]['isAuthBypassed'] as unknown as any,
	password: window['env' as any]['password']  as unknown as any,
	chatBaseUrl: window['env' as any]['chatBaseUrl']  as unknown as string,
    chatWebSocketUrl: window['env' as any]['chatWebSocketUrl'] as unknown as string
}
